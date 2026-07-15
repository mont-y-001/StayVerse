import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { clearSession, getStoredUser, setSession } from '../api/client';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Return a fallback so components don't crash outside provider
    return { user: null, loading: false, logout: () => {} };
  }
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setUser(getStoredUser());
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const setAuthUser = useCallback((sessionOrUser) => {
    if (sessionOrUser?.token && sessionOrUser?.user) {
      setSession(sessionOrUser);
      setUser(sessionOrUser.user);
      return;
    }

    setUser(sessionOrUser);
  }, []);

  const value = React.useMemo(() => ({ user, loading, logout, setAuthUser }), [user, loading, logout, setAuthUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
