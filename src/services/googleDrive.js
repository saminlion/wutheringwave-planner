/**
 * Google Drive appDataFolder client.
 *
 * Sign-in is a full-page redirect through our own Vercel functions
 * (`api/auth/*`): they run Google's authorization-code flow and keep the
 * refresh token in an httpOnly cookie. The page only ever asks
 * `/api/auth/token` for a short-lived access token, so there is no popup to
 * be blocked and no hourly "reconnect" — a session lasts until the user signs
 * out or Google revokes the grant.
 *
 * The scope is `drive.appdata` — a non-sensitive scope, so the OAuth app needs
 * no Google verification. The file lives in a hidden per-app folder of the
 * user's own Drive that they cannot see or delete by accident, and that no
 * other app can read.
 */

const API = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';
export const SYNC_FILE_NAME = 'gameplanner-sync.json';

export class DriveAuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DriveAuthError';
  }
}

// Memory only: a reload just asks the server again, which is cheap.
let accessToken = null;
let expiresAt = 0;
let inflight = null;

/**
 * Leave the page for Google's consent screen; it comes back to the current
 * path with `?cloudsync=ok` (or `?cloudsync=<error>`).
 * @param {string} [loginHint] email of the previously linked account, skips the chooser
 */
export function startSignIn(loginHint) {
  const params = new URLSearchParams({ returnTo: window.location.pathname });
  if (loginHint) params.set('login_hint', loginHint);
  window.location.assign(`/api/auth/login?${params}`);
}

/** A valid access token, refreshed through the server when needed. */
export function getAccessToken() {
  // 60s margin so a request never starts with a token about to expire
  if (accessToken && expiresAt > Date.now() + 60_000) return Promise.resolve(accessToken);
  if (inflight) return inflight;

  inflight = fetch('/api/auth/token', { method: 'POST', credentials: 'same-origin' })
    .then(async (response) => {
      if (response.status === 401) throw new DriveAuthError('Not signed in to Google Drive');
      // A non-JSON reply means the API is not deployed here (plain `npm run dev`).
      const body = await response.json().catch(() => {
        throw new Error('Sign-in server unavailable (run with `vercel dev` locally)');
      });
      if (!response.ok) throw new Error(`Token refresh failed: ${body.error || response.status}`);
      accessToken = body.access_token;
      expiresAt = Date.now() + Number(body.expires_in) * 1000;
      return accessToken;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export async function signOut() {
  accessToken = null;
  expiresAt = 0;
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
}

async function driveFetch(url, options = {}, retried = false) {
  const token = await getAccessToken();
  const response = await fetch(url, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${token}` },
  });

  if (response.status === 401) {
    // Revoked or expired early: drop it and let the server mint one, once.
    accessToken = null;
    if (!retried) return driveFetch(url, options, true);
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
