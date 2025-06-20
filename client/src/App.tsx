import React, { Suspense, lazy } from 'react';
import { Switch, Route } from 'wouter';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

// Lazy-loaded pages for code-splitting
const Home = lazy(() => import('@/pages/home'));
const CartPage = lazy(() => import('@/pages/cart'));
const PaymentSuccessPage = lazy(() => import('@/pages/payment-success'));
const NotFound = lazy(() => import('@/pages/not-found'));
const AdminLoginPage = lazy(() => import('@/pages/admin/index'));
const AdminOrdersPage = lazy(() => import('@/pages/admin/orders'));

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/cart" component={CartPage} />
      <Route path="/payment-success" component={PaymentSuccessPage} />
      <Route path="/admin" component={AdminLoginPage} />
      <Route path="/admin/orders" component={AdminOrdersPage} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
          <Router />
        </Suspense>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
