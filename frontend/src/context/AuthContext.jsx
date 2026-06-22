import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("ra_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("ra_token"));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Validate the stored token on first load by re-fetching the user.
    async function bootstrap() {
      const storedToken = localStorage.getItem("ra_token");
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const freshUser = await authService.getCurrentUser();
        setUser(freshUser);
        localStorage.setItem("ra_user", JSON.stringify(freshUser));
      } catch {
        localStorage.removeItem("ra_token");
        localStorage.removeItem("ra_user");
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    }
    bootstrap();
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    localStorage.setItem("ra_token", data.access_token);
    localStorage.setItem("ra_user", JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (details) => {
    const data = await authService.register(details);
    localStorage.setItem("ra_token", data.access_token);
    localStorage.setItem("ra_user", JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("ra_token");
    localStorage.removeItem("ra_user");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, logout, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
