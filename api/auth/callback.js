import {
  REFRESH_COOKIE, REFRESH_MAX_AGE, SCOPE, STATE_COOKIE, CLIENT_ID,
  getClientSecret, getRedirectUri, safeReturnTo, serializeCookie, clearCookie, isSecure, postToken,
} from '../_lib/google.js';

function back(res, returnTo, result) {
  const separator = returnTo.includes('?') ? '&' : '?';
  res.setHeader('Cache-Control', 'no-store');
  res.redirect(302, `${returnTo}${separator}cloudsync=${encodeURIComponent(result)}`);
}

/**
 * GET /api/auth/callback?code=…&state=…  (Google redirects here)
 * Redeems the code, keeps the refresh token in an httpOnly cookie, and
 * returns to the page that started sign-in with ?cloudsync=ok|<error>.
 */
export default async function handler(req, res) {
  const secure = isSecure(req);
  let saved = null;
  try {
    saved = JSON.parse(req.cookies?.[STATE_COOKIE] || 'null');
  } catch {
    saved = null;
  }
  const returnTo = safeReturnTo(saved?.returnTo);
  const cookies = [clearCookie(STATE_COOKIE, secure)];

  // CSRF: the state must be the one this browser was sent off with
  if (!saved?.state || req.query.state !== saved.state) {
    res.setHeader('Set-Cookie', cookies);
    return back(res, returnTo, 'state_mismatch');
  }
  if (req.query.error) {
    res.setHeader('Set-Cookie', cookies);
    return back(res, returnTo, String(req.query.error));
  }

  try {
    const { ok, body } = await postToken({
      code: String(req.query.code || ''),
      client_id: CLIENT_ID,
      client_secret: getClientSecret(),
      redirect_uri: getRedirectUri(req),
      grant_type: 'authorization_code',
    });

    if (!ok) return finish(body.error || 'token_exchange_failed');
    if (!String(body.scope || '').split(' ').includes(SCOPE)) return finish('scope_not_granted');
    if (!body.refresh_token) return finish('no_refresh_token');

    cookies.push(serializeCookie(REFRESH_COOKIE, body.refresh_token, { maxAge: REFRESH_MAX_AGE, secure }));
    return finish('ok');
  } catch (error) {
    console.error('OAuth callback failed:', error);
    return finish('server_error');
  }

  function finish(result) {
    res.setHeader('Set-Cookie', cookies);
    back(res, returnTo, result);
  }
}
