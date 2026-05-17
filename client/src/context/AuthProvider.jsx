import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContextObject";
import { getStoredUser, getToken } from "../services/apiClient";
import {
  getProfileRequest,
  loginRequest,
  logoutRequest,
} from "../services/authService";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getToken());
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const verifySession = async () => {
      const storedToken = getToken();

      if (!storedToken) {
        if (!cancelled) {
          setUser(null);
          setToken(null);
          setLoadingAuth(false);
        }

        return;
      }

      try {
        const response = await getProfileRequest();

        if (cancelled) return;

        if (response.success && response.user) {
          setUser(response.user);
          setToken(storedToken);
        } else {
          logoutRequest();
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        if (cancelled) return;

        console.error("Error verificando sesión:", error.message);
        logoutRequest();
        setUser(null);
        setToken(null);
      } finally {
        if (!cancelled) {
          setLoadingAuth(false);
        }
      }
    };

    verifySession();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const response = await loginRequest({
      email: email.trim().toLowerCase(),
      password,
    });

    setUser(response.user);
    setToken(response.token);

    return response;
  }, []);

  const logout = useCallback(() => {
    logoutRequest();
    setUser(null);
    setToken(null);
  }, []);

  const hasRole = useCallback(
    (...allowedRoles) => {
      if (!user?.role) return false;
      return allowedRoles.includes(user.role);
    },
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      token,
      loadingAuth,
      authenticated: Boolean(user && token),
      login,
      logout,
      hasRole,
      isAdmin: user?.role === "ADMIN",
      isOperator: user?.role === "OPERADOR",
      isReader: user?.role === "LECTOR",
      canOperate: user?.role === "ADMIN" || user?.role === "OPERADOR",
    }),
    [user, token, loadingAuth, login, logout, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
