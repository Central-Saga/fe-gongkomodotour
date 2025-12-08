"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { googleImageQueue } from '@/lib/googleImageQueue';

interface GoogleProfileImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackInitial?: string;
  priority?: boolean; // Priority untuk gambar yang terlihat di viewport
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
  priority = false,
}: GoogleProfileImageProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadTriggeredRef = useRef<boolean>(false); // Track apakah sudah trigger load
  const isVisibleRef = useRef<boolean>(false); // Track apakah gambar sudah terlihat

  // Handle image load dengan queue system (memoized untuk menghindari re-create)
  const handleImageLoad = useCallback(() => {
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
      // Clear cache error setelah 30 menit untuk retry (diperpanjang drastis untuk menghindari spam request)
      const errorTime = sessionStorage.getItem(`${cacheKey}_error_time`);
      if (errorTime) {
        const timeDiff = Date.now() - parseInt(errorTime);
        if (timeDiff > 30 * 60 * 1000) { // 30 menit (diperpanjang dari 10 menit)
          sessionStorage.removeItem(cacheKey);
          sessionStorage.removeItem(`${cacheKey}_error_time`);
        } else {
          // Masih dalam waktu error, langsung set error tanpa request
          setHasError(true);
          setIsLoading(false);
          return;
        }
      }
    }
    
    if (cached === 'success') {
      // Jika sebelumnya success, langsung load tanpa queue
      setImgSrc(src);
      setIsLoading(false);
      setHasError(false);
      return;
    }

    // Reset state untuk URL baru
    setHasError(false);
    setIsLoading(true);

    // Tambahkan ke queue dengan priority (1 = high jika visible, 0 = low jika tidak visible)
    // Jika gambar terlihat (di-trigger oleh Intersection Observer), set priority tinggi
    const imagePriority = (priority || isVisibleRef.current) ? 1 : 0; // Priority tinggi jika visible atau priority prop true
    
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
        // onError - setelah semua retry gagal
        setHasError(true);
        setIsLoading(false);
        sessionStorage.setItem(cacheKey, 'error');
        sessionStorage.setItem(`${cacheKey}_error_time`, Date.now().toString());
      },
      imagePriority
    );
  }, [src, priority]); // Re-create hanya jika src atau priority berubah

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

      // Setup Intersection Observer untuk lazy load dengan threshold yang lebih ketat
      // Hanya load saat benar-benar terlihat di viewport untuk menghindari terlalu banyak request sekaligus
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !loadTriggeredRef.current) {
              // Gambar terlihat, mulai load (hanya sekali)
              loadTriggeredRef.current = true;
              isVisibleRef.current = true; // Mark sebagai visible
              
              // Unobserve segera untuk menghindari multiple triggers
              if (observerRef.current && currentImgRef) {
                observerRef.current.unobserve(currentImgRef);
              }
              
              // Trigger load dengan priority tinggi karena terlihat
              handleImageLoad();
            }
          });
        },
        {
          rootMargin: '100px', // Load 100px sebelum terlihat (early loading)
          threshold: 0.1, // Trigger saat 10% terlihat (lebih cepat untuk user experience)
        }
      );

      observerRef.current.observe(currentImgRef);
    }, 100); // Delay kecil untuk memastikan DOM ready

    return () => {
      clearTimeout(timeoutId);
      if (observerRef.current && imgRef.current) {
        observerRef.current.unobserve(imgRef.current);
      }
      loadTriggeredRef.current = false; // Reset saat unmount atau src berubah
    };
  }, [src, handleImageLoad]); // Re-run jika src atau handleImageLoad berubah


  // Selalu render img tag agar Intersection Observer bisa bekerja
  // Tampilkan placeholder sebagai background jika belum ada src
  const initial = fallbackInitial || alt.charAt(0).toUpperCase();
  
  // Gunakan proxy di localhost untuk menghindari 403
  const getImageSrc = (originalSrc: string | null): string | undefined => {
    if (!originalSrc) return undefined;
    
    const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    if (isLocalhost && originalSrc.includes('googleusercontent.com')) {
      // Di localhost, gunakan proxy untuk menghindari 403
      return `/api/proxy-google-image?url=${encodeURIComponent(originalSrc)}`;
    }
    
    return originalSrc;
  };
  
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
      {/* src hanya di-set setelah queue berhasil preload untuk menghindari request langsung */}
      <img
        ref={imgRef}
        src={getImageSrc(imgSrc)} // Gunakan proxy di localhost
        alt={alt}
        className={`${className} ${imgSrc ? 'relative z-20 opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-300`}
        referrerPolicy="no-referrer"
        loading="lazy"
        decoding="async"
        onError={() => {
          // Jika masih error setelah load dari queue
          if (!hasError && imgSrc) {
            const cacheKey = `google_img_${src}`;
            setHasError(true);
            setIsLoading(false);
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

