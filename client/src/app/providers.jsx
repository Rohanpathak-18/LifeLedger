import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../features/auth/auth.service.js';
import { setAccessToken } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(
    () => localStorage.getItem('lifeledger_theme') || 'light',
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('lifeledger_theme', theme);
  }, [theme]);

  useEffect(() => {
    authService
      .restoreSession()
      .then((session) => setUser(session.user))
      .catch(() => setAccessToken(null))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
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
    [user, loading, theme],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
