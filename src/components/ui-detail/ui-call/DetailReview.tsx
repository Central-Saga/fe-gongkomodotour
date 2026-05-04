"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
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

export default function DetailReview() {
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFull, setShowFull] = useState<number | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const { t } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    if (reviews.length === 0) return;
    intervalRef.current = setInterval(() => {
      if (scrollContainerRef.current) {
        const nextIndex = (currentIndex + 1) % reviews.length;
        const scrollAmount = nextIndex * 358; // 350px card width + 8px gap
        scrollContainerRef.current.scrollTo({
          left: scrollAmount,
          behavior: "smooth"
        });
        setCurrentIndex(nextIndex);
      }
    }, 3000); // Scroll every 3 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentIndex, reviews.length]);

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

  if (reviews.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-500">
          Belum ada review untuk trip ini
        </div>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="py-20 w-full bg-[#e5e5e5]"
    >
      <div className="w-full max-w-[1800px] mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            {t('testimonialsTitle')}
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('testimonialsSubtitle')}
          </p>
        </motion.div>

        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-6 px-4 scrollbar-hide"
          style={{ scrollBehavior: "smooth", scrollSnapType: "x mandatory" }}
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
                className="min-w-[320px] max-w-[400px] w-full bg-white p-8 rounded-2xl shadow-lg flex-shrink-0 flex flex-col justify-between relative"
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
                        // Gunakan GoogleProfileImage component dengan queue system dan lazy load
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
                          <Image
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