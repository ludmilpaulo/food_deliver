// redux/slices/authSlice.ts

import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { loginUserService } from "../../services/authService"; // adjust as needed

export type BusinessProfile = {
  id: number;
  businessName: string;
  category: string;
  dashboardRoute: string;
  isApproved: boolean;
  isActive: boolean;
};

export interface User {
  user_id: number;
  username: string;
  name?: string; // Optional, as it might not be returned in all cases
  phone?: string; // Optional, as it might not be returned in all cases
  email?: string; // Optional, as it might not be returned in all cases
  token: string; // Optional, as it might not be returned in all cases
  role?: string;
  is_platform_admin?: boolean;
  is_customer: boolean;
  is_driver: boolean;
  business_profile?: BusinessProfile;
}

export type LoginResult = {
  access?: string;
  refresh?: string;
  token: string;
  user_id: number;
  username: string;
  role?: string;
  is_platform_admin?: boolean;
  is_customer: boolean;
  is_driver: boolean;
  message: string;
  business_profile?: BusinessProfile;
};

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  user_id: number | null;
  username: string | null;
  loading: boolean;
  error: string | null;
  message: string | null;
  hydratedFromStorage: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  user_id: null,
  username: null,
  loading: false,
  error: null,
  message: null,
  hydratedFromStorage: false,
};

// ---- Thunk for Login ----
export const loginUser = createAsyncThunk<
  LoginResult,
  // Arg type:
  { username: string; password: string },
  // ThunkAPI:
  { rejectValue: string }
>("auth/loginUser", async ({ username, password }, { rejectWithValue }) => {
  try {
    const data = await loginUserService(username, password);
    if (!data.token) {
      return rejectWithValue(data.message || "Erro desconhecido.");
    }
    return data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      return rejectWithValue(error.message || "Erro desconhecido.");
    }
    return rejectWithValue("Erro desconhecido.");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logoutUser(state) {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.user_id = null;
      state.username = null;
      state.loading = false;
      state.error = null;
      state.message = null;
      try {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      } catch {}
    },
    clearAuthMessage(state) {
      state.message = null;
      state.error = null;
    },
    hydrateAuthFromStorage(state) {
      if (typeof window === 'undefined') return;
      try {
        const tokenRaw = localStorage.getItem('auth_token');
        if (tokenRaw) {
          const token = JSON.parse(tokenRaw) as string | null;
          if (token) {
            state.token = token;
            const userRaw = localStorage.getItem('auth_user');
            if (userRaw) {
              const stored = JSON.parse(userRaw) as {
                user_id?: number;
                username?: string;
                role?: string;
                is_platform_admin?: boolean;
              };
              if (stored.user_id && stored.username) {
                state.user_id = stored.user_id;
                state.username = stored.username;
                state.user = {
                  user_id: stored.user_id,
                  username: stored.username,
                  token,
                  role: stored.role,
                  is_platform_admin: stored.is_platform_admin,
                  is_customer: true,
                  is_driver: false,
                };
              }
            }
          }
        }
      } catch {
        // ignore corrupt storage
      } finally {
        state.hydratedFromStorage = true;
      }
    },
    persistBookingSession(
      state,
      action: PayloadAction<{ accessToken: string; refreshToken?: string; username?: string }>,
    ) {
      const { accessToken, refreshToken, username } = action.payload;
      state.token = accessToken;
      state.refreshToken = refreshToken ?? null;
      try {
        localStorage.setItem('auth_token', JSON.stringify(accessToken));
        if (refreshToken) {
          localStorage.setItem('auth_refresh', JSON.stringify(refreshToken));
        }
        if (username) {
          localStorage.setItem(
            'auth_user',
            JSON.stringify({
              user_id: state.user_id,
              username,
            }),
          );
          state.username = username;
          if (state.user) {
            state.user.token = accessToken;
            state.user.username = username;
          } else {
            state.user = {
              user_id: state.user_id ?? 0,
              username,
              token: accessToken,
              is_customer: true,
              is_driver: false,
            };
          }
        }
      } catch {
        // ignore storage failures
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<LoginResult>) => {
        state.loading = false;
        const access = action.payload?.access || action.payload?.token;
        if (action.payload && access) {
          state.token = access;
          state.refreshToken = action.payload.refresh ?? null;
          try { localStorage.setItem("auth_token", JSON.stringify(access)); } catch {}
          try {
            localStorage.setItem(
              "auth_user",
              JSON.stringify({
                user_id: action.payload.user_id,
                username: action.payload.username,
                role: action.payload.role,
                is_platform_admin: action.payload.is_platform_admin,
              }),
            );
          } catch {}
          state.user = {
            user_id: action.payload.user_id,
            username: action.payload.username,
            token: access,
            role: action.payload.role,
            is_platform_admin: action.payload.is_platform_admin,
            is_customer: action.payload.is_customer,
            is_driver: action.payload.is_driver,
            business_profile: action.payload.business_profile,
          };
          state.user_id = action.payload.user_id;
          state.username = action.payload.username;
          state.message = action.payload.message || "Login com sucesso";
        } else {
          state.error = "Login failed";
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Erro desconhecido.";
      });
  },
});

export const { logoutUser, clearAuthMessage, hydrateAuthFromStorage, persistBookingSession } = authSlice.actions;

// User only
export const selectUser = (state: { auth: AuthState }) => state.auth.user;

export const selectAuthHydrated = (state: { auth: AuthState }) =>
  state.auth.hydratedFromStorage;

// Whole auth slice (status, errors, etc.)
export const selectAuth = (state: { auth: AuthState }) => state.auth;

export default authSlice.reducer;
