import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../features/auth/auth.service.js';
import { setAccessToken } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState(false);
  const [theme, setTheme] = useState(
    () => localStorage.getItem('lifeledger_theme') || 'light',
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('lifeledger_theme', theme);
  }, [theme]);

  const restoreSession = useCallback(() => {
    setLoading(true);
    setSessionError(false);
    return authService
      .restoreSession()
      .then((session) => setUser(session.user))
      .catch((error) => {
        setAccessToken(null);
        setSessionError(true);
        throw error;
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    restoreSession().catch(() => {});
  }, [restoreSession]);

  const value = useMemo(
    () => ({
      user,
      loading,
      sessionError,
      retrySessionRestore: restoreSession,
      theme,
      toggleTheme() {
        setTheme((current) => (current === 'light' ? 'dark' : 'light'));
      },
      async signIn(credentials) {
        const session = await authService.login(credentials);
        setUser(session.user);
      },
      async signUp(details) {
        const session = await authService.register(details);
        setUser(session.user);
      },
      async updateProfile(details) {
        const updatedUser = await authService.updateProfile(details);
        setUser(updatedUser);
        return updatedUser;
      },
      async signOut() {
        try {
          await authService.logout();
        } finally {
          setAccessToken(null);
          setUser(null);
        }
      },
    }),
    [user, loading, sessionError, theme, restoreSession],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
