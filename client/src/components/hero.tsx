import { Award, ShoppingBag, History, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { motion } from 'framer-motion';

export function Hero() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative bg-gradient-premium py-24">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-luxury-gold/20 to-transparent"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            className="space-y-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="space-y-6">
              <motion.div 
                className="flex items-center space-x-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="w-14 h-14 bg-gradient-gold rounded-full flex items-center justify-center shadow-premium">
                  <Award className="text-white w-7 h-7" />
                </div>
                <span className="text-luxury-gold font-playfair font-semibold text-lg">
                  50 Years of Heritage
                </span>
              </motion.div>
              
              <motion.h1 
                className="text-5xl lg:text-6xl xl:text-7xl font-playfair font-bold text-foreground leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Pure <span className="text-transparent bg-clip-text bg-gradient-gold">Ghee</span>,<br />
                Pure <span className="text-transparent bg-clip-text bg-gradient-gold">Heritage</span>
              </motion.h1>
              
              <motion.p 
                className="text-xl lg:text-2xl text-rich-earth leading-relaxed max-w-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Experience GSR&apos;s pure ghee, crafted with love and tradition for over five decades.
              </motion.p>
            </div>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <Button
                onClick={() => scrollToSection('products')}
                className="bg-gradient-gold text-white hover:shadow-premium-lg hover:scale-105 transition-all duration-300 px-8 py-4 text-lg font-semibold"
                size="lg"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Shop Premium Ghee
              </Button>
              <Button
                onClick={() => scrollToSection('heritage')}
                variant="outline"
                className="border-2 border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-white transition-all duration-300 px-8 py-4 text-lg font-semibold shadow-premium"
                size="lg"
              >
                <History className="w-5 h-5 mr-2" />
                Our Legacy
              </Button>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-3 gap-8 pt-8 border-t border-luxury-gold/30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="text-center">
                <div className="text-4xl font-playfair font-bold text-luxury-gold mb-1">50+</div>
                <div className="text-sm text-rich-earth font-medium">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-playfair font-bold text-luxury-gold mb-1">100%</div>
                <div className="text-sm text-rich-earth font-medium">Pure & Natural</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-playfair font-bold text-luxury-gold mb-1">5000+</div>
                <div className="text-sm text-rich-earth font-medium">Happy Customers</div>
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="relative lg:pl-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="relative">
              <Image
                src="/images/hero-background.jpg"
                alt="Traditional ghee in golden jar"
                className="rounded-2xl shadow-premium-lg w-full h-[500px] object-cover"
                loading="lazy"
              />
              
              {/* Premium Quality Badge */}
              <motion.div 
                className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-premium-lg border border-luxury-gold/20 backdrop-blur-sm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-gold rounded-full flex items-center justify-center shadow-lg">
                    <Star className="text-white w-7 h-7" />
                  </div>
                  <div>
                    <div className="font-playfair font-bold text-deep-brown text-lg">Premium Quality</div>
                    <div className="text-sm text-rich-earth">Certified Pure & Authentic</div>
                  </div>
                </div>
              </motion.div>
              
              {/* Floating decorative elements */}
              <motion.div 
                className="absolute -top-4 -right-4 w-16 h-16 bg-luxury-gold/20 rounded-full blur-xl"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div 
                className="absolute top-1/4 -left-8 w-12 h-12 bg-forest-green/20 rounded-full blur-lg"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
