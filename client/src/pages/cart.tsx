import { useCartStore, type CartItem } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { Navbar } from '@/components/navbar'; // Assuming you want Navbar on this page too
import { Footer } from '@/components/footer'; // And Footer

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const getTotalItems = useCartStore((state) => state.getTotalItems);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    const quantity = parseInt(newQuantity.toString(), 10);
    if (quantity > 0) {
      updateQuantity(itemId, quantity);
    } else if (quantity === 0) {
      removeItem(itemId);
    }
  };

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center text-center bg-cream-bg py-12 px-4">
          <ShoppingBag className="w-24 h-24 text-warm-gold mb-6" />
          <h1 className="text-4xl font-playfair font-bold text-deep-brown mb-4">
            Your Cart is Empty
          </h1>
          <p className="text-xl text-deep-brown/70 mb-8">
            Looks like you haven&apos;t added anything to your cart yet.
          </p>
          <Button asChild className="bg-warm-gold text-white hover:bg-rich-brown">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" /> Continue Shopping
            </Link>
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <section className="py-12 bg-cream-bg min-h-[calc(100vh-200px)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-playfair font-bold text-deep-brown">Your Shopping Cart</h1>
          </div>

          <div className="bg-white shadow-xl rounded-2xl p-6 md:p-8">
            {items.map((item: CartItem) => (
              <div
                key={item.id}
                className="flex flex-col md:flex-row items-center py-6 border-b border-warm-gold/20 last:border-b-0"
              >
                <img
                  src={item.variant.image_url}
                  alt={item.name}
                  className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg shadow-md mb-4 md:mb-0 md:mr-6"
                  loading="lazy"
                />
                <div className="flex-grow text-center md:text-left">
                  <h2 className="text-xl font-playfair font-semibold text-deep-brown">
                    {item.name}
                  </h2>
                  <p className="text-md text-deep-brown/80">Size: {item.variant.size}</p>
                  <p className="text-lg font-semibold text-warm-gold mt-1">
                    ₹{item.price.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center space-x-3 my-4 md:my-0 md:ml-auto">
                  <Input
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                    className="w-20 text-center border-warm-gold/30 focus:border-warm-gold focus:ring-warm-gold/20"
                    aria-label={`Quantity for ${item.name}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    className="text-rich-brown hover:text-red-600 hover:bg-red-100/50"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
                <div className="w-full md:w-auto md:text-right mt-2 md:mt-0 md:ml-6">
                  <p className="text-lg font-playfair font-bold text-deep-brown">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}

            <div className="mt-8 pt-6 border-t border-warm-gold/30">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xl text-deep-brown/80">Subtotal ({getTotalItems()} items):</p>
                <p className="text-2xl font-playfair font-bold text-warm-gold">
                  ₹{getTotalPrice().toFixed(2)}
                </p>
              </div>
              <p className="text-sm text-deep-brown/60 text-right mb-6">
                Shipping and taxes calculated at checkout.
              </p>
              <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0 md:space-x-4">
                <Button
                  asChild
                  variant="outline"
                  className="w-full md:w-auto border-warm-gold text-warm-gold hover:bg-warm-gold/10 hover:text-rich-brown"
                >
                  <Link href="/">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Continue Shopping
                  </Link>
                </Button>
                <Button className="w-full md:w-auto bg-warm-gold text-white hover:bg-rich-brown">
                  <ShoppingBag className="w-4 h-4 mr-2" /> Proceed to Checkout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
