import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../services/api.js';

const AuthContext = createContext(null);
const STORAGE_KEY = 'dup-recs.session';

function loadSession() {
  if (typeof window === 'undefined') {
    return { token: null, user: null, activeGroupId: null, groups: [] };
  }

  try {
    const storedSession = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}') ?? {};
    return { token: null, user: null, activeGroupId: null, groups: [], ...storedSession };
  } catch {
    return { token: null, user: null, activeGroupId: null, groups: [] };
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  const value = useMemo(() => {
    function normalizeActiveGroupId(groups, preferredActiveGroupId = null) {
      if (groups.length === 1) {
        return groups[0].id;
      }

      if (preferredActiveGroupId && groups.some((group) => group.id === preferredActiveGroupId)) {
        return preferredActiveGroupId;
      }

      return null;
    }

    async function loadMemberships(token, user, preferredActiveGroupId = null) {
      const data = await apiRequest('/groups/mine', { token });
      const groups = data.groups ?? [];
      const activeGroupId = normalizeActiveGroupId(groups, preferredActiveGroupId);
      setSession({ token, user, groups, activeGroupId });
      return { token, user, groups, activeGroupId };
    }

    async function register(payload) {
      const data = await apiRequest('/auth/register', { method: 'POST', body: payload });
      return loadMemberships(data.token, data.user);
    }

    async function login(payload) {
      const data = await apiRequest('/auth/login', { method: 'POST', body: payload });
      return loadMemberships(data.token, data.user);
    }

    async function refreshMemberships(preferredActiveGroupId = null) {
      if (!session.token || !session.user) {
        return { token: null, user: null, groups: [], activeGroupId: null };
      }

      return loadMemberships(session.token, session.user, preferredActiveGroupId);
    }

    function logout() {
      setSession({ token: null, user: null, activeGroupId: null, groups: [] });
    }

    function setActiveGroupId(activeGroupId) {
      setSession((current) => ({ ...current, activeGroupId }));
    }

    return {
      session,
      setSession,
      register,
      login,
      refreshMemberships,
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
