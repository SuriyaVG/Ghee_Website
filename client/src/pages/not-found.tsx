import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-5xl font-playfair font-bold text-deep-brown mb-4">
          404
        </h1>
        <h2 className="text-2xl font-playfair font-semibold text-foreground mb-4">
          Page Not Found
        </h2>
        <p className="text-xl text-rich-earth mb-10 max-w-md leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button asChild className="bg-luxury-gold text-white hover:bg-deep-gold px-8 py-3 text-lg shadow-premium">
          <Link href="/">
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
