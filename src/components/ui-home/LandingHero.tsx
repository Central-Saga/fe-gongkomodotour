"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
    background: #fbbf24;
    opacity: 0.7;
    transition: all 0.3s ease;
  }
  .swiper-pagination-bullet-active {
    width: 25px;
    height: 25px;
    background: #fbbf24;
    opacity: 1;
  }
`;

export default function LandingHero() {
  const slides = [
    "/img/landingpage/hero-slide1.png",
    "/img/boat/bg-luxury.jpg",
    "/img/boat/luxury_phinisi.jpg",
    "/img/landingpage/hero-slide2.png",
  ];

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
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10 px-4 flex flex-col items-start gap-2">
                {/* Baris pertama: GONG KOMODO */}
                <h1
                  className="text-white uppercase font-bold text-center"
                  style={{
                    fontSize: "clamp(3rem, 4vw, 2.5rem)",
                    lineHeight: "1",
                  }}
                >
                  GONG KOMODO
                </h1>
                {/* Baris kedua: TOUR dan tombol */}
                <div className="flex items-center gap-6">
                  <h1
                    className="text-white uppercase font-bold text-center"
                    style={{
                      fontSize: "clamp(3rem, 4vw, 2.5rem)", // Reduced font size
                      lineHeight: "1",
                    }}
                  >
                    TOUR
                  </h1>
                  <Link href="/trip">
                    <Button
                      className="bg-yellow-500 text-white hover:bg-[#f59e0b] rounded-full"
                      style={{
                        fontSize: "clamp(1rem, 2vw, 1.25rem)", // Reduced font size
                        padding:
                          "clamp(1rem, 2vw, 1rem) clamp(1.5rem, 3vw, 1.5rem)", // Reduced padding
                      }}
                    >
                      Check Trip
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
