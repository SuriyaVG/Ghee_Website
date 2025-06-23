import { Button } from '@/components/ui/button';
import { AlertTriangle, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-cream-bg p-4 text-center">
      <AlertTriangle className="w-24 h-24 text-warm-gold mb-8" />
      <h1 className="text-5xl font-playfair font-bold text-deep-brown mb-4">
        404 - Page Not Found
      </h1>
      <p className="text-xl text-deep-brown/70 mb-10 max-w-md">
        Oops! The page you are looking for does not exist. It might have been moved or deleted.
      </p>
      <Button asChild className="bg-warm-gold text-white hover:bg-rich-brown px-8 py-3 text-lg">
        <Link to="/">
          <Home className="w-5 h-5 mr-2" />
          Go to Homepage
        </Link>
      </Button>
    </div>
  );
}
