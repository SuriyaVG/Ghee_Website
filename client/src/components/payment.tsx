import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CreditCard, Shield, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { CartItem } from "@/lib/store";

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
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
  });

  const createRazorpayOrderMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await apiRequest("POST", "/api/create-razorpay-order", { amount });
      return response.json();
    },
  });

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Create Razorpay order
      const razorpayOrder = await createRazorpayOrderMutation.mutateAsync(total);
      
      // Configure Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_demo',
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'GSR Heritage Ghee',
        description: 'Premium Pure Ghee Order',
        order_id: razorpayOrder.orderId,
        prefill: {
          name: customerInfo.customerName,
          email: customerInfo.customerEmail,
          contact: customerInfo.customerPhone,
        },
        theme: {
          color: '#3B82F6',
        },
        handler: async function (response: any) {
          try {
            // Create order in database with payment details
            const orderData = {
              ...customerInfo,
              items: JSON.stringify(items),
              total: total.toString(),
              status: 'paid',
              paymentId: response.razorpay_payment_id,
              paymentStatus: 'completed',
              razorpayOrderId: response.razorpay_order_id,
            };

            await createOrderMutation.mutateAsync(orderData);
            
            toast({
              title: "Payment successful!",
              description: "Your order has been placed successfully. We'll contact you soon for delivery.",
            });
            
            onSuccess();
          } catch (error) {
            toast({
              title: "Order creation failed",
              description: "Payment was successful but order creation failed. Please contact support.",
              variant: "destructive",
            });
          }
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            toast({
              title: "Payment cancelled",
              description: "Your payment was cancelled. You can try again.",
              variant: "destructive",
            });
          }
        }
      };

      // Open Razorpay checkout
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Payment failed",
        description: "Unable to process payment. Please try again.",
        variant: "destructive",
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
        title: "Order placed successfully!",
        description: "Your order has been placed. We'll contact you soon to confirm delivery and payment.",
      });
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Order failed",
        description: "Unable to place order. Please try again.",
        variant: "destructive",
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
              <div key={item.product.id} className="flex justify-between text-sm">
                <span>{item.product.name} x {item.quantity}</span>
                <span>₹{(parseFloat(item.product.price) * item.quantity).toFixed(2)}</span>
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
                {isProcessing ? "Processing..." : `Pay ₹${total.toFixed(2)}`}
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" />
              <span>Secured by Razorpay</span>
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
                {createOrderMutation.isPending ? "Placing..." : "Place Order"}
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