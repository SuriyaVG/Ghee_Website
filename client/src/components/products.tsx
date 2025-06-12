import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Leaf, Flame, Heart, Award, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore, type CartItem } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import type { ProductWithVariants, ProductVariant } from '@shared/schema';
import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Image } from '@/components/ui/image';
import { motion } from 'framer-motion';

export function Products() {
  const { data: productsData, isLoading } = useQuery<ProductWithVariants[]>({
    queryKey: ['/api/products'],
  });

  const addItemToCart = useCartStore((state) => state.addItem);
  const { toast } = useToast();

  const [selectedVariants, setSelectedVariants] = useState<Record<number, number | undefined>>({});

  const handleVariantChange = (productId: number, variantId: number) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: variantId }));
  };

  const handleAddToCart = (product: ProductWithVariants, variantId?: number) => {
    if (!variantId) {
      toast({
        title: 'Select a size',
        description: 'Please choose a size before adding to cart.',
        variant: 'destructive',
      });
      return;
    }
    const selectedVariant = product.variants.find((v) => v.id === variantId);
    if (!selectedVariant) return;

    const cartItem: CartItem = {
      id: `${product.id}-${selectedVariant.id}`,
      productId: product.id,
      name: product.name,
      variant: {
        id: selectedVariant.id,
        size: selectedVariant.size,
        price: parseFloat(selectedVariant.price),
        image_url: selectedVariant.image_url,
      },
      quantity: 1,
      price: parseFloat(selectedVariant.price),
    };

    addItemToCart(cartItem);
    toast({
      title: 'Added to cart',
      description: `${product.name} (${selectedVariant.size}) has been added to your cart.`,
    });
  };

  if (isLoading) {
    return (
      <section id="products" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-playfair font-bold text-deep-brown mb-6">
              Our Premium Ghee Collection
            </h2>
            <p className="text-xl lg:text-2xl text-rich-earth max-w-3xl mx-auto leading-relaxed">
              Loading our carefully crafted range of pure ghee...
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse bg-card border-border shadow-premium">
                <CardContent className="p-8">
                  <div className="bg-muted h-48 rounded-xl mb-6"></div>
                  <div className="space-y-4">
                    <div className="h-6 bg-muted rounded"></div>
                    <div className="h-4 bg-muted w-3/4 rounded"></div>
                    <div className="h-6 bg-muted w-1/2 rounded"></div>
                    <div className="h-10 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-playfair font-bold text-deep-brown mb-6">
            Our Premium Ghee Collection
          </h2>
          <p className="text-xl lg:text-2xl text-rich-earth max-w-4xl mx-auto leading-relaxed">
            Choose from our carefully crafted range of pure ghee, available in convenient sizes to
            meet your family&apos;s needs.
          </p>
        </motion.div>

        <div className="max-w-lg mx-auto grid grid-cols-1 gap-16 mb-20">
          {productsData?.map((product, index) => {
            const currentSelectedVariantId =
              selectedVariants[product.id] || product.variants[0]?.id;
            const currentVariant = product.variants.find((v) => v.id === currentSelectedVariantId);
            const displayImage =
              currentVariant?.image_url ||
              product.variants[0]?.image_url ||
              '/placeholder-image.jpg';
            const displayPrice = currentVariant?.price || product.variants[0]?.price || '0.00';

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-card shadow-premium-lg hover:shadow-premium-lg hover:scale-105 transition-all duration-500 border border-luxury-gold/20 group overflow-hidden">
                  <CardContent className="p-8">
                    <div className="relative mb-8">
                      <div className="relative overflow-hidden rounded-2xl">
                        <Image
                          src={displayImage}
                          alt={product.name}
                          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                      </div>
                      
                      {currentVariant?.best_value_badge && (
                        <motion.div 
                          className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-gold text-white px-6 py-3 rounded-full text-sm font-bold shadow-premium-lg"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          <Star className="w-4 h-4 inline mr-1" />
                          {currentVariant.best_value_badge}
                        </motion.div>
                      )}
                    </div>
                    
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-3xl font-playfair font-bold text-deep-brown mb-3">
                          {product.name}
                        </h3>
                        <p className="text-rich-earth text-lg leading-relaxed">{product.description}</p>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-lg font-semibold text-deep-brown block text-center">
                          Select Size:
                        </Label>
                        <RadioGroup
                          defaultValue={currentSelectedVariantId?.toString()}
                          onValueChange={(value) => handleVariantChange(product.id, parseInt(value))}
                          className="flex justify-center space-x-3"
                        >
                          {product.variants.map((variant) => (
                            <Label
                              key={variant.id}
                              htmlFor={`variant-${product.id}-${variant.id}`}
                              className={`flex items-center justify-center px-6 py-3 border-2 rounded-xl cursor-pointer text-base font-semibold transition-all duration-300 hover:scale-105
                                          ${
                                            currentSelectedVariantId === variant.id
                                              ? 'bg-gradient-gold text-white border-luxury-gold shadow-premium'
                                              : 'bg-card text-deep-brown border-luxury-gold/30 hover:border-luxury-gold hover:bg-luxury-gold/5'
                                          }`}
                            >
                              <RadioGroupItem
                                value={variant.id.toString()}
                                id={`variant-${product.id}-${variant.id}`}
                                className="sr-only"
                              />
                              {variant.size}
                            </Label>
                          ))}
                        </RadioGroup>
                      </div>

                      <div className="flex items-center justify-center space-x-4 py-4">
                        <div className="text-4xl font-playfair font-bold text-luxury-gold">
                          ₹{displayPrice}
                        </div>
                        {currentVariant && (
                          <div className="text-lg text-rich-earth">for {currentVariant.size}</div>
                        )}
                      </div>
                      
                      <Button
                        onClick={() => handleAddToCart(product, currentSelectedVariantId)}
                        className="w-full bg-gradient-gold text-white hover:shadow-premium-lg hover:scale-105 transition-all duration-300 py-4 text-lg font-semibold"
                        size="lg"
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div 
          className="bg-gradient-premium rounded-3xl p-12 shadow-premium-lg border border-luxury-gold/20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl lg:text-4xl font-playfair font-bold text-deep-brown text-center mb-12">
            Why Choose GSR Ghee?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Leaf,
                title: "100% Natural",
                description: "No preservatives or artificial additives",
                color: "bg-forest-green"
              },
              {
                icon: Flame,
                title: "Traditional Method",
                description: "Made using time-honored techniques",
                color: "bg-luxury-gold"
              },
              {
                icon: Heart,
                title: "Family Recipe",
                description: "50 years of perfected process",
                color: "bg-deep-gold"
              },
              {
                icon: Award,
                title: "Quality Assured",
                description: "Rigorous quality testing",
                color: "bg-rich-earth"
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="text-center space-y-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={`w-20 h-20 ${feature.color} rounded-full flex items-center justify-center mx-auto shadow-premium-lg hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="text-white w-10 h-10" />
                </div>
                <h4 className="font-playfair font-bold text-deep-brown text-xl">{feature.title}</h4>
                <p className="text-rich-earth leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
