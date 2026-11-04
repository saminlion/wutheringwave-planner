import { randomBytes } from 'node:crypto';
import {
  AUTH_URL, CLIENT_ID, SCOPE, STATE_COOKIE, STATE_MAX_AGE,
  getRedirectUri, safeReturnTo, serializeCookie, isSecure,
} from '../_lib/google.js';

/**
 * GET /api/auth/login?returnTo=/settings&login_hint=a@b.c
 * Sends the whole page to Google's consent screen (no popup to be blocked).
 */
export default function handler(req, res) {
  const state = randomBytes(16).toString('hex');
  const returnTo = safeReturnTo(req.query.returnTo);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: getRedirectUri(req),
    response_type: 'code',
    scope: SCOPE,
    // offline + consent: Google only issues a refresh token on an explicit consent
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state,
  });
  if (typeof req.query.login_hint === 'string') params.set('login_hint', req.query.login_hint);

  res.setHeader('Set-Cookie', serializeCookie(
    STATE_COOKIE,
    JSON.stringify({ state, returnTo }),
    { maxAge: STATE_MAX_AGE, secure: isSecure(req) }
  ));
  res.setHeader('Cache-Control', 'no-store');
  res.redirect(302, `${AUTH_URL}?${params}`);
}
