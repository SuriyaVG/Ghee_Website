import { useState, useEffect } from 'react';

export function useAdminAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setToken(localStorage.getItem('admin_token'));
    setLoading(false);
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem('admin_token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
  };

  return {
    isLoggedIn: !!token,
    token,
    login,
    logout,
    loading,
  };
} 