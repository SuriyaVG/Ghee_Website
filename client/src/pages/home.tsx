import { Navbar } from '@/components/navbar';
import { Hero } from '@/components/hero';
import { Products } from '@/components/products';
import { Heritage } from '@/components/heritage';
import { Contact } from '@/components/contact';
import { Footer } from '@/components/footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-cream-bg">
      <Navbar />
      <Hero />
      <Products />
      <Heritage />
      <Contact />
      <Footer />
    </div>
  );
}
