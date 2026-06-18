import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getCurrentUser,
  loginUser,
  registerUser,
} from "../api/authApi";
import {
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from "../lib/tokenStorage";
import { AuthContext } from "./authContext";
import type { AuthSessionContextValue, AuthUser } from "./types";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    clearAuthToken();
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const activeToken = token ?? getAuthToken();

    if (!activeToken) {
      logout();
      return;
    }

    try {
      const currentUser = await getCurrentUser(activeToken);

      setToken(activeToken);
      setUser(currentUser);
    } catch {
      logout();
    }
  }, [logout, token]);

  useEffect(() => {
    let isMounted = true;

    async function loadStoredSession() {
      const storedToken = getAuthToken();

      if (!storedToken) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const currentUser = await getCurrentUser(storedToken);

        if (isMounted) {
          setToken(storedToken);
          setUser(currentUser);
        }
      } catch {
        clearAuthToken();

        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadStoredSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginUser({ email, password });

    setAuthToken(response.token);
    setToken(response.token);
    setUser(response.user);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const response = await registerUser({ name, email, password });

      setAuthToken(response.token);
      setToken(response.token);
      setUser(response.user);
    },
    [],
  );

  const value = useMemo<AuthSessionContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [isLoading, login, logout, refreshUser, register, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
