import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import AdminLogin from './pages/admin/index';
import AdminOrders from './pages/admin/orders';
import AdminInventoryPage from './pages/admin/inventory';

// Lazy-loaded pages for code-splitting
const Home = lazy(() => import('./pages/home'));
const CartPage = lazy(() => import('./pages/cart'));
const PaymentSuccessPage = lazy(() => import('./pages/payment-success'));
const NotFound = lazy(() => import('./pages/not-found'));

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/payment-success" element={<PaymentSuccessPage />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/inventory" element={<AdminInventoryPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
