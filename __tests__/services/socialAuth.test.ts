import { oauthRedirectUri, randomOAuthString, signInWithFacebookWeb } from '@/services/socialAuth';

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

describe('signInWithFacebookWeb', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('fails fast on http pages instead of waiting on the blocked SDK', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ facebook_app_id: 'fb-app' }),
    }) as unknown as typeof fetch;

    expect(window.location.protocol).toBe('http:');
    await expect(signInWithFacebookWeb()).rejects.toThrow('Facebook sign-in requires HTTPS.');
    expect(document.getElementById('kudya-facebook-sdk')).toBeNull();
  });
});
