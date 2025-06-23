import { useCartStore, type CartItem, isValidCartItem } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Image } from '@/components/ui/image';
import { useState } from 'react';
import { Payment } from '@/components/payment';

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const clearCart = useCartStore((state) => state.clearCart);

  const [showCheckout, setShowCheckout] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });
  const [errors, setErrors] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    const quantity = parseInt(newQuantity.toString(), 10);
    if (quantity > 0) {
      updateQuantity(itemId, quantity);
    } else if (quantity === 0) {
      removeItem(itemId);
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    setShowCheckout(true);
  };

  const validate = () => {
    const newErrors = { customerName: '', customerEmail: '', customerPhone: '' };
    if (!customerInfo.customerName.trim()) {
      newErrors.customerName = 'Name is required.';
    }
    if (!customerInfo.customerEmail.trim()) {
      newErrors.customerEmail = 'Email is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(customerInfo.customerEmail)) {
      newErrors.customerEmail = 'Invalid email format.';
    }
    if (!customerInfo.customerPhone.trim()) {
      newErrors.customerPhone = 'Phone number is required.';
    } else {
      const phoneNumber = customerInfo.customerPhone.replace(/\D/g, '');
      if (!/^(\+?91)?[6-9]\d{9}$/.test(phoneNumber)) {
        newErrors.customerPhone = 'Please enter a valid Indian phone number starting with 6-9 and having 10 digits.';
      }
    }
    setErrors(newErrors);
    return !newErrors.customerName && !newErrors.customerEmail && !newErrors.customerPhone;
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    clearCart();
    setShowCheckout(false);
    setShowPayment(false);
    setCustomerInfo({ customerName: '', customerEmail: '', customerPhone: '' });
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerInfo((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center text-center bg-background py-12 px-4">
          <ShoppingBag className="w-24 h-24 text-primary mb-6" />
          <h1 className="text-4xl font-playfair font-bold text-foreground mb-4">
            Your Cart is Empty
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Looks like you haven&apos;t added anything to your cart yet.
          </p>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" /> Continue Shopping
            </Link>
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  if (showPayment) {
    return (
      <>
        <Navbar />
        <div className="max-w-2xl mx-auto py-12 px-4">
          <h2 className="text-2xl font-bold mb-6">Payment</h2>
          <Payment
            items={items}
            total={getTotalPrice()}
            customerInfo={customerInfo}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        </div>
        <Footer />
      </>
    );
  }

  if (showCheckout) {
    return (
      <>
        <Navbar />
        <div className="max-w-2xl mx-auto py-12 px-4">
          <h2 className="text-2xl font-bold mb-6">Checkout</h2>
          <form onSubmit={handlePlaceOrder} className="space-y-4">
            <div>
              <label htmlFor="customerName" className="block font-medium mb-1">Full Name *</label>
              <Input
                id="customerName"
                name="customerName"
                value={customerInfo.customerName}
                onChange={handleInputChange}
                placeholder="Your full name"
                required
              />
              {errors.customerName && <p className="text-destructive text-xs mt-1">{errors.customerName}</p>}
            </div>
            <div>
              <label htmlFor="customerEmail" className="block font-medium mb-1">Email *</label>
              <Input
                id="customerEmail"
                name="customerEmail"
                type="email"
                value={customerInfo.customerEmail}
                onChange={handleInputChange}
                placeholder="your@email.com"
                required
              />
              {errors.customerEmail && <p className="text-destructive text-xs mt-1">{errors.customerEmail}</p>}
            </div>
            <div>
              <label htmlFor="customerPhone" className="block font-medium mb-1">Phone Number *</label>
              <Input
                id="customerPhone"
                name="customerPhone"
                type="tel"
                value={customerInfo.customerPhone}
                onChange={handleInputChange}
                placeholder="+91 98765 43210"
                required
              />
              {errors.customerPhone && <p className="text-destructive text-xs mt-1">{errors.customerPhone}</p>}
            </div>
            <div className="flex gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCheckout(false)}
                className="flex-1"
              >
                Back to Cart
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-warm-gold hover:bg-rich-brown"
                disabled={!!errors.customerName || !!errors.customerEmail || !!errors.customerPhone}
              >
                Proceed to Payment
              </Button>
            </div>
          </form>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <section className="py-12 bg-background min-h-[calc(100vh-200px)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-playfair font-bold text-foreground">Your Shopping Cart</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 bg-card shadow-xl rounded-2xl p-6 md:p-8">
              {items.filter(isValidCartItem).map((item: CartItem) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center py-6 border-b border-border last:border-b-0"
                >
                  <Image
                    src={item.variant.image_url.replace(/\.jpg$/, '.webp')}
                    alt={item.name}
                    className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg shadow-md mb-4 sm:mb-0 sm:mr-6 flex-shrink-0"
                    loading="lazy"
                  />
                  <div className="flex-grow text-left">
                    <h2 className="text-xl font-playfair font-semibold text-foreground">
                      {item.name}
                    </h2>
                    <p className="text-md text-muted-foreground">Size: {item.variant.size}</p>
                    <p className="text-lg font-semibold text-primary mt-1">
                      ₹{item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3 my-4 sm:my-0 sm:ml-auto">
                    <Input
                      type="number"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                      className="w-20 text-center border-input focus:border-primary focus:ring-ring"
                      aria-label={`Quantity for ${item.name}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="w-full sm:w-auto text-left sm:text-right mt-2 sm:mt-0 sm:ml-6">
                    <p className="text-lg font-playfair font-bold text-foreground">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1 bg-card shadow-xl rounded-2xl p-6 md:p-8 sticky top-20">
              <h2 className="text-2xl font-playfair font-bold text-foreground mb-6">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-lg text-muted-foreground">Subtotal ({getTotalItems()} items)</p>
                  <p className="text-xl font-playfair font-semibold text-foreground">
                    ₹{getTotalPrice().toFixed(2)}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-lg text-muted-foreground">Shipping</p>
                  <p className="text-md text-muted-foreground">
                    Calculated at checkout
                  </p>
                </div>
                <div className="border-t border-border my-4"></div>
                <div className="flex justify-between items-center">
                  <p className="text-xl font-playfair font-bold text-foreground">Estimated Total</p>
                  <p className="text-2xl font-playfair font-bold text-primary">
                    ₹{getTotalPrice().toFixed(2)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2 mb-6">
                Taxes included, shipping calculated at next step.
              </p>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 text-lg" onClick={handleCheckout}>
                <ShoppingBag className="w-5 h-5 mr-2" /> Proceed to Checkout
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full mt-4 border-primary text-primary hover:bg-primary/10"
              >
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Continue Shopping
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
