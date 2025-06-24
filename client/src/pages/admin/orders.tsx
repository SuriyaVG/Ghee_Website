import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '@/lib/useAdminAuth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { saveAs } from 'file-saver';
import { useMutation } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabaseClient';

interface Order {
  id: number;
  customerName: string;
  phoneNumber: string;
  paymentMethod: string;
  totalAmount: string;
  createdAt: string;
  items: { product_name: string; size?: string; quantity: number }[];
  status: string;
}

const statusOptions = [
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
];

function AdminNavBar() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('admin_access_token');
    navigate('/admin', { replace: true });
  };
  return (
    <nav className="flex items-center gap-4 p-4 bg-muted border-b mb-6">
      <Link to="/admin/orders" className="font-bold text-primary hover:underline">Orders</Link>
      <Link to="/admin/inventory" className="font-bold text-primary hover:underline">Inventory Management</Link>
      <button onClick={handleLogout} className="ml-auto px-4 py-2 rounded bg-destructive text-white font-bold hover:bg-destructive/80 transition">Logout</button>
    </nav>
  );
}

export default function AdminOrdersPage() {
  const { isLoggedIn, token, logout, loading: authLoading } = useAdminAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusLoading, setStatusLoading] = useState<{ [orderId: number]: boolean }>({});
  const { toast } = useToast();
  const navigateRouter = useNavigate();

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      if (error) {
        throw new Error(error.message);
      }
      return { orderId, status };
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    if (authLoading) return; // Wait for auth to load
    if (!isLoggedIn) {
      navigateRouter('/admin');
      return;
    }
    setLoading(true);
    setError('');
    supabase
      .from('orders')
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (error) {
          setError(error.message || 'Failed to fetch orders');
        } else {
          setOrders(data || []);
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch orders');
      })
      .finally(() => setLoading(false));
  }, [isLoggedIn, token, authLoading]);

  const handleLogout = () => {
    logout();
    navigateRouter('/admin');
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    const originalOrders = [...orders];
    // Optimistic update
    setOrders(prevOrders =>
      prevOrders.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      await updateOrderStatusMutation.mutateAsync({ orderId, status: newStatus });
      toast({
        title: 'Success',
        description: `Order #${orderId} status updated to ${newStatus}.`,
      });
    } catch (err: any) {
      // Revert on error. The toast is handled by the mutation's onError.
      setOrders(originalOrders);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*');
      if (error) throw new Error('Failed to download CSV');
      // Convert data to CSV (implement CSV conversion here)
      // For now, just save JSON
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      saveAs(blob, 'orders_export.json');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to download CSV', variant: 'destructive' });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="animate-spin mr-2">🔄</span> Checking authentication...
      </div>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Orders</h1>
      <div className="min-h-screen bg-background p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Orders</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadCSV}>Download CSV</Button>
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <span className="animate-spin mr-2">🔄</span> Loading orders...
          </div>
        ) : error ? (
          <div className="text-destructive text-center mb-4">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded bg-card">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 text-left">Order ID</th>
                  <th className="p-2 text-left">Customer Name</th>
                  <th className="p-2 text-left">Phone</th>
                  <th className="p-2 text-left">Payment</th>
                  <th className="p-2 text-left">Total (₹)</th>
                  <th className="p-2 text-left">Created At</th>
                  <th className="p-2 text-left">Items</th>
                  <th className="p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b last:border-b-0">
                    <td className="p-2 font-mono">{order.id}</td>
                    <td className="p-2">{order.customerName}</td>
                    <td className="p-2">{order.phoneNumber}</td>
                    <td className="p-2 uppercase">{order.paymentMethod}</td>
                    <td className="p-2">{order.totalAmount}</td>
                    <td className="p-2 text-xs">{new Date(order.createdAt).toLocaleString()}</td>
                    <td className="p-2">
                      <div className="flex flex-col gap-1 bg-muted/50 rounded p-2">
                        {order.items.map((item, idx) => (
                          <span key={idx}>{item.product_name} {item.size ? item.size : ''} × {item.quantity}</span>
                        ))}
                      </div>
                    </td>
                    <td className="p-2 capitalize">
                      <select
                        className="border rounded px-2 py-1 bg-background"
                        value={order.status}
                        disabled={statusLoading[order.id]}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                        ))}
                      </select>
                      {statusLoading[order.id] && <span className="ml-2 animate-spin">🔄</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 