// redux/slices/authSlice.ts

import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { loginUserService } from "../../services/authService"; // adjust as needed

export interface User {
  user_id: number;
  username: string;
  name?: string; // Optional, as it might not be returned in all cases
  phone?: string; // Optional, as it might not be returned in all cases
  email?: string; // Optional, as it might not be returned in all cases
  token: string; // Optional, as it might not be returned in all cases
  is_customer: boolean;
  is_driver: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  user_id: number | null;
  username: string | null;
  loading: boolean;
  error: string | null;
  message: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  user_id: null,
  username: null,
  loading: false,
  error: null,
  message: null,
};

// ---- Thunk for Login ----
export const loginUser = createAsyncThunk<
  // Return type:
  { token: string; user_id: number; username: string; is_customer: boolean; is_driver: boolean; message: string },
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
  } catch (error: any) {
    return rejectWithValue(error.message || "Erro desconhecido.");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logoutUser(state) {
      state.user = null;
      state.token = null;
      state.user_id = null;
      state.username = null;
      state.loading = false;
      state.error = null;
      state.message = null;
    },
    clearAuthMessage(state) {
      state.message = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        if (action.payload && action.payload.token) {
          state.token = action.payload.token;
          state.user = {
            user_id: action.payload.user_id,
            username: action.payload.username,
            token: action.payload.token,
            is_customer: action.payload.is_customer,
            is_driver: action.payload.is_driver,
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

export const { logoutUser, clearAuthMessage } = authSlice.actions;

// User only
export const selectUser = (state: { auth: AuthState }) => state.auth.user;

// Whole auth slice (status, errors, etc.)
export const selectAuth = (state: { auth: AuthState }) => state.auth;

export default authSlice.reducer;
