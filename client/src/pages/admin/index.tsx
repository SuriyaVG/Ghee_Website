import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';

export default function AdminLoginPage() {
  const [, navigate] = useLocation();
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  // If already logged in, redirect
  if (typeof window !== 'undefined' && localStorage.getItem('admin_token')) {
    navigate('/admin/orders');
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('API Token is required');
      return;
    }
    localStorage.setItem('admin_token', token.trim());
    navigate('/admin/orders');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form onSubmit={handleSubmit} className="bg-card p-8 rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
        <div className="mb-4">
          <label htmlFor="token" className="block font-medium mb-1">API Token</label>
          <input
            id="token"
            type="password"
            className="w-full border rounded px-3 py-2"
            value={token}
            onChange={e => setToken(e.target.value)}
            autoFocus
            required
          />
        </div>
        {error && <div className="text-destructive text-sm mb-4">{error}</div>}
        <Button type="submit" className="w-full">Login</Button>
      </form>
    </div>
  );
} 