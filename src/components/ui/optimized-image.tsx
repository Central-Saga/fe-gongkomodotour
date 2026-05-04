"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  quality?: number;
  priority?: boolean;
  sizes?: string;
  onError?: () => void;
  onLoad?: () => void;
  fallbackSrc?: string;
}

/**
 * Optimized Image Component dengan fallback ke unoptimized jika timeout
 * Mengatasi masalah timeout pada Next.js Image optimizer untuk remote images
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  quality = 85,
  priority = false,
  sizes,
  onError,
  onLoad,
  fallbackSrc = '/img/default-trip.jpg',
}: OptimizedImageProps) {
  // Cek apakah gambar dari remote API yang lambat atau animated GIF
  const isRemoteAPI = src.includes('api.gongkomodotour.com') || src.includes('lh3.googleusercontent.com');
  const isAnimatedGif = src.toLowerCase().endsWith('.gif') || src.includes('.gif');
  
  // Langsung set unoptimized untuk remote API dan animated GIF
  const [useUnoptimized] = useState(isRemoteAPI || isAnimatedGif);
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // Reset error state saat src berubah
  useEffect(() => {
    if (src !== imgSrc) {
      setImgSrc(src);
      setHasError(false);
    }
  }, [src, imgSrc]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError) {
      setHasError(true);
      
      // Jika sudah unoptimized dan masih error, gunakan fallback
      if (fallbackSrc && imgSrc !== fallbackSrc) {
        setImgSrc(fallbackSrc);
        return; // Retry dengan fallback
      }
      
      onError?.();
    }
  };

  const handleLoad = () => {
    onLoad?.();
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      className={className}
      quality={quality}
      priority={priority}
      sizes={sizes}
      unoptimized={useUnoptimized}
      onError={handleError}
      onLoad={handleLoad}
    />
  );
}

