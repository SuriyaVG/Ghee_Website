import * as React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export function Image({
  src,
  alt,
  className,
  fallbackSrc = '/placeholder-image.jpg',
  ...props
}: ImageProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [currentSrc, setCurrentSrc] = React.useState(src);

  React.useEffect(() => {
    setIsLoading(true);
    setError(false);
    setCurrentSrc(src);
  }, [src]);

  const handleError = () => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setError(true);
    }
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setError(false);
  };

  // Derive webp and jpg sources
  let webpSrc = src;
  let jpgSrc = src;
  if (typeof src === 'string' && src.endsWith('.jpg')) {
    webpSrc = src.replace(/\.jpg$/, '.webp');
    jpgSrc = src;
  } else if (typeof src === 'string' && src.endsWith('.jpeg')) {
    webpSrc = src.replace(/\.jpeg$/, '.webp');
    jpgSrc = src;
  } else if (typeof src === 'string' && src.endsWith('.webp')) {
    webpSrc = src;
    jpgSrc = src.replace(/\.webp$/, '.jpg');
  }

  return (
    <div className={cn('relative', className)}>
      {isLoading && <Skeleton className="absolute inset-0" />}
      <picture>
        <source srcSet={webpSrc} type="image/webp" />
        <img
          src={jpgSrc}
          alt={alt}
          className={cn(
            'transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100',
            className
          )}
          onError={handleError}
          onLoad={handleLoad}
          {...props}
        />
      </picture>
    </div>
  );
}
