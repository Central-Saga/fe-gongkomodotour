"use client";

import { Star, Quote } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { CachedImage } from "@/components/ui/cached-image";
import { apiRequest } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { GoogleProfileImage } from "@/components/ui/google-profile-image";

interface Testimonial {
  id?: number;
  author_name: string;
  rating: number;
  text: string;
  time: number;
  profile_photo_url: string | null;
  source: string;
  trip?: {
    id: number;
    name: string;
  } | null;
  created_at: string;
  updated_at: string;
}

interface TestimonialResponse {
  success: boolean;
  data: Testimonial[];
  meta?: {
    total: number;
    google_count: number;
    internal_count: number;
  };
}

export default function Testimoni() {
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [showFull, setShowFull] = useState<number | null>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const userScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const loggedPlaceholdersRef = useRef<Set<string>>(new Set()); // Track logged placeholders untuk menghindari log berulang
  const { t } = useLanguage();

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Clear cache untuk localhost (development)
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
          console.log('🧹 Clearing cache for localhost...');
          // Clear API cache
          const { apiCache } = await import('@/lib/browserCache');
          apiCache.clear('/api/landing-page/all-testimonials');
          // Clear sessionStorage cache
          sessionStorage.removeItem('testimonials_cache');
          sessionStorage.removeItem('testimonials_cache_time');
          // Clear Google images cache
          const googleImageCacheKeys = Object.keys(sessionStorage).filter(key => 
            key.startsWith('google_img_') || key.startsWith('img_cache_')
          );
          googleImageCacheKeys.forEach(key => sessionStorage.removeItem(key));
          console.log(`🧹 Cleared ${googleImageCacheKeys.length} Google image cache entries`);
        }
        
        const response = await apiRequest<TestimonialResponse>(
          'GET',
          '/api/landing-page/all-testimonials',
          undefined,
          { useCache: false } // Disable cache untuk memastikan data fresh
        );
        
        console.log('Testimonial Response:', response);
        console.log('Environment:', typeof window !== 'undefined' ? window.location.hostname : 'server');

        if (response.success && response.data && Array.isArray(response.data)) {
          // Log summary saja untuk menghindari spam console
          const withPhoto = response.data.filter(r => r.profile_photo_url && r.profile_photo_url.trim() !== '').length;
          const googlePhotos = response.data.filter(r => r.profile_photo_url?.includes('googleusercontent.com')).length;
          console.log(`📊 Testimonials loaded: ${response.data.length} total, ${withPhoto} with photos, ${googlePhotos} from Google`);
          
          // Filter dan validasi data sebelum set
          const validReviews = response.data.filter(review => {
            // Pastikan review memiliki data minimal yang valid
            return review.author_name && review.text && review.rating;
          });
          
          if (validReviews.length === 0) {
            throw new Error('Tidak ada testimonial yang valid ditemukan');
          }
          
          // Simpan ke cache untuk fallback jika error di masa depan
          try {
            sessionStorage.setItem('testimonials_cache', JSON.stringify(validReviews));
            sessionStorage.setItem('testimonials_cache_time', Date.now().toString());
          } catch (cacheError) {
            console.warn('Failed to cache testimonials:', cacheError);
          }
          
          setReviews(validReviews);
          console.log(`✅ Successfully loaded ${validReviews.length} testimonials`);
        } else {
          console.error('❌ Invalid response format:', response);
          throw new Error('Format response tidak valid atau tidak ada testimonial yang ditemukan');
        }
      } catch (error) {
        console.error('❌ Error fetching testimonials:', error);
        const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat mengambil testimonial';
        setError(errorMessage);
        
        // Log detail error untuk debugging
        if (error instanceof Error) {
          console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
          });
        }
        
        // Jika error, coba load dari cache jika ada
        try {
          const cached = sessionStorage.getItem('testimonials_cache');
          if (cached) {
            const cachedData = JSON.parse(cached);
            const cacheTime = sessionStorage.getItem('testimonials_cache_time');
            if (cacheTime && Date.now() - parseInt(cacheTime) < 30 * 60 * 1000) { // Cache valid 30 menit
              console.log('📦 Loading testimonials from cache...');
              setReviews(cachedData);
              setError(null);
            }
          }
        } catch (cacheError) {
          console.error('Error loading from cache:', cacheError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
    
    // Set interval untuk refresh data setiap 30 menit (jika diperlukan)
    const refreshInterval = setInterval(() => {
      fetchTestimonials();
    }, 30 * 60 * 1000); // 30 menit
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Fungsi untuk memulai autoscroll
  const startAutoScroll = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      if (scrollContainerRef.current && !isUserScrolling && !isDragging) {
        const nextIndex = (currentIndex + 1) % reviews.length;
        const scrollAmount = nextIndex * 358; // 350px card width + 8px gap
        scrollContainerRef.current.scrollTo({
          left: scrollAmount,
          behavior: "smooth"
        });
        setCurrentIndex(nextIndex);
      }
    }, 4000); // Scroll every 4 seconds
  }, [currentIndex, reviews.length, isUserScrolling, isDragging]);

  useEffect(() => {
    if (reviews.length > 0) {
      startAutoScroll();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startAutoScroll, reviews.length]);

  // Fungsi untuk menangani scroll wheel
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!scrollContainerRef.current) return;
    
    setIsUserScrolling(true);
    
    // Clear existing timeout
    if (userScrollTimeoutRef.current) {
      clearTimeout(userScrollTimeoutRef.current);
    }
    
    // Set timeout to resume autoscroll after user stops scrolling
    userScrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 2000);
    
    const scrollAmount = e.deltaY > 0 ? 358 : -358;
    scrollContainerRef.current.scrollBy({
      left: scrollAmount,
      behavior: "smooth"
    });
  }, []);

  // Fungsi untuk menangani drag dengan klik kiri
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    if (e.button !== 0) return; // Hanya klik kiri yang memicu drag
    setIsDragging(true);
    setIsUserScrolling(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    scrollContainerRef.current.style.cursor = "grabbing";
    
    // Clear autoscroll saat user drag
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = "grab";
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = "grab";
    }
    
    // Resume autoscroll setelah user selesai drag
    setTimeout(() => {
      setIsUserScrolling(false);
    }, 1000);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Mengurangi kecepatan drag untuk kontrol yang lebih halus
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  // Fungsi untuk menangani touch events (mobile)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setIsUserScrolling(true);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setTimeout(() => {
      setIsUserScrolling(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="py-20 bg-cover bg-center w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 bg-cover bg-center w-full flex items-center justify-center">
        <div className="bg-white/90 p-4 rounded-lg shadow-lg">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="py-20 bg-cover bg-center w-full"
      style={{ backgroundImage: "url('/img/bgtestimonial.jpg')" }}
    >
      <div className="w-full max-w-[1800px] mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-[#f5f5f5] mb-6">
            {t('testimonialsTitle')}
          </h2>
          <p className="text-lg text-[#f5f5f5] mb-8 max-w-2xl mx-auto">
            {t('testimonialsSubtitle')}
          </p>
        </motion.div>

        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto space-x-8 py-4 scrollbar-hide select-none px-4"
          style={{ 
            scrollBehavior: "smooth", 
            cursor: "grab",
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch"
          }}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {reviews.map((review, index) => {
            const isLong = review.text.length > 250;
            const displayText = showFull === index || !isLong ? review.text : review.text.slice(0, 250) + '...';
            return (
              <motion.div
                key={review.id || review.time}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="min-w-[320px] max-w-[500px] w-full bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl flex-shrink-0 flex flex-col justify-between relative"
                style={{ scrollSnapAlign: "center" }}
              >
                <Quote className="absolute top-6 left-6 w-8 h-8 text-yellow-400 opacity-30 z-10" />
                <motion.div 
                  className="flex items-center mb-4 pl-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          i < review.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </motion.div>
                  ))}
                </motion.div>
                <p className="text-gray-700 mb-4 text-lg leading-relaxed" style={{minHeight: '72px'}}>
                  {displayText}
                  {isLong && showFull !== index && (
                    <button
                      className="ml-2 text-blue-600 hover:underline text-sm"
                      onClick={() => setShowFull(index)}
                    >
                      {t('readMore')}
                    </button>
                  )}
                  {isLong && showFull === index && (
                    <button
                      className="ml-2 text-blue-600 hover:underline text-sm"
                      onClick={() => setShowFull(null)}
                    >
                      {t('hide')}
                    </button>
                  )}
                </p>
                <div className="flex items-center mt-4 gap-3">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="relative w-12 h-12 rounded-full bg-white border-2 border-yellow-400 flex items-center justify-center overflow-hidden shadow-md"
                    style={{ minWidth: 48, minHeight: 48 }}
                  >
                    {(() => {
                      // Validasi profile_photo_url
                      const photoUrl = review.profile_photo_url;
                      const hasValidUrl = photoUrl && 
                                        photoUrl.trim() !== '' && 
                                        photoUrl !== 'null' &&
                                        photoUrl !== 'undefined';
                      
                      if (!hasValidUrl || !photoUrl) {
                        // Jika tidak ada URL atau URL tidak valid, tampilkan placeholder
                        // Log hanya sekali per review untuk menghindari spam console
                        if (!loggedPlaceholdersRef.current.has(review.author_name)) {
                          console.log(`ℹ️ No valid profile photo URL for ${review.author_name}, showing placeholder`);
                          loggedPlaceholdersRef.current.add(review.author_name);
                        }
                        return (
                          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                            {review.author_name.charAt(0).toUpperCase()}
                          </div>
                        );
                      }

                      // Jika URL ada tapi sudah di error set, tampilkan placeholder
                      if (imageErrors.has(photoUrl)) {
                        return (
                          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                            {review.author_name.charAt(0).toUpperCase()}
                          </div>
                        );
                      }

                      // Coba load gambar - photoUrl sudah di-validasi di atas
                      if (photoUrl.includes('googleusercontent.com')) {
                        // Gunakan GoogleProfileImage component dengan lazy load dan retry logic
                        return (
                          <GoogleProfileImage
                            src={photoUrl}
                            alt={review.author_name}
                            className="w-full h-full object-cover rounded-full"
                            fallbackInitial={review.author_name.charAt(0).toUpperCase()}
                          />
                        );
                      } else {
                        // Gunakan Next.js Image dengan unoptimized untuk gambar lain dari remote
                        return (
                          <CachedImage
                            src={photoUrl}
                            alt={review.author_name}
                            fill
                            className="object-cover rounded-full"
                            quality={85}
                            sizes="48px"
                            unoptimized={photoUrl.includes('api.gongkomodotour.com') || photoUrl.includes('http')}
                            onError={() => {
                              // Hanya log jika belum di error set untuk menghindari spam
                              if (!imageErrors.has(photoUrl)) {
                                console.warn(`⚠️ Profile image failed to load for ${review.author_name}`);
                                setImageErrors(prev => new Set(prev).add(photoUrl));
                              }
                            }}
                            onLoad={() => {
                              // Hapus dari error set jika berhasil load
                              if (imageErrors.has(photoUrl)) {
                                setImageErrors(prev => {
                                  const newSet = new Set(prev);
                                  newSet.delete(photoUrl);
                                  return newSet;
                                });
                              }
                            }}
                          />
                        );
                      }
                    })()}
                  </motion.div>
                  <div className="flex flex-col justify-center">
                    <p className="text-xs font-medium text-gray-800">
                      {review.author_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(review.time * 1000).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
