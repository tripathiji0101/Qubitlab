/**
 * QubitLab Auth Context
 *
 * Provides auth state, login/register/logout actions,
 * and a ProtectedRoute wrapper for the router.
 */

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { auth as authApi, setTokens, clearTokens, getAccessToken } from "./api";
import type { UserResponse } from "./api";

interface AuthState {
  user: UserResponse | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, experience_level?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  isAuthenticated: false,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Check existing token on mount
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      authApi
        .me()
        .then(setUser)
        .catch(() => {
          clearTokens();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    setTokens(res.access_token, res.refresh_token);
    setUser(res.user);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string, experience_level = "beginner") => {
      const res = await authApi.register({ name, email, password, experience_level });
      setTokens(res.access_token, res.refresh_token);
      setUser(res.user);
    },
    [],
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Route wrapper that redirects to login if not authenticated.
 * While auth is loading, renders nothing to avoid flash.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      nav("/auth/login", { replace: true });
    }
  }, [loading, isAuthenticated, nav]);

  if (loading) return null;
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
