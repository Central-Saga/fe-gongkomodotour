"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

// Impor gaya Swiper
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

// Gaya kustom untuk pagination bullets
const customStyles = `
  .swiper-pagination-bullet {
    width: 18px;
    height: 18px;
    background: var(--gold);
    opacity: 0.7;
    transition: all 0.3s ease;
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
  }
  .swiper-button-next:hover,
  .swiper-button-prev:hover {
    color: var(--gold-dark-10) !important;
  }
`;

export default function LandingHero() {
  const slides = [
    "/img/landingpage/hero-slide1.png",
    "/img/boat/bg-luxury.jpg",
    "/img/boat/luxury_phinisi.jpg",
    "/img/landingpage/hero-slide2.png",
  ];

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
    <section className="relative h-[80vh] w-screen">
      <style>{customStyles}</style>
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        effect="fade"
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        navigation
        className="h-full w-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div
              className="h-full w-full bg-cover bg-center flex items-center justify-start px-50"
              style={{ backgroundImage: `url(${slide})` }}
            >
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 bg-black/20"
              />
              <motion.div 
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="relative z-10 px-4 flex flex-col items-start gap-2"
              >
                {/* Baris pertama: GONG KOMODO */}
                <motion.h1
                  variants={fadeInUp}
                  className="text-white uppercase font-bold text-center"
                  style={{
                    fontSize: "clamp(5rem, 5vw, 3.5rem)",
                    lineHeight: "1",
                  }}
                >
                  GONG KOMODO
                </motion.h1>
                {/* Baris kedua: TOUR dan tombol */}
                <motion.div 
                  variants={fadeInUp}
                  className="flex items-center gap-6"
                >
                  <motion.h1
                    className="text-white uppercase font-bold text-center"
                    style={{
                      fontSize: "clamp(5rem, 5vw, 3.5rem)",
                      lineHeight: "1",
                    }}
                  >
                    TOUR
                  </motion.h1>
                  <Link href="/trip">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        className="bg-gold text-white hover:bg-gold-dark-10 rounded-full"
                        style={{
                          fontSize: "clamp(2rem, 2.75vw, 1.75rem)",
                          padding: "clamp(2rem, 2.75vw, 1.5rem) clamp(2rem, 4.5vw, 2.75rem)",
                        }}
                      >
                        Check Trip
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}