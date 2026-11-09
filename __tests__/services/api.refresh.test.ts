import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AxiosError } from 'axios';
import api, { AUTH_EXPIRED_EVENT, isPublicApiPath } from '@/services/api';
import { refreshAccessToken } from '@/lib/authToken';

jest.mock('@/lib/authToken', () => {
  const actual = jest.requireActual('@/lib/authToken');
  return { ...actual, refreshAccessToken: jest.fn() };
});

const mockedRefresh = refreshAccessToken as jest.MockedFunction<typeof refreshAccessToken>;

type Seen = { url?: string; auth?: string };

function installAdapter(validToken: string | null, seen: Seen[]): void {
  const adapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
    const auth = config.headers?.Authorization as string | undefined;
    seen.push({ url: config.url, auth });
    const ok = !auth || (validToken !== null && auth === `Bearer ${validToken}`);
    const publicOk = !auth && isPublicApiPath(config.url);
    const response: AxiosResponse = {
      data: ok || publicOk ? { ok: true } : { code: 'token_not_valid' },
      status: ok || publicOk ? 200 : 401,
      statusText: '',
      headers: {},
      config,
    };
    if (auth && !ok) {
      throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, response);
    }
    if (!auth && !isPublicApiPath(config.url)) {
      throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, { ...response, status: 401 });
    }
    return response;
  };
  api.defaults.adapter = adapter;
}

describe('api 401 handling', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('auth_token', JSON.stringify('expired'));
    mockedRefresh.mockReset();
  });

  it('refreshes the access token and retries once', async () => {
    const seen: Seen[] = [];
    installAdapter('fresh', seen);
    mockedRefresh.mockResolvedValue('fresh');

    const { data } = await api.post('/api/v1/partner/location/', { location: '1,2' });

    expect(data).toEqual({ ok: true });
    expect(mockedRefresh).toHaveBeenCalledTimes(1);
    expect(seen.map((s) => s.auth)).toEqual(['Bearer expired', 'Bearer fresh']);
  });

  it('clears the session and requests login when refresh fails on a protected endpoint', async () => {
    const seen: Seen[] = [];
    installAdapter(null, seen);
    mockedRefresh.mockResolvedValue(null);
    const listener = jest.fn();
    window.addEventListener(AUTH_EXPIRED_EVENT, listener);

    await expect(api.post('/api/v1/partner/location/', { location: '1,2' })).rejects.toBeInstanceOf(AxiosError);

    window.removeEventListener(AUTH_EXPIRED_EVENT, listener);
    expect(listener).toHaveBeenCalledTimes(1);
    expect((listener.mock.calls[0][0] as CustomEvent).detail).toEqual({ requiresLogin: true });
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(seen).toHaveLength(1);
  });

  it('falls back to an anonymous request for public catalog endpoints', async () => {
    const seen: Seen[] = [];
    installAdapter(null, seen);
    mockedRefresh.mockResolvedValue(null);
    const listener = jest.fn();
    window.addEventListener(AUTH_EXPIRED_EVENT, listener);

    const { data } = await api.get('/api/v1/food/stores/');

    window.removeEventListener(AUTH_EXPIRED_EVENT, listener);
    expect(data).toEqual({ ok: true });
    expect(seen.map((s) => s.auth)).toEqual(['Bearer expired', undefined]);
    expect((listener.mock.calls[0][0] as CustomEvent).detail).toEqual({ requiresLogin: false });
  });
});
