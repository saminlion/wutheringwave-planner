import logger from '@/utils/logger';

/**
 * Google Drive appDataFolder client (browser only, no backend).
 *
 * Auth uses the Google Identity Services *token* model: the browser gets a
 * short-lived access token straight from Google, so there is no client secret
 * and nothing to host. The scope is `drive.appdata` — a non-sensitive scope,
 * so the OAuth app needs no Google verification. The file lives in a hidden
 * per-app folder of the user's own Drive that they cannot see or delete by
 * accident, and that no other app can read.
 *
 * Trade-off: the token model has no refresh token. An access token lasts ~1h,
 * and getting a new one opens a popup, which browsers only allow from a user
 * gesture — hence `needsReconnect` in cloudSync instead of silent renewal.
 */

// The client ID is public by design (it ships in every page that signs in).
// The env var only exists so a fork can point at its own Cloud project.
export const CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '97986213844-q6ns3b5eqaqk5l7kusp1moc4vopsnbp4.apps.googleusercontent.com';

const SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const GIS_SRC = 'https://accounts.google.com/gsi/client';
const API = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';
export const SYNC_FILE_NAME = 'gameplanner-sync.json';

// sessionStorage, not localStorage: the token survives the reload that follows
// a download, but dies with the tab.
const TOKEN_KEY = 'cloudsync_token';

export class DriveAuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DriveAuthError';
  }
}

let gisPromise = null;
let tokenClient = null;
let pendingRequest = null; // { resolve, reject } of the requestToken() in flight

function loadGis() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (gisPromise) return gisPromise;

  gisPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GIS_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      gisPromise = null;
      reject(new Error('Failed to load Google Identity Services'));
    };
    document.head.appendChild(script);
  });
  return gisPromise;
}

export function getStoredToken() {
  try {
    const token = JSON.parse(sessionStorage.getItem(TOKEN_KEY));
    // 60s margin so a request never starts with a token about to expire
    if (token?.accessToken && token.expiresAt > Date.now() + 60_000) return token.accessToken;
  } catch {
    // corrupt entry — treat as no token
  }
  return null;
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

function settleRequest(error, token) {
  const request = pendingRequest;
  pendingRequest = null;
  if (!request) return;
  if (error) request.reject(error);
  else request.resolve(token);
}

function handleTokenResponse(response) {
  if (response.error) {
    settleRequest(new DriveAuthError(response.error_description || response.error));
    return;
  }
  if (!window.google.accounts.oauth2.hasGrantedAllScopes(response, SCOPE)) {
    settleRequest(new DriveAuthError('Google Drive access was not granted'));
    return;
  }
  sessionStorage.setItem(TOKEN_KEY, JSON.stringify({
    accessToken: response.access_token,
    expiresAt: Date.now() + Number(response.expires_in) * 1000,
  }));
  settleRequest(null, response.access_token);
}

function handleTokenError(error) {
  const message = error?.type === 'popup_failed_to_open'
    ? 'The Google sign-in popup was blocked. Allow popups for this site and try again.'
    : error?.type === 'popup_closed'
      ? 'Sign-in window was closed'
      : error?.message || 'Sign-in failed';
  settleRequest(new DriveAuthError(message));
}

/**
 * Load the GIS script and build the token client ahead of the click.
 *
 * Browsers only let a click open a popup if it opens right away. Fetching the
 * script (or anything else async) between the click and requestAccessToken()
 * spends that permission and the popup is blocked (`popup_failed_to_open`),
 * so whatever shows a sign-in button must call this first.
 */
export async function preloadGis() {
  await loadGis();
  if (!tokenClient) {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPE,
      callback: handleTokenResponse,
      error_callback: handleTokenError,
    });
  }
}

/**
 * Open Google's consent/account popup and get an access token.
 * Must be called synchronously from a click handler, after preloadGis().
 * @param {string} [loginHint] email of the previously connected account, skips the chooser
 */
export function requestToken(loginHint) {
  if (!tokenClient) {
    // Not ready yet: start loading so the next click works, and say so.
    preloadGis().catch(() => {});
    return Promise.reject(new DriveAuthError('Google sign-in is still loading. Please click again.'));
  }

  if (pendingRequest) handleTokenError({ message: 'Superseded by a new sign-in' });
  const promise = new Promise((resolve, reject) => {
    pendingRequest = { resolve, reject };
  });
  // Called synchronously, still inside the click's user activation.
  tokenClient.requestAccessToken({ prompt: '', login_hint: loginHint || undefined });
  return promise;
}

export async function revokeToken() {
  const token = getStoredToken();
  clearToken();
  if (!token) return;
  try {
    await loadGis();
    window.google.accounts.oauth2.revoke(token, () => {});
  } catch (error) {
    logger.warn('Token revoke failed:', error);
  }
}

async function driveFetch(url, options = {}) {
  const token = getStoredToken();
  if (!token) throw new DriveAuthError('Not connected to Google Drive');

  const response = await fetch(url, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${token}` },
  });

  if (response.status === 401) {
    clearToken();
    throw new DriveAuthError('Google Drive session expired');
  }
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Drive API ${response.status}: ${body.slice(0, 200)}`);
  }
  return response;
}

/** @returns {Promise<{ displayName: string, emailAddress: string, photoLink?: string } | null>} */
export async function getUser() {
  const response = await driveFetch(`${API}/about?fields=user(displayName,emailAddress,photoLink)`);
  const { user } = await response.json();
  return user || null;
}

/** @returns {Promise<{ id: string, modifiedTime: string } | null>} */
export async function findSyncFile() {
  const params = new URLSearchParams({
    spaces: 'appDataFolder',
    q: `name = '${SYNC_FILE_NAME}' and trashed = false`,
    fields: 'files(id,modifiedTime)',
    orderBy: 'modifiedTime desc',
    pageSize: '1',
  });
  const response = await driveFetch(`${API}/files?${params}`);
  const { files } = await response.json();
  return files?.[0] || null;
}

export async function downloadFile(fileId) {
  const response = await driveFetch(`${API}/files/${fileId}?alt=media`);
  return response.json();
}

/**
 * Create the sync file, or overwrite it when `fileId` is given.
 * @returns {Promise<{ id: string, modifiedTime: string }>}
 */
export async function uploadFile(content, fileId = null) {
  const body = JSON.stringify(content);

  if (fileId) {
    const response = await driveFetch(
      `${UPLOAD_API}/files/${fileId}?uploadType=media&fields=id,modifiedTime`,
      { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body }
    );
    return response.json();
  }

  const boundary = `gameplanner${Date.now()}`;
  const metadata = { name: SYNC_FILE_NAME, parents: ['appDataFolder'], mimeType: 'application/json' };
  const multipart =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\nContent-Type: application/json\r\n\r\n${body}\r\n` +
    `--${boundary}--`;

  const response = await driveFetch(
    `${UPLOAD_API}/files?uploadType=multipart&fields=id,modifiedTime`,
    { method: 'POST', headers: { 'Content-Type': `multipart/related; boundary=${boundary}` }, body: multipart }
  );
  return response.json();
}
