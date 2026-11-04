import { describe, it, expect } from 'vitest';
import { safeReturnTo, serializeCookie, getOrigin } from '../../api/_lib/google.js';

describe('safeReturnTo', () => {
  it('keeps same-site paths', () => {
    expect(safeReturnTo('/planner')).toBe('/planner');
    expect(safeReturnTo('/settings?tab=1')).toBe('/settings?tab=1');
  });

  it('refuses anything that could leave the site', () => {
    expect(safeReturnTo('https://evil.example')).toBe('/settings');
    expect(safeReturnTo('//evil.example')).toBe('/settings');
    expect(safeReturnTo('/\\evil.example')).toBe('/settings');
    expect(safeReturnTo(undefined)).toBe('/settings');
  });
});

describe('serializeCookie', () => {
  it('scopes the cookie to /api/auth and hides it from page scripts', () => {
    const cookie = serializeCookie('gp_refresh', 'abc', { maxAge: 60 });
    expect(cookie).toContain('Path=/api/auth');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Lax');
    expect(cookie).toContain('Secure');
    expect(cookie).toContain('Max-Age=60');
  });

  it('drops Secure for plain-http localhost', () => {
    expect(serializeCookie('a', 'b', { secure: false })).not.toContain('Secure');
  });
});

describe('getOrigin', () => {
  it('uses the forwarded host and protocol Vercel passes in', () => {
    expect(getOrigin({ headers: { 'x-forwarded-host': 'app.vercel.app', 'x-forwarded-proto': 'https' } }))
      .toBe('https://app.vercel.app');
    expect(getOrigin({ headers: { host: 'localhost:3000' } })).toBe('http://localhost:3000');
  });
});
