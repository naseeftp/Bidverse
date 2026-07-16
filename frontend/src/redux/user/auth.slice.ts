import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from '@reduxjs/toolkit'; // is a ts type dscrb exactly wht actn look like when it carries data
import type { JwtPayload } from '../../types/auth.type'



interface AuthState {
  user: JwtPayload | null;
  role: "user" | "tenant" | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  tempAuthData: {
    email: string;
    role: string;
    phone: string;
  } | null;
  watchlistCount: number;
}
const token = localStorage.getItem("accessToken");
const decodeToken = (token: string): JwtPayload | null => {
  try {
    return JSON.parse(atob(token.split('.')[1])) as JwtPayload
  } catch {
    return null
  }
}
const initialUser = token ? decodeToken(token) : null

const initialState: AuthState = {
  user: initialUser,
  role: initialUser ? (initialUser.role as "user" | "tenant") : null,
  isAuthenticated: !!initialUser,
  loading: false,
  error: null,
  tempAuthData: null,
  watchlistCount: 0
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {

    setRegistrationData: (state, action: PayloadAction<{ email: string, role: string, phone: string }>) => {
      state.tempAuthData = action.payload;
      state.error = null
    },

    setAuthSuccess: (state, action: PayloadAction<JwtPayload>) => {
      state.user = action.payload;
      state.role = action.payload.role as "user" | "tenant";
      state.isAuthenticated = true;
      state.tempAuthData = null;
      state.error = null
    },
    setAuthError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },

    logout: (state) => {
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
      state.tempAuthData = null;
      state.watchlistCount = 0;
      localStorage.removeItem("accessToken")
    },
    setWatchlistCount: (state, action: PayloadAction<number>) => {
      state.watchlistCount = action.payload;
    },
    incrementWatchlistCount: (state) => {
      state.watchlistCount += 1;
    },
    decrementWatchlistCount: (state) => {
      state.watchlistCount = Math.max(0, state.watchlistCount - 1);
    }

  }
})

export const { setRegistrationData, setAuthSuccess, setAuthError, setLoading, logout, setWatchlistCount, decrementWatchlistCount, incrementWatchlistCount } = authSlice.actions
export default authSlice.reducer;