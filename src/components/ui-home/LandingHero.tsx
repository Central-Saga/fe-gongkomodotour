"use client";

import * as React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { CachedImage } from "@/components/ui/cached-image";

// Impor gaya Swiper
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

// Interface untuk data carousel dari database
interface CarouselItem {
  id: number;
  title: string;
  description: string;
  order_num: string;
  is_active: string;
  assets: Array<{
    id: number;
    title: string;
    description: string;
    file_url: string;
    original_file_url: string;
    is_external: boolean;
    file_path: string;
    created_at: string;
    updated_at: string;
  }>;
  primary_image: {
    id: number;
    title: string;
    description: string;
    file_url: string;
    original_file_url: string;
    is_external: boolean;
    file_path: string;
    created_at: string;
    updated_at: string;
  };
  created_at: string;
  updated_at: string;
}

// Gaya kustom untuk pagination bullets
const customStyles = `
  .swiper-pagination {
    bottom: 30px !important;
    z-index: 20;
  }
  .swiper-pagination-bullet {
    width: 18px;
    height: 18px;
    background: var(--gold);
    opacity: 0.7;
    transition: all 0.3s ease;
    margin: 0 8px !important;
  }
  .swiper-pagination-bullet-active {
    width: 25px;
    height: 25px;
    background: var(--gold);
    opacity: 1;
  }
  .swiper-button-next,
  .swiper-button-prev {
    color: var(--gold) !important;
    transition: all 0.3s ease;
    z-index: 20;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 50%;
    width: 50px;
    height: 50px;
    margin-top: -25px;
  }
  .swiper-button-next:hover,
  .swiper-button-prev:hover {
    color: var(--gold-dark-10) !important;
    background: rgba(0, 0, 0, 0.5);
  }
  .swiper-button-next:after,
  .swiper-button-prev:after {
    font-size: 20px;
    font-weight: bold;
  }
  .swiper-slide {
    height: 92vh;
  }
  .swiper-slide > div {
    height: 92vh;
  }
`;

export default function LandingHero() {
  const { t } = useLanguage();
  
  // State untuk menyimpan data carousels dari API
  const [carouselItems, setCarouselItems] = React.useState<CarouselItem[]>([]);
  
  // State untuk loading
  const [isLoading, setIsLoading] = React.useState(true);

  // Fungsi untuk menangani URL encoding seperti di TripHighlight
  const getImageUrl = (url: string) => {
    if (!url) return '/img/default-trip.jpg';
    
    try {
      // Jika sudah absolute URL
      if (/^https?:\/\//.test(url)) {
        // Cek apakah URL mengandung karakter yang bermasalah
        if (url.includes(' ') && !url.includes('%20')) {
          return encodeURI(url);
        }
        return encodeURI(url);
      }
      // Relative path dari API
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sandbox.api.gongkomodotour.com';
      const fullUrl = `${API_URL}${url}`;
      return encodeURI(fullUrl);
    } catch (error) {
      return '/img/default-trip.jpg'; // Fallback ke default image
    }
  };


  // Fetch carousel data from API when component mounts
  React.useEffect(() => {
    const fetchCarouselImages = async (retryCount = 0) => {
      const maxRetries = 3;
      
      try {
        setIsLoading(true);
        const response = await fetch('/api/landing-page/carousels', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // Tambahkan cache control untuk menghindari masalah caching
          cache: 'no-cache'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
          // Filter hanya item yang aktif dan memiliki primary image
          const activeItems = data.data.filter((item: CarouselItem) => 
            item.is_active === '1' && item.primary_image && item.primary_image.file_url
          );
          
          // Sort berdasarkan order_num
          const sortedItems = activeItems.sort((a: CarouselItem, b: CarouselItem) => 
            parseInt(a.order_num) - parseInt(b.order_num)
          );
          
          setCarouselItems(sortedItems);
        } else {
          setCarouselItems([]);
        }
      } catch (error) {
        // Retry jika belum mencapai max retries
        if (retryCount < maxRetries) {
          setTimeout(() => {
            fetchCarouselImages(retryCount + 1);
          }, (retryCount + 1) * 1000);
          return;
        }
        
        // Set empty array on error
        setCarouselItems([]);
      } finally {
        if (retryCount === 0 || retryCount >= maxRetries) {
          setIsLoading(false);
        }
      }
    };

    fetchCarouselImages();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  return (
    <section className="relative h-[92vh] w-screen">
      <style>{customStyles}</style>
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <span>Memuat carousel...</span>
        </div>
      ) : carouselItems.length === 0 ? (
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-900 to-blue-700">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">GONG KOMODO TOUR</h1>
            <p className="text-xl">Memuat carousel...</p>
          </div>
        </div>
      ) : (
        <Swiper
          modules={[Autoplay, Pagination, Navigation, EffectFade]}
          spaceBetween={0}
          slidesPerView={1}
          effect="fade"
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{ 
            clickable: true,
            dynamicBullets: true,
            dynamicMainBullets: 3
          }}
          navigation
          className="h-full w-full"
        >
          {carouselItems.map((carouselItem) => {
            // Debug: Cek apakah primary_image ada dan valid
            const hasPrimaryImage = carouselItem.primary_image && carouselItem.primary_image.file_url;
            const hasAssets = carouselItem.assets && carouselItem.assets.length > 0;
            
            let imageUrl = '/img/default-trip.jpg'; // fallback default
            
            if (hasPrimaryImage) {
              imageUrl = getImageUrl(carouselItem.primary_image.file_url);
            } else if (hasAssets) {
              imageUrl = getImageUrl(carouselItem.assets[0].file_url);
            } else {
              imageUrl = '/img/default-trip.jpg';
            }
            
            // Fallback jika URL tidak valid atau gagal load
            if (!imageUrl || imageUrl === '/img/default-trip.jpg') {
              imageUrl = '/img/default-trip.jpg';
            }
            
            return (
            <SwiperSlide key={carouselItem.id}>
              <div className="h-full w-full relative overflow-hidden">
                <CachedImage
                  src={imageUrl}
                  alt={carouselItem.title || 'Carousel Image'}
                  fill
                  className="object-cover"
                  quality={85}
                  priority={carouselItem.id === carouselItems[0]?.id}
                  sizes="100vw"
                  fallbackSrc="/img/default-trip.jpg"
                />
                <div className="absolute inset-0 flex items-center justify-start pl-18 sm:pl-24 md:pl-28 lg:pl-24 xl:pl-60 pr-4 sm:pr-8 md:pr-12 lg:pr-16 xl:pr-20">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 bg-black/20"
                  />
                  <motion.div 
                    variants={ staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="relative z-10 flex flex-col items-start gap-2 sm:gap-4"
                  >
                    {/* Baris pertama: GONG KOMODO */}
                    <motion.h1
                      variants={fadeInUp}
                      className="text-white uppercase font-bold"
                      style={{
                        fontSize: "clamp(2rem, 8vw, 4rem)",
                        lineHeight: "0.9",
                        textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                      }}
                    >
                      GONG KOMODO
                    </motion.h1>
                    {/* Baris kedua: TOUR dan tombol */}
                    <motion.div 
                      variants={fadeInUp}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6"
                    >
                      <motion.h1
                        className="text-white uppercase font-bold"
                        style={{
                          fontSize: "clamp(2rem, 8vw, 4rem)",
                          lineHeight: "0.9",
                          textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                        }}
                      >
                        TOUR
                      </motion.h1>
                      <Link href="/paket/open-trip">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            className="bg-gold text-white hover:bg-gold-dark-10 rounded-full shadow-lg"
                            style={{
                              fontSize: "clamp(0.875rem, 3vw, 1.25rem)",
                              padding: "clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)",
                              fontWeight: "600",
                            }}
                          >
                            {t('heroButton')}
                          </Button>
                        </motion.div>
                      </Link>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </SwiperSlide>
            );
          })}
        </Swiper>
      )}
    </section>
  );
}
