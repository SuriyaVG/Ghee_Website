import { Award, ShoppingBag, History } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative bg-gradient-to-br from-cream-bg to-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-warm-gold rounded-full flex items-center justify-center">
                  <Award className="text-white w-6 h-6" />
                </div>
                <span className="text-warm-gold font-playfair font-medium">50 Years of Heritage</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-playfair font-bold text-deep-brown leading-tight">
                Pure <span className="text-warm-gold">Ghee</span>,<br />
                Pure <span className="text-warm-gold">Heritage</span>
              </h1>
              <p className="text-xl text-deep-brown/80 leading-relaxed">
                Experience the authentic taste of tradition with GSR's premium ghee, crafted using time-honored methods passed down through generations of our family business.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => scrollToSection("products")}
                className="hover:bg-rich-brown transition-colors shadow-lg px-8 py-4 text-lg text-[#0a0a0a] bg-[#1f000000]"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Shop Now
              </Button>
              <Button
                onClick={() => scrollToSection("heritage")}
                variant="outline"
                className="border-2 border-warm-gold text-warm-gold hover:bg-warm-gold hover:text-white transition-colors px-8 py-4 text-lg"
              >
                <History className="w-5 h-5 mr-2" />
                Our Story
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-warm-gold/20">
              <div className="text-center">
                <div className="text-3xl font-playfair font-bold text-warm-gold">50+</div>
                <div className="text-sm text-deep-brown/70">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-playfair font-bold text-warm-gold">100%</div>
                <div className="text-sm text-deep-brown/70">Pure & Natural</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-playfair font-bold text-warm-gold">5000+</div>
                <div className="text-sm text-deep-brown/70">Happy Customers</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1599599810769-bcde5a160d32?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
              alt="Traditional ghee in golden jar"
              className="rounded-2xl shadow-2xl w-full h-96 object-cover"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg border border-warm-gold/20">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-butter-yellow rounded-full flex items-center justify-center">
                  <Award className="text-white w-6 h-6" />
                </div>
                <div>
                  <div className="font-playfair font-bold text-deep-brown">Premium Quality</div>
                  <div className="text-sm text-deep-brown/70">Certified Pure</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
