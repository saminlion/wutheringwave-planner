import { REFRESH_COOKIE, REVOKE_URL, clearCookie, isSecure } from '../_lib/google.js';

/**
 * POST /api/auth/logout
 * Revokes the grant at Google and drops the cookie. Data on Drive is kept.
 */
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const refreshToken = req.cookies?.[REFRESH_COOKIE];
  if (refreshToken) {
    try {
      await fetch(REVOKE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ token: refreshToken }),
      });
    } catch (error) {
      console.warn('Token revoke failed:', error);
    }
  }
  res.setHeader('Set-Cookie', clearCookie(REFRESH_COOKIE, isSecure(req)));
  return res.status(204).end();
}
