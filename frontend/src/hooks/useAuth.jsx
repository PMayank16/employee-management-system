import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { authApi, employeesApi } from "@/services/api";
import {
  getToken,
  getStoredUser,
  removeToken,
  setStoredUser,
  setToken,
} from "@/utils/storage";
import { extractRoleFromJwt } from "@/utils/jwt";
import { hasAdminRole, hasEmployeeRole, normalizeRole } from "@/utils/roles";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getToken());
  const [user, setUser] = useState(() => getStoredUser());
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const t = getToken();
      if (!t) {
        if (mounted) setBootstrapping(false);
        return;
      }
      try {
        const me = await employeesApi.me();
        const role = normalizeRole(me?.role || extractRoleFromJwt(t));
        if (mounted) {
          const nextUser = { ...me, role };
          setUser(nextUser);
          setStoredUser(nextUser);
        }
      } catch (e) {
        // If backend rejects the token, clear session so user returns to login cleanly.
        if (e?.status === 401 || e?.status === 403) {
          if (mounted) {
            removeToken();
            setTokenState(null);
            setUser(null);
          }
          return;
        }
        const role = extractRoleFromJwt(t);
        const fallback = { ...getStoredUser(), role };
        if (mounted) {
          setUser(fallback);
          setStoredUser(fallback);
        }
      } finally {
        if (mounted) setBootstrapping(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authApi.login(credentials);
    setToken(data.token);
    setTokenState(data.token);
    let profile = null;
    try {
      profile = await employeesApi.me();
    } catch {
      profile = getStoredUser() || {};
    }
    const role = normalizeRole(profile?.role || extractRoleFromJwt(data.token));
    const nextUser = { ...profile, role };
    setStoredUser(nextUser);
    setUser(nextUser);
    return { ...data, role };
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setTokenState(null);
    setUser(null);
  }, []);

  const isEmployee = hasEmployeeRole(user?.role);
  const isAdmin = hasAdminRole(user?.role);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      isAdmin,
      isEmployee,
      bootstrapping,
      login,
      logout,
    }),
    [token, user, isAdmin, isEmployee, bootstrapping, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
