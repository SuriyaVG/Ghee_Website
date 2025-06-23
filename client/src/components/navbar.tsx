import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store';
// import { Cart } from "./cart"; // Cart drawer might be replaced by CartPage

export function Navbar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // const [isCartOpen, setIsCartOpen] = useState(false); // Cart drawer state might be removed
  const totalItems = useCartStore((state) => state.getTotalItems());

  const scrollToSection = (sectionId: string) => {
    setIsMenuOpen(false);
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'products', label: 'Products' },
    { id: 'heritage', label: 'Our Heritage' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <>
      <nav className="bg-background shadow-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0">
                <picture>
                  <source srcSet="/images/logo.webp" type="image/webp" />
                  <img src="/images/logo.png" alt="GSR Logo" className="h-10 w-auto" />
                </picture>
              </Link>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
                <Button
                  asChild
                  className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Link to="/cart">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Cart ({totalItems})
                  </Link>
                </Button>
              </div>
            </div>

            <div className="md:hidden flex items-center space-x-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Link to="/cart">
                  <ShoppingCart className="w-4 h-4" />
                  <span className="ml-1">{totalItems}</span>
                </Link>
              </Button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-foreground hover:text-primary p-2"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-t border-border">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="text-foreground hover:text-primary block px-3 py-2 text-base font-medium w-full text-left transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} /> */}
      {/* Commenting out Cart drawer for now, as we have a CartPage */}
    </>
  );
}
