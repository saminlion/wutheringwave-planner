/**
 * Shared helpers for the Google OAuth serverless functions (`api/auth/*`).
 * Files under `api/_lib` are not deployed as endpoints — Vercel skips `_` paths.
 *
 * Why a server at all: the browser-only token flow needs a popup, which
 * popup blockers and extensions kill, and it has no refresh token, so users
 * had to reconnect every hour. The authorization-code flow avoids both, but
 * Google requires the client secret to redeem the code — hence these functions.
 * The refresh token lives in an httpOnly cookie scoped to /api/auth, so page
 * scripts never see it; the browser only ever holds 1h access tokens.
 */

// Public by design; the secret is what must stay server-side.
export const CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  '97986213844-q6ns3b5eqaqk5l7kusp1moc4vopsnbp4.apps.googleusercontent.com';

export const SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
export const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
export const TOKEN_URL = 'https://oauth2.googleapis.com/token';
export const REVOKE_URL = 'https://oauth2.googleapis.com/revoke';

export const REFRESH_COOKIE = 'gp_refresh';
export const STATE_COOKIE = 'gp_oauth_state';
const COOKIE_PATH = '/api/auth';
export const REFRESH_MAX_AGE = 180 * 24 * 60 * 60; // Google drops tokens unused for 6 months anyway
export const STATE_MAX_AGE = 10 * 60;

export function getClientSecret() {
  const secret = process.env.GOOGLE_CLIENT_SECRET;
  if (!secret) throw new Error('GOOGLE_CLIENT_SECRET is not set');
  return secret;
}

export function getOrigin(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || (host?.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

export function getRedirectUri(req) {
  return `${getOrigin(req)}/api/auth/callback`;
}

/** Only same-site paths — never let `returnTo` become an open redirect. */
export function safeReturnTo(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return '/settings';
  }
  return value;
}

export function serializeCookie(name, value, { maxAge, secure = true } = {}) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=${COOKIE_PATH}`,
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (secure) parts.push('Secure');
  if (maxAge !== undefined) parts.push(`Max-Age=${maxAge}`);
  return parts.join('; ');
}

export function clearCookie(name, secure = true) {
  return serializeCookie(name, '', { maxAge: 0, secure });
}

export function isSecure(req) {
  return getOrigin(req).startsWith('https://');
}

/** POST a form to Google's token endpoint; returns the parsed JSON body and status. */
export async function postToken(params) {
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  });
  const body = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, body };
}
