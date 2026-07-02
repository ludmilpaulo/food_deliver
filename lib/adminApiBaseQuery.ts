import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

import { readAuthToken } from '@/lib/authToken';
import { baseAPI } from '@/services/types';

type AdminBaseQuery = BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>;

type AuthRootState = {
  auth?: {
    token?: string | null;
  };
};

function resolveAuthToken(getState: () => unknown): string | null {
  const fromStorage = readAuthToken();
  if (fromStorage) return fromStorage;
  const state = getState() as AuthRootState;
  const fromRedux = state.auth?.token;
  return typeof fromRedux === 'string' && fromRedux.length > 0 ? fromRedux : null;
}

export function createAdminApiBaseQuery(apiPath: string): AdminBaseQuery {
  const rawBaseQuery = fetchBaseQuery({
    baseUrl: `${baseAPI}${apiPath}`,
    prepareHeaders: (headers, { getState }) => {
      headers.set('Content-Type', 'application/json');
      const token = resolveAuthToken(getState);
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  });

  return (args, api, extraOptions) => rawBaseQuery(args, api, extraOptions);
}
