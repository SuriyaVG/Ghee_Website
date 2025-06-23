import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/lib/useAdminAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { ProductWithVariants, ProductVariant } from '@shared/schema';
import { useNavigate, Link } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';

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

export default function AdminInventoryPage() {
  useAdminAuth(); // Redirects if not admin
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: products, isLoading } = useQuery<ProductWithVariants[]>({
    queryKey: ['/api/products'],
  });
  const [editStock, setEditStock] = useState<Record<number, number>>({});

  const updateStockMutation = useMutation({
    mutationFn: async ({ productId, variantId, stock_quantity }: { productId: number; variantId: number; stock_quantity: number }) => {
      const res = await fetch(`/api/products/${productId}/variant/${variantId}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_access_token')}`,
        },
        body: JSON.stringify({ stock_quantity }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update stock');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Stock updated', description: 'Inventory updated successfully.' });
      queryClient.invalidateQueries(['/api/products']);
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  if (isLoading) return <div className="p-8">Loading inventory...</div>;

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Inventory Management</h1>
      <table className="min-w-full border rounded bg-card">
        <thead>
          <tr className="bg-muted">
            <th className="p-2 text-left">Product</th>
            <th className="p-2 text-left">Variant</th>
            <th className="p-2 text-left">Size</th>
            <th className="p-2 text-left">Price</th>
            <th className="p-2 text-left">Stock</th>
            <th className="p-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {products?.flatMap((product) =>
            product.variants.map((variant) => (
              <tr key={variant.id} className="border-b last:border-b-0">
                <td className="p-2">{product.name}</td>
                <td className="p-2">{variant.sku || '-'}</td>
                <td className="p-2">{variant.size}</td>
                <td className="p-2">₹{variant.price}</td>
                <td className="p-2">
                  <Input
                    type="number"
                    min={0}
                    value={editStock[variant.id] ?? variant.stock_quantity ?? 0}
                    onChange={(e) => setEditStock((prev) => ({ ...prev, [variant.id]: parseInt(e.target.value, 10) }))}
                    className="w-24"
                  />
                </td>
                <td className="p-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      updateStockMutation.mutate({
                        productId: product.id,
                        variantId: variant.id,
                        stock_quantity: editStock[variant.id] ?? variant.stock_quantity ?? 0,
                      });
                    }}
                    disabled={updateStockMutation.isLoading}
                  >
                    Save
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </AdminLayout>
  );
} 