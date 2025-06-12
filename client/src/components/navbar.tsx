import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const [location, setLocation] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());

  const scrollToSection = (sectionId: string) => {
    setIsMenuOpen(false);
    if (location !== '/') {
      setLocation('/');
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
      <nav className="bg-background/95 backdrop-blur-md shadow-premium border-b border-luxury-gold/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 group">
                <motion.img 
                  src="/images/logo.png" 
                  alt="GSR Logo" 
                  className="h-12 w-auto transition-transform duration-300 group-hover:scale-105" 
                  whileHover={{ scale: 1.05 }}
                />
              </Link>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="text-foreground hover:text-luxury-gold px-4 py-2 text-base font-medium transition-all duration-300 relative group"
                  >
                    {item.label}
                    <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-luxury-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                  </button>
                ))}
                <Button
                  asChild
                  className="bg-gradient-gold text-white hover:shadow-premium-lg hover:scale-105 transition-all duration-300 ml-4"
                  size="lg"
                >
                  <Link href="/cart">
                    <div className="relative">
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      {totalItems > 0 && (
                        <motion.span 
                          className="absolute -top-2 -right-2 bg-deep-gold text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          {totalItems}
                        </motion.span>
                      )}
                    </div>
                    Cart ({totalItems})
                  </Link>
                </Button>
              </div>
            </div>

            <div className="md:hidden flex items-center space-x-3">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-2 border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-all duration-300 relative"
              >
                <Link href="/cart">
                  <div className="relative">
                    <ShoppingCart className="w-4 h-4" />
                    {totalItems > 0 && (
                      <motion.span 
                        className="absolute -top-2 -right-2 bg-deep-gold text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        {totalItems}
                      </motion.span>
                    )}
                  </div>
                  <span className="ml-2">{totalItems}</span>
                </Link>
              </Button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-foreground hover:text-luxury-gold p-2 transition-colors duration-300"
              >
                <motion.div
                  animate={{ rotate: isMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </motion.div>
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                className="md:hidden"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="px-2 pt-2 pb-6 space-y-1 sm:px-3 bg-background border-t border-luxury-gold/20">
                  {navItems.map((item, index) => (
                    <motion.button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className="text-foreground hover:text-luxury-gold hover:bg-luxury-gold/10 block px-4 py-3 text-base font-medium w-full text-left transition-all duration-300 rounded-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      {item.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </>
  );
}
