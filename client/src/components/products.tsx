import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, Leaf, Flame, Heart, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

export function Products() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
  
  const addItem = useCartStore((state) => state.addItem);
  const { toast } = useToast();

  const handleAddToCart = (product: Product) => {
    addItem(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  if (isLoading) {
    return (
      <section id="products" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-playfair font-bold text-deep-brown mb-4">Our Premium Ghee Collection</h2>
            <p className="text-xl text-deep-brown/70 max-w-3xl mx-auto">Loading our carefully crafted range of pure ghee...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-8">
                  <div className="bg-gray-200 h-48 rounded-xl mb-6"></div>
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
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
    <section id="products" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-playfair font-bold text-deep-brown mb-4">Our Premium Ghee Collection</h2>
          <p className="text-xl text-deep-brown/70 max-w-3xl mx-auto">
            Choose from our carefully crafted range of pure ghee, available in convenient sizes to meet your family's needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {products?.map((product) => (
            <Card key={product.id} className={`bg-cream-bg shadow-lg hover:shadow-xl transition-all duration-300 border group ${product.bestValue ? 'border-2 border-warm-gold relative' : 'border border-warm-gold/20'}`}>
              {product.bestValue && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-warm-gold text-white px-6 py-2 rounded-full text-sm font-medium">
                  {product.bestValue}
                </div>
              )}
              <CardContent className="p-8">
                <div className="relative mb-6 mt-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.popular && (
                    <Badge className="absolute top-4 right-4 bg-butter-yellow text-white">
                      {product.popular}
                    </Badge>
                  )}
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-playfair font-bold text-deep-brown">{product.name}</h3>
                  <p className="text-deep-brown/70">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-playfair font-bold text-warm-gold">₹{product.price}</div>
                    <div className="text-sm text-deep-brown/60">per jar</div>
                  </div>
                  <Button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-warm-gold text-white hover:bg-rich-brown transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Product Features */}
        <div className="bg-gradient-to-r from-warm-gold/10 to-butter-yellow/10 rounded-2xl p-8">
          <h3 className="text-2xl font-playfair font-bold text-deep-brown text-center mb-8">Why Choose GSR Ghee?</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-warm-gold rounded-full flex items-center justify-center mx-auto">
                <Leaf className="text-white w-8 h-8" />
              </div>
              <h4 className="font-playfair font-bold text-deep-brown">100% Natural</h4>
              <p className="text-sm text-deep-brown/70">No preservatives or artificial additives</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-warm-gold rounded-full flex items-center justify-center mx-auto">
                <Flame className="text-white w-8 h-8" />
              </div>
              <h4 className="font-playfair font-bold text-deep-brown">Traditional Method</h4>
              <p className="text-sm text-deep-brown/70">Made using time-honored techniques</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-warm-gold rounded-full flex items-center justify-center mx-auto">
                <Heart className="text-white w-8 h-8" />
              </div>
              <h4 className="font-playfair font-bold text-deep-brown">Family Recipe</h4>
              <p className="text-sm text-deep-brown/70">50 years of perfected process</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-warm-gold rounded-full flex items-center justify-center mx-auto">
                <Award className="text-white w-8 h-8" />
              </div>
              <h4 className="font-playfair font-bold text-deep-brown">Quality Assured</h4>
              <p className="text-sm text-deep-brown/70">Rigorous quality testing</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
