import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { CreditCard, Shield, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { CartItem } from '@/lib/store';

interface PaymentProps {
  items: CartItem[];
  total: number;
  customerInfo: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export function Payment({ items, total, customerInfo, onSuccess, onCancel }: PaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest('POST', '/api/orders', orderData);
      return response.json();
    },
  });

  const createCashfreeOrderMutation = useMutation({
    mutationFn: async ({ amount, customerInfo }: { amount: number; customerInfo: any }) => {
      const response = await apiRequest('POST', '/api/create-cashfree-order', {
        amount,
        customerInfo,
      });
      return response.json();
    },
  });

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Create Cashfree order
      const cashfreeOrder = await createCashfreeOrderMutation.mutateAsync({
        amount: total,
        customerInfo,
      });

      if (cashfreeOrder && cashfreeOrder.orderId) {
        try {
          const temporaryOrderData = {
            customerInfo,
            items,
            total,
          };
          sessionStorage.setItem(
            `cf_pending_order_${cashfreeOrder.orderId}`,
            JSON.stringify(temporaryOrderData)
          );
        } catch (e) {
          console.error('Failed to save temporary order data to sessionStorage', e);
          setIsProcessing(false);
          toast({
            title: 'Error',
            description: 'Could not prepare payment session. Please try again.',
            variant: 'destructive',
          });
          return;
        }

        // Configure Cashfree options
        if (!import.meta.env.VITE_CASHFREE_ENV) {
          console.error(
            'VITE_CASHFREE_ENV is not set. Cashfree payment might not initialize correctly or use an unintended mode.'
          );
          toast({
            title: 'Configuration Error',
            description: 'Payment system is not configured correctly. Please contact support.',
            variant: 'destructive',
          });
          setIsProcessing(false);
          return;
        }

        const cashfree = new (window as any).Cashfree({
          mode: import.meta.env.VITE_CASHFREE_ENV,
        });

        const checkoutOptions = {
          paymentSessionId: cashfreeOrder.paymentSessionId,
          returnUrl: `${window.location.origin}/payment-success?cf_order_id=${cashfreeOrder.orderId}`,
        };

        cashfree.checkout(checkoutOptions).then(async (result: any) => {
          if (result.error) {
            setIsProcessing(false);
            toast({
              title: 'Payment failed',
              description: result.error.message || 'Payment could not be processed.',
              variant: 'destructive',
            });
            return;
          }

          if (result.redirect) {
            // The redirection to Cashfree will happen.
            // Order creation and onSuccess will be handled on the /payment-success page.
            // No explicit action needed here anymore for successful payment initiation.
            // The browser will automatically redirect.
          }
        });
      }
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: 'Payment failed',
        description: 'Unable to process payment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCashOnDelivery = async () => {
    try {
      const orderData = {
        ...customerInfo,
        items: JSON.stringify(items),
        total: total.toString(),
        status: 'pending',
        paymentStatus: 'cod',
      };

      await createOrderMutation.mutateAsync(orderData);

      toast({
        title: 'Order placed successfully!',
        description:
          "Your order has been placed. We'll contact you soon to confirm delivery and payment.",
      });

      onSuccess();
    } catch (error) {
      toast({
        title: 'Order failed',
        description: 'Unable to place order. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-2 font-bold">
              <div className="flex justify-between">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-playfair font-bold">Choose Payment Method</h3>

        {/* Online Payment */}
        <Card className="border-2 border-primary hover:bg-primary/5 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <CreditCard className="text-white w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-medium">Pay Online</h4>
                  <p className="text-sm text-muted-foreground">Card, UPI, Netbanking & More</p>
                </div>
              </div>
              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="bg-primary hover:bg-primary/90"
              >
                {isProcessing ? 'Processing...' : `Pay ₹${total.toFixed(2)}`}
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" />
              <span>Secured by Cashfree</span>
            </div>
          </CardContent>
        </Card>

        {/* Cash on Delivery */}
        <Card className="border hover:bg-secondary/5 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <h4 className="font-medium">Cash on Delivery</h4>
                  <p className="text-sm text-muted-foreground">Pay when you receive</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleCashOnDelivery}
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending ? 'Placing...' : 'Place Order'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Back to Cart
        </Button>
      </div>
    </div>
  );
}
