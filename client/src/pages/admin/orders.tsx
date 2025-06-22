import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAdminAuth } from '@/lib/useAdminAuth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { saveAs } from 'file-saver';
import { useMutation } from '@tanstack/react-query';

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

export default function AdminOrdersPage() {
  const { isLoggedIn, token, logout, loading: authLoading } = useAdminAuth();
  const [, navigate] = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusLoading, setStatusLoading] = useState<{ [orderId: number]: boolean }>({});
  const { toast } = useToast();

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        const detail = errorData.errors?.[0]?.message ? `: ${errorData.errors[0].message}` : '';
        throw new Error(`${errorData.message}${detail}`);
      }
      return response.json();
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
      navigate('/admin');
      return;
    }
    setLoading(true);
    setError('');
    fetch('/api/orders?limit=50&offset=0', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (res.status === 401) {
          logout();
          navigate('/admin');
          return;
        }
        if (!res.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await res.json();
        setOrders(data);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch orders');
      })
      .finally(() => setLoading(false));
  }, [isLoggedIn, token, authLoading]);

  const handleLogout = () => {
    logout();
    navigate('/admin');
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
      const res = await fetch('/api/orders/export/csv', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to download CSV');
      const blob = await res.blob();
      saveAs(blob, 'orders_export.csv');
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
                    <ul className="list-disc pl-4">
                      {order.items.map((item, idx) => (
                        <li key={idx}>
                          {item.product_name} {item.size ? item.size : ''} × {item.quantity}
                        </li>
                      ))}
                    </ul>
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
  );
} 