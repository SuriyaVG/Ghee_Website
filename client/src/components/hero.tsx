import { Award, ShoppingBag, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';

export function Hero() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative bg-gradient-to-br from-background to-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <Award className="text-primary-foreground w-6 h-6" />
                </div>
                <span className="text-primary font-playfair font-medium">
                  50 Years of Heritage
                </span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-playfair font-bold text-foreground leading-tight">
                Pure <span className="text-primary">Ghee</span>,<br />
                Pure <span className="text-primary">Heritage</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Experience GSR&apos;s pure ghee, crafted with love for over 50 years.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => scrollToSection('products')}
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg px-8 py-4 text-lg"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Shop Now
              </Button>
              <Button
                onClick={() => scrollToSection('heritage')}
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors px-8 py-4 text-lg shadow-lg"
              >
                <History className="w-5 h-5 mr-2" />
                Our Story
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border/60">
              <div className="text-center">
                <div className="text-3xl font-playfair font-bold text-primary">50+</div>
                <div className="text-sm text-muted-foreground">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-playfair font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Pure & Natural</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-playfair font-bold text-primary">5000+</div>
                <div className="text-sm text-muted-foreground">Happy Customers</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <Image
              src="/images/hero-background.webp"
              alt="Traditional ghee in golden jar"
              className="rounded-2xl shadow-2xl w-full h-96 object-cover"
              loading="lazy"
            />
            <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-lg border border-border/60">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                  <Award className="text-accent-foreground w-6 h-6" />
                </div>
                <div>
                  <div className="font-playfair font-bold text-card-foreground">Premium Quality</div>
                  <div className="text-sm text-muted-foreground">Certified Pure</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
