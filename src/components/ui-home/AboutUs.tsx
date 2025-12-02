"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import ResponsiveImageStack from "./ResponsiveImageStack";

export default function AboutUs() {
  const sectionRef = useRef(null);
  const { t } = useLanguage();
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);
  
  const smoothScale = useSpring(scale, { stiffness: 100, damping: 30 });

  return (
    <motion.section 
      ref={sectionRef}
      style={{ opacity }}
      className="py-47 bg-gray-50 overflow-hidden"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-center">
          {/* Kolom Kiri: Konten Teks */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="p-4 sm:p-6"
          >
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4"
            >
              {t('aboutTitle')}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-black mb-6 leading-relaxed text-base sm:text-lg md:text-xl"
            >
              {t('aboutDescription')}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <Link href="/about-us">
                <Button className="bg-gold text-white px-6 py-3 hover:bg-gold-dark-10 transition-all duration-300 rounded-md hover:scale-105">
                  {t('learnMore')}
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Kolom Kanan: Gambar Stack Responsif */}
          <motion.div 
            style={{ scale: smoothScale }}
            className="w-full"
          >
            <ResponsiveImageStack 
              imageSrcs={[
                "/img/about-landing/about2.jpg",
                "/img/about-landing/about1.jpg",
                "/img/about-landing/about3.jpg"
              ]}
              alt="About Us" 
            />
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
