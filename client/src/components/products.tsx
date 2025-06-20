import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Leaf, Flame, Heart, Award } from 'lucide-react';
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
      <section id="products" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-playfair font-bold text-primary mb-4">
              Our Premium Ghee Collection
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Loading our carefully crafted range of pure ghee...
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse bg-card border-border">
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
    <section id="products" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-playfair font-bold text-primary mb-4">
            Our Premium Ghee Collection
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose from our carefully crafted range of pure ghee, available in convenient sizes to
            meet your family&apos;s needs.
          </p>
        </div>

        <div className="max-w-lg mx-auto grid grid-cols-1 gap-12 mb-16">
          {productsData?.map((product) => {
            const currentSelectedVariantId =
              selectedVariants[product.id] || product.variants[0]?.id;
            const currentVariant = product.variants.find((v) => v.id === currentSelectedVariantId);
            const displayImage =
              (currentVariant?.image_url?.replace(/\.jpg$/, '.webp') ||
              product.variants[0]?.image_url?.replace(/\.jpg$/, '.webp') ||
              '/placeholder-image.webp');
            const displayPrice = currentVariant?.price || product.variants[0]?.price || '0.00';

            return (
              <Card
                key={product.id}
                className="bg-card shadow-lg hover:shadow-xl transition-all duration-300 border border-border/60 group flex flex-col"
              >
                <CardContent className="p-6 flex flex-col flex-grow">
                  <div className="relative mb-6">
                    <Image
                      src={displayImage}
                      alt={product.name}
                      className="w-full h-56 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {/* {product.is_popular && (
                      <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground font-semibold">
                        Popular
                      </Badge>
                    )} */}
                    {currentVariant?.best_value_badge && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                        {currentVariant.best_value_badge}
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 flex flex-col flex-grow">
                    <h3 className="text-2xl font-playfair font-bold text-foreground">
                      {product.name}
                    </h3>
                    <p className="text-muted-foreground text-sm flex-grow">{product.description}</p>

                    <div className="mt-4 mb-2">
                      <Label className="text-md font-medium text-foreground mb-2 block">
                        Select Size:
                      </Label>
                      <RadioGroup
                        defaultValue={currentSelectedVariantId?.toString()}
                        onValueChange={(value) => handleVariantChange(product.id, parseInt(value))}
                        className="flex space-x-3"
                      >
                        {product.variants.map((variant) => (
                          <Label
                            key={variant.id}
                            htmlFor={`variant-${product.id}-${variant.id}`}
                            className={`flex items-center justify-center px-4 py-2 border rounded-lg cursor-pointer text-sm font-medium 
                                        ${
                                          currentSelectedVariantId === variant.id
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-background text-foreground border-border hover:border-primary hover:bg-accent hover:text-accent-foreground'
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

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-3xl font-playfair font-bold text-primary">
                        ₹{displayPrice}
                      </div>
                      {currentVariant && (
                        <div className="text-sm text-muted-foreground">for {currentVariant.size}</div>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleAddToCart(product, currentSelectedVariantId)}
                    className="w-full mt-auto bg-primary text-primary-foreground hover:bg-primary/90 transition-colors py-3"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="bg-secondary/20 rounded-2xl p-8">
          <h3 className="text-2xl font-playfair font-bold text-foreground text-center mb-8">
            Why Choose GSR Ghee?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <Leaf className="text-primary-foreground w-8 h-8" />
              </div>
              <h4 className="font-playfair font-bold text-foreground">100% Natural</h4>
              <p className="text-sm text-muted-foreground">No preservatives or artificial additives</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <Flame className="text-primary-foreground w-8 h-8" />
              </div>
              <h4 className="font-playfair font-bold text-foreground">Traditional Method</h4>
              <p className="text-sm text-muted-foreground">Made using time-honored techniques</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <Heart className="text-primary-foreground w-8 h-8" />
              </div>
              <h4 className="font-playfair font-bold text-foreground">Family Recipe</h4>
              <p className="text-sm text-muted-foreground">50 years of perfected process</p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <Award className="text-primary-foreground w-8 h-8" />
              </div>
              <h4 className="font-playfair font-bold text-foreground">Quality Assured</h4>
              <p className="text-sm text-muted-foreground">Rigorous quality testing</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
