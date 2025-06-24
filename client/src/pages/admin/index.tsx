import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error || !data.session) throw new Error(error?.message || 'Login failed');
      localStorage.setItem('admin_access_token', data.session.access_token);
      navigate('/admin/orders');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const isLoggedIn = typeof window !== 'undefined' && !!localStorage.getItem('admin_access_token');
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/admin/orders', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  if (isLoggedIn) return null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f6f2e8' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 32, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Admin Login</h2>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: 8, marginTop: 4, marginBottom: 12, borderRadius: 4, border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: 8, marginTop: 4, marginBottom: 12, borderRadius: 4, border: '1px solid #ccc' }}
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 10, background: '#b88c4a', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 600 }}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div className="flex flex-col gap-4 mt-8">
        {isLoggedIn && (
          <>
            <Link to="/admin/orders">
              <button className="w-full py-3 px-6 rounded bg-primary text-white font-bold hover:bg-primary/90 transition">View Orders</button>
            </Link>
            <Link to="/admin/inventory">
              <button className="w-full py-3 px-6 rounded bg-secondary text-primary font-bold hover:bg-secondary/80 transition">Inventory Management</button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminLogin; 