import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../services/api.js';

const AuthContext = createContext(null);
const STORAGE_KEY = 'dup-recs.session';

function loadSession() {
  if (typeof window === 'undefined') {
    return { token: null, user: null, activeGroupId: null };
  }

  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}') ?? {};
  } catch {
    return { token: null, user: null, activeGroupId: null };
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  const value = useMemo(() => {
    async function register(payload) {
      const data = await apiRequest('/auth/register', { method: 'POST', body: payload });
      setSession({ token: data.token, user: data.user, activeGroupId: session.activeGroupId ?? null });
      return data;
    }

    async function login(payload) {
      const data = await apiRequest('/auth/login', { method: 'POST', body: payload });
      setSession({ token: data.token, user: data.user, activeGroupId: session.activeGroupId ?? null });
      return data;
    }

    function logout() {
      setSession({ token: null, user: null, activeGroupId: null });
    }

    function setActiveGroupId(activeGroupId) {
      setSession((current) => ({ ...current, activeGroupId }));
    }

    return {
      session,
      setSession,
      register,
      login,
      logout,
      setActiveGroupId,
      apiRequest: (path, options = {}) => apiRequest(path, { ...options, token: session.token })
    };
  }, [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
