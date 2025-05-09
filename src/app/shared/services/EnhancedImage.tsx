'use client';

import { useState, useRef, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { useImageCache } from './ImageCacheService';

interface EnhancedImageProps extends Omit<ImageProps, 'placeholder'> {
  priority?: boolean;
  loadingStrategy?: 'lazy' | 'eager' | 'progressive';
  quality?: number;
  placeholderQuality?: number;
  cachePriority?: number;
  optimizationDisabled?: boolean;
  renderPlaceholder?: (props: { isLoading: boolean }) => React.ReactNode;
}

const EnhancedImage = ({
  src,
  alt,
  width,
  height,
  priority = false,
  loadingStrategy = 'progressive',
  quality = 85,
  placeholderQuality = 10,
  cachePriority = 0,
  optimizationDisabled = false,
  className = '',
  renderPlaceholder,
  ...props
}: EnhancedImageProps) => {
  const [isLoading, setIsLoading] = useState(!priority);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const { preloadImage, observeElement } = useImageCache();

  // Generate placeholder URL for progressive loading
  const getPlaceholderSrc = (src: string | any) => {
    if (typeof src !== 'string') return '';
    if (src.startsWith('data:')) return src;
    return `${src}?q=${placeholderQuality}`;
  };

  const srcString = typeof src === 'string' ? src : '';

  useEffect(() => {
    if (optimizationDisabled || !imageRef.current || !srcString || priority) return;

    // Reset state when src changes
    setIsLoading(true);
    setError(false);

    // Register for intersection observation
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px', threshold: 0.1 }
    );

    observer.observe(imageRef.current);

    // If using the cache service
    if (loadingStrategy === 'progressive' && srcString) {
      if (imageRef.current) {
        observeElement(imageRef.current, srcString);
      }
      preloadImage(srcString, cachePriority);
    }

    return () => {
      observer.disconnect();
    };
  }, [src, optimizationDisabled, priority, loadingStrategy, cachePriority, preloadImage, observeElement]);

  // Handle loading state changes
  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  // Determine effective loading strategy for Next.js Image
  const getNextImageLoading = (): 'lazy' | 'eager' => {
    if (priority) return 'eager';
    if (loadingStrategy === 'eager') return 'eager';
    return 'lazy';
  };

  // Support for data: URLs and external URLs
  const isDataUrl = srcString.startsWith('data:');
  const isValidDomain = 
    srcString.startsWith('/') || 
    srcString.startsWith('http://localhost') || 
    srcString.startsWith('https://rentasqro.com');

  // No optimizations for data URLs
  if (isDataUrl) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        quality={quality}
        loading={getNextImageLoading()}
        onLoad={handleLoad}
        onError={handleError}
        priority={priority}
        className={`${className} ${isLoading ? 'animate-pulse bg-gray-200' : ''}`}
        {...props}
      />
    );
  }

  // Handle error state with fallback
  if (error) {
    return (
      <div 
        className={`relative ${className}`} 
        style={{ width: typeof width === 'number' ? `${width}px` : width, height: typeof height === 'number' ? `${height}px` : height }}
      >
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-400">
          <span className="text-xs">Error</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={imageRef} className="relative">
      {/* Loading placeholder */}
      {isLoading && renderPlaceholder ? (
        renderPlaceholder({ isLoading })
      ) : isLoading ? (
        <div
          className={`absolute inset-0 bg-gray-100 animate-pulse ${className}`}
          style={{ 
            width: typeof width === 'number' ? `${width}px` : width, 
            height: typeof height === 'number' ? `${height}px` : height 
          }}
        />
      ) : null}

      {/* Low-quality placeholder (visible while loading or if element isn't visible yet) */}
      {loadingStrategy === 'progressive' && !optimizationDisabled && srcString && !isDataUrl && (
        <Image
          src={getPlaceholderSrc(src)}
          alt={alt}
          width={width}
          height={height}
          quality={placeholderQuality}
          className={`transition-opacity duration-300 ${!isLoading ? 'opacity-0' : 'opacity-100'} ${className}`}
          style={{ filter: 'blur(10px)', position: 'absolute', top: 0, left: 0 }}
          priority={true}
          unoptimized={!isValidDomain}
          {...props}
        />
      )}

      {/* Main high-quality image */}
      {(isVisible || priority || loadingStrategy === 'eager' || optimizationDisabled) && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          quality={quality}
          loading={getNextImageLoading()}
          onLoad={handleLoad}
          onError={handleError}
          priority={priority}
          className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`}
          unoptimized={!isValidDomain}
          {...props}
        />
      )}
    </div>
  );
};

export default EnhancedImage;