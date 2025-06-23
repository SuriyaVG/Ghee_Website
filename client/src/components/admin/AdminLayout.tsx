import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, List, Boxes } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = [
    {
      to: '/admin/orders',
      label: 'Orders',
      icon: <List className="w-5 h-5 mr-1" />,
      match: location.pathname.startsWith('/admin/orders'),
    },
    {
      to: '/admin/inventory',
      label: 'Inventory',
      icon: <Boxes className="w-5 h-5 mr-1" />,
      match: location.pathname.startsWith('/admin/inventory'),
    },
  ];
  const handleLogout = () => {
    localStorage.removeItem('admin_access_token');
    navigate('/admin', { replace: true });
  };
  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center px-6 py-3 bg-muted border-b shadow-sm sticky top-0 z-20">
        <span className="text-xl font-bold text-primary mr-8">Admin Panel</span>
        <div className="flex gap-2">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center px-4 py-2 rounded font-semibold transition-colors
                ${item.match ? 'bg-primary text-white shadow' : 'text-primary hover:bg-primary/10'}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>
        <button
          onClick={handleLogout}
          className="ml-auto flex items-center px-4 py-2 rounded bg-destructive text-white font-bold hover:bg-destructive/80 transition"
        >
          <LogOut className="w-5 h-5 mr-1" /> Logout
        </button>
      </nav>
      <main className="max-w-5xl mx-auto p-6">
        <div className="bg-card rounded-xl shadow p-6 mt-6">{children}</div>
      </main>
    </div>
  );
} 