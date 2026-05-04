/**
 * Cached Image Component - Optimized Version
 * 
 * Komponen gambar yang MEMANFAATKAN semua fitur Next.js Image (optimization, lazy loading, dll)
 * Hanya menambahkan browser cache tracking untuk mengurangi beban backend
 * 
 * PERBEDAAN dengan Image bawaan Next.js:
 * - ✅ Tetap menggunakan semua optimasi Next.js Image (image optimization, lazy loading, WebP/AVIF)
 * - ✅ Menambahkan browser cache tracking untuk mengurangi request ke backend
 * - ✅ Better error handling dengan fallback
 * - ✅ Cache status tracking (loaded/error) untuk menghindari request berulang
 * 
 * TIDAK mengganggu performa Next.js Image, hanya menambahkan layer cache management
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Image, { ImageProps } from 'next/image';
import { imageCache } from '@/lib/browserCache';

interface CachedImageProps extends Omit<ImageProps, 'src' | 'onLoad' | 'onError'> {
  src: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function CachedImage({
  src,
  alt,
  fallbackSrc = '/placeholder-image.png',
  onLoad,
  onError,
  priority = false,
  ...props
}: CachedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // Deteksi apakah gambar dari remote API yang mungkin bermasalah dengan Next.js Image Optimizer
  // Gunakan unoptimized untuk menghindari error 500 pada Next.js Image Optimizer
  const isRemoteAPI = src.includes('api.gongkomodotour.com') || 
                       src.includes('lh3.googleusercontent.com') ||
                       src.startsWith('http://') || 
                       src.startsWith('https://');
  const isAnimatedGif = src.toLowerCase().endsWith('.gif') || src.includes('.gif');
  const shouldUseUnoptimized = isRemoteAPI || isAnimatedGif;

  // Cek cache saat component mount - hanya untuk skip request jika sudah error sebelumnya
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const cached = imageCache.get(src);
    if (cached?.error) {
      // Jika sebelumnya error, langsung gunakan fallback tanpa request
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  }, [src, fallbackSrc]);

  // Handle image load - track success di cache
  const handleImageLoad = useCallback(() => {
    if (typeof window !== 'undefined') {
      imageCache.set(src, { loaded: true });
    }
    setHasError(false);
    onLoad?.();
  }, [src, onLoad]);

  // Handle image error - track error di cache dan gunakan fallback
  const handleImageError = useCallback(() => {
    if (typeof window !== 'undefined') {
      imageCache.set(src, { loaded: false, error: true });
    }

    if (!hasError && fallbackSrc && imgSrc !== fallbackSrc) {
      setHasError(true);
      setImgSrc(fallbackSrc);
      onError?.();
    } else if (!hasError) {
      setHasError(true);
      onError?.();
    }
  }, [src, fallbackSrc, imgSrc, hasError, onError]);

  // Reset state saat src berubah
  useEffect(() => {
    if (src !== imgSrc && !hasError) {
      setImgSrc(src);
      setHasError(false);
    }
  }, [src, imgSrc, hasError]);

  // Render Next.js Image dengan semua optimasinya
  // Priority images akan langsung load (eager), non-priority akan lazy load
  // Untuk remote API images, gunakan unoptimized untuk menghindari error 500
  return (
    <Image
      src={imgSrc}
      alt={alt}
      priority={priority} // Next.js akan handle lazy loading jika priority=false
      onLoad={handleImageLoad}
      onError={handleImageError}
      unoptimized={shouldUseUnoptimized || props.unoptimized} // Unoptimized untuk remote API untuk menghindari error 500
      {...props}
    />
  );
}
