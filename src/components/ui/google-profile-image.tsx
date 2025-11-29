"use client";

import { useState, useEffect, useRef } from 'react';
import { googleImageQueue } from '@/lib/googleImageQueue';

interface GoogleProfileImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackInitial?: string;
}

/**
 * Google Profile Image Component dengan:
 * - Queue system untuk load sequential (menghindari 429)
 * - Intersection Observer untuk lazy load
 * - Caching di sessionStorage
 * - Fallback cepat ke placeholder
 */
export function GoogleProfileImage({
  src,
  alt,
  className = "w-full h-full object-cover rounded-full",
  fallbackInitial,
}: GoogleProfileImageProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Handle image load dengan queue system
  const handleImageLoad = () => {
    // Validasi URL
    if (!src || src.trim() === '' || src === 'null' || src === 'undefined') {
      setHasError(true);
      setIsLoading(false);
      return;
    }
    
    const cacheKey = `google_img_${src}`;
    
    // Cek cache di sessionStorage
    const cached = sessionStorage.getItem(cacheKey);
    
    if (cached === 'error') {
      // Clear cache error setelah 60 detik untuk retry
      const errorTime = sessionStorage.getItem(`${cacheKey}_error_time`);
      if (errorTime) {
        const timeDiff = Date.now() - parseInt(errorTime);
        if (timeDiff > 60 * 1000) { // 60 detik
          sessionStorage.removeItem(cacheKey);
          sessionStorage.removeItem(`${cacheKey}_error_time`);
        } else {
          // Masih dalam waktu error, langsung set error
          setHasError(true);
          setIsLoading(false);
          return;
        }
      }
    }
    
    if (cached === 'success') {
      // Jika sebelumnya success, langsung load
      setImgSrc(src);
      setIsLoading(false);
      setHasError(false);
      return;
    }

    // Reset state untuk URL baru
    setHasError(false);
    setIsLoading(true);

    // Tambahkan ke queue untuk load sequential
    googleImageQueue.enqueue(
      src,
      () => {
        // onLoad - set src setelah queue berhasil load
        setImgSrc(src);
        setIsLoading(false);
        setHasError(false);
        sessionStorage.setItem(cacheKey, 'success');
      },
      () => {
        // onError
        setHasError(true);
        setIsLoading(false);
        sessionStorage.setItem(cacheKey, 'error');
        sessionStorage.setItem(`${cacheKey}_error_time`, Date.now().toString());
      }
    );
  };

  // Setup Intersection Observer setelah component mount
  useEffect(() => {
    // Jika sudah ada cached success, langsung load tanpa observer
    if (!src || src.trim() === '' || src === 'null' || src === 'undefined') {
      setHasError(true);
      setIsLoading(false);
      return;
    }
    
    const cacheKey = `google_img_${src}`;
    const cached = sessionStorage.getItem(cacheKey);
    
    if (cached === 'success') {
      // Jika sebelumnya success, langsung load tanpa observer
      setImgSrc(src);
      setIsLoading(false);
      setHasError(false);
      return;
    }

    // Gunakan setTimeout untuk memastikan DOM sudah ter-render
    const timeoutId = setTimeout(() => {
      const currentImgRef = imgRef.current;
      
      if (!currentImgRef) return;

      // Setup Intersection Observer untuk lazy load
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Gambar terlihat, mulai load
              handleImageLoad();
              
              // Unobserve setelah mulai load
              if (observerRef.current && currentImgRef) {
                observerRef.current.unobserve(currentImgRef);
              }
            }
          });
        },
        {
          rootMargin: '100px', // Start loading 100px sebelum gambar terlihat
          threshold: 0.01, // Trigger saat sedikit saja terlihat
        }
      );

      observerRef.current.observe(currentImgRef);
    }, 100); // Delay kecil untuk memastikan DOM ready

    return () => {
      clearTimeout(timeoutId);
      if (observerRef.current && imgRef.current) {
        observerRef.current.unobserve(imgRef.current);
      }
    };
  }, [src]); // Re-run jika src berubah


  // Selalu render img tag agar Intersection Observer bisa bekerja
  // Tampilkan placeholder sebagai background jika belum ada src
  const initial = fallbackInitial || alt.charAt(0).toUpperCase();
  
  return (
    <div className="relative w-full h-full">
      {/* Placeholder background */}
      {(!imgSrc || isLoading) && (
        <div className={`absolute inset-0 ${className} bg-gradient-to-br ${
          hasError 
            ? 'from-blue-400 to-purple-500' 
            : 'from-gray-300 to-gray-400 animate-pulse'
        } flex items-center justify-center text-white font-bold text-lg z-10`}>
          {initial}
        </div>
      )}
      
      {/* Image tag - selalu di-render untuk Intersection Observer */}
      <img
        ref={imgRef}
        src={imgSrc || undefined} // Set src setelah queue berhasil preload
        alt={alt}
        className={`${className} ${imgSrc ? 'relative z-20' : 'opacity-0'} transition-opacity duration-300`}
        referrerPolicy="no-referrer-when-downgrade"
        // JANGAN gunakan crossOrigin untuk Google images - menyebabkan CORS error
        // crossOrigin="anonymous" // ❌ Hapus ini
        loading="lazy"
        decoding="async"
        onError={() => {
          // Jika masih error setelah load dari queue
          if (!hasError && imgSrc) {
            const cacheKey = `google_img_${src}`;
            setHasError(true);
            sessionStorage.setItem(cacheKey, 'error');
            sessionStorage.setItem(`${cacheKey}_error_time`, Date.now().toString());
          }
        }}
        onLoad={() => {
          // Mark sebagai success (sudah di-handle di queue onLoad, tapi pastikan state update)
          setIsLoading(false);
          setHasError(false);
        }}
      />
    </div>
  );
 }

