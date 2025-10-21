"use client";

import { Star, Quote } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { apiRequest } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await apiRequest<TestimonialResponse>(
          'GET',
          '/api/landing-page/all-testimonials'
        );
        
        console.log('Testimonial Response:', response);

        if (response.success && response.data && Array.isArray(response.data)) {
          setReviews(response.data);
        } else {
          throw new Error('Tidak ada testimonial yang ditemukan');
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        setError(error instanceof Error ? error.message : 'Terjadi kesalahan saat mengambil testimonial');
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
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
                    {review.profile_photo_url ? (
                      <Image
                        src={review.profile_photo_url}
                        alt={review.author_name}
                        fill
                        className="object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                        {review.author_name.charAt(0).toUpperCase()}
                      </div>
                    )}
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
