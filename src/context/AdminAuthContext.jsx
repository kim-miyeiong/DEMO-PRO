import { createContext, useContext, useState, useCallback } from 'react';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const stored = localStorage.getItem('admin_session');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  const login = useCallback((token, username) => {
    const data = { token, username, loggedInAt: Date.now() };
    localStorage.setItem('admin_session', JSON.stringify(data));
    setSession(data);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_session');
    setSession(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ session, login, logout, isAdmin: !!session }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
