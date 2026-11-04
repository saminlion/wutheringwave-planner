import {
  REFRESH_COOKIE, REFRESH_MAX_AGE, CLIENT_ID,
  getClientSecret, serializeCookie, clearCookie, isSecure, postToken,
} from '../_lib/google.js';

/**
 * POST /api/auth/token → { access_token, expires_in }
 * Trades the refresh-token cookie for a fresh 1h access token. 401 means the
 * browser must sign in again (no cookie, or Google revoked/expired the grant).
 * SameSite=Lax keeps cross-site pages from triggering this with our cookie.
 */
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const secure = isSecure(req);
  const refreshToken = req.cookies?.[REFRESH_COOKIE];
  if (!refreshToken) return res.status(401).json({ error: 'not_signed_in' });

  try {
    const { ok, status, body } = await postToken({
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
      client_secret: getClientSecret(),
      grant_type: 'refresh_token',
    });

    if (!ok) {
      if (body.error === 'invalid_grant') {
        res.setHeader('Set-Cookie', clearCookie(REFRESH_COOKIE, secure));
        return res.status(401).json({ error: 'invalid_grant' });
      }
      return res.status(502).json({ error: body.error || `google_${status}` });
    }

    // Re-set the cookie so its lifetime slides with use
    res.setHeader('Set-Cookie', serializeCookie(
      REFRESH_COOKIE, body.refresh_token || refreshToken, { maxAge: REFRESH_MAX_AGE, secure }
    ));
    return res.status(200).json({ access_token: body.access_token, expires_in: body.expires_in });
  } catch (error) {
    console.error('Token refresh failed:', error);
    return res.status(500).json({ error: 'server_error' });
  }
}
