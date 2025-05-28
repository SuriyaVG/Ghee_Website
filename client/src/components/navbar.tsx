import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store";
// import { Cart } from "./cart"; // Cart drawer might be replaced by CartPage

export function Navbar() {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // const [isCartOpen, setIsCartOpen] = useState(false); // Cart drawer state might be removed
  const totalItems = useCartStore((state) => state.getTotalItems());

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const navItems = [
    { id: "home", label: "Home" },
    { id: "products", label: "Products" },
    { id: "heritage", label: "Our Heritage" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-warm-gold/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0">
                <h1 className="text-2xl font-playfair font-bold text-warm-gold">GSR</h1>
                <p className="text-xs text-rich-brown -mt-1">Since 1974</p>
              </Link>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="text-deep-brown hover:text-warm-gold px-3 py-2 text-sm font-medium transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
                {/* Updated Cart Button for Desktop */}
                <Button
                  asChild // Use asChild to make Button behave like Link
                  className="bg-warm-gold text-white hover:bg-rich-brown transition-colors"
                >
                  <Link href="/cart">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Cart ({totalItems})
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="md:hidden flex items-center space-x-2">
              {/* Updated Cart Button for Mobile */}
              <Button
                asChild // Use asChild to make Button behave like Link
                variant="outline"
                size="sm"
                className="border-warm-gold text-warm-gold hover:bg-warm-gold hover:text-white"
              >
                <Link href="/cart">
                <ShoppingCart className="w-4 h-4" />
                <span className="ml-1">{totalItems}</span>
                </Link>
              </Button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-deep-brown hover:text-warm-gold p-2"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
          
          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-warm-gold/20">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="text-deep-brown hover:text-warm-gold block px-3 py-2 text-base font-medium w-full text-left transition-colors"
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
