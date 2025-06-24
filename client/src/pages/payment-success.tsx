import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useCartStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const getQueryParam = (param: string) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

interface TemporaryOrderData {
  customerInfo: any; // Define more specific types if available
  items: any[]; // Define more specific types if available
  total: number;
}

export default function PaymentSuccessPage() {
  const location = useLocation();
  const { toast } = useToast();
  const clearCart = useCartStore((state) => state.clearCart);
  const [order, setOrder] = useState<any>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Define orderId and cashfreeOrderId at the top so they are available in render
  const orderId = getQueryParam('orderId');
  const cashfreeOrderId = getQueryParam('cf_order_id');

  const {
    mutate: verifyPaymentAndCreateOrder,
    isPending,
    isError,
    isSuccess,
    error,
    data,
  } = useMutation({
    mutationFn: async (payload: {
      cashfreeOrderId: string;
      customerInfo: any;
      items: any[];
      total: number;
    }) => {
      const response = await apiRequest('POST', '/api/verify-cashfree-payment', payload);
      return response.json();
    },
    onSuccess: (responseData) => {
      toast({
        title: 'Payment Verified & Order Placed!',
        description: `Your order #${responseData.order?.id} has been successfully placed.`,
      });
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      const cfOrderId = getQueryParam('cf_order_id');
      if (cfOrderId) {
        sessionStorage.removeItem(`cf_pending_order_${cfOrderId}`);
      }
    },
    onError: (err: Error) => {
      toast({
        title: 'Order Processing Failed',
        description:
          err.message ||
          'There was an issue processing your order after payment. Please contact support.',
        variant: 'destructive',
      });
      const cfOrderId = getQueryParam('cf_order_id');
      if (cfOrderId) {
        sessionStorage.removeItem(`cf_pending_order_${cfOrderId}`);
      }
    },
  });

  useEffect(() => {
    if (orderId) {
      // COD order: fetch order details
      const fetchOrder = async (attempt = 1) => {
        setIsFetching(true);
        setFetchError(null);
        try {
          const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();
          if (error || !data) throw new Error('Order not found');
          setOrder(data);
          setIsFetching(false);
        } catch (err: any) {
          if (attempt < 4) {
            setTimeout(() => fetchOrder(attempt + 1), 2 ** attempt * 1000);
            setRetryCount(attempt);
          } else {
            setFetchError('Unable to fetch your order. Please contact support.');
            setIsFetching(false);
          }
        }
      };
      fetchOrder();
      return;
    }

    if (cashfreeOrderId) {
      const storedOrderDataString = sessionStorage.getItem(`cf_pending_order_${cashfreeOrderId}`);
      if (storedOrderDataString) {
        try {
          const temporaryOrderData: TemporaryOrderData = JSON.parse(storedOrderDataString);
          verifyPaymentAndCreateOrder({
            cashfreeOrderId,
            customerInfo: temporaryOrderData.customerInfo,
            items: temporaryOrderData.items,
            total: temporaryOrderData.total,
          });
        } catch (e) {
          toast({
            title: 'Error retrieving order details',
            description: 'Could not retrieve your order details for verification. Please contact support.',
            variant: 'destructive',
          });
          sessionStorage.removeItem(`cf_pending_order_${cashfreeOrderId}`);
        }
      } else {
        toast({
          title: 'Order Session Expired or Invalid',
          description: 'Your payment session details could not be found. Please contact support if payment was made.',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Invalid Payment URL',
        description: 'Missing order information in the return URL.',
        variant: 'destructive',
      });
    }
  }, [verifyPaymentAndCreateOrder, toast]);

  useEffect(() => {
    if (orderId && order) {
      clearCart();
    }
  }, [orderId, order, clearCart]);

  if (orderId && isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="w-16 h-16 animate-spin text-primary mb-4" />
        <p className="text-xl font-semibold">Fetching your order details...</p>
        {retryCount > 0 && <p className="text-muted-foreground">Retrying... (Attempt {retryCount + 1})</p>}
      </div>
    );
  }

  if (orderId && fetchError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <XCircle className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Unable to fetch order</h1>
        <p className="text-muted-foreground mb-6">{fetchError}</p>
        <Button asChild>
          <Link to="/">Go to Homepage</Link>
        </Button>
      </div>
    );
  }

  if (orderId && order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Order Placed Successfully!</h1>
        <p className="text-muted-foreground mb-6">
          Your order <span className="font-semibold">#{order.id}</span> has been placed.<br />
          <span>Name:</span> <span className="font-semibold">{order.customerName}</span><br />
          <span>Phone:</span> <span className="font-semibold">{order.customerPhone}</span><br />
          <span>Total:</span> <span className="font-semibold">₹{order.total}</span><br />
          <span>Payment Method:</span> <span className="font-semibold">Cash on Delivery</span><br />
          <span className="block mt-2">Your order will be delivered in 3–5 days.</span>
        </p>
        <div className="space-x-4">
          <Button asChild>
            <Link to="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="w-16 h-16 animate-spin text-primary mb-4" />
        <p className="text-xl font-semibold">Verifying your payment & creating order...</p>
        <p className="text-muted-foreground">Do not refresh or close this page.</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <XCircle className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Order Processing Failed</h1>
        <p className="text-muted-foreground mb-6">
          {error?.message ||
            'An unexpected error occurred while processing your order after payment.'}
        </p>
        <p className="text-sm text-muted-foreground mb-2">
          If funds were deducted, please contact our support with your transaction details (Cashfree
          Order ID: {getQueryParam('cf_order_id') || 'N/A'}).
        </p>
        <Button asChild>
          <Link to="/">Go to Homepage</Link>
        </Button>
      </div>
    );
  }

  if (isSuccess && data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Payment Successful & Order Confirmed!</h1>
        <p className="text-muted-foreground mb-6">
          Your order <span className="font-semibold">#{data.order?.id || data.orderId}</span> has
          been placed. You will receive an email confirmation shortly.
        </p>
        <div className="space-x-4">
          <Button asChild>
            <Link to="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Loader2 className="w-16 h-16 animate-spin text-primary mb-4" />
      <p className="text-xl font-semibold">Processing payment information...</p>
    </div>
  );
}
