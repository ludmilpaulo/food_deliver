import { oauthRedirectUri, randomOAuthString } from '@/services/socialAuth';

describe('web social auth helpers', () => {
  it('builds an /oauth redirect on the current origin', () => {
    expect(oauthRedirectUri()).toMatch(/\/oauth$/);
  });

  it('creates a URL-safe random string', () => {
    const value = randomOAuthString(16);
    expect(value).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(value.length).toBeGreaterThan(10);
  });
});
