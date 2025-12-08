"use client";

import { CachedImage } from "@/components/ui/cached-image";
import { motion } from "framer-motion";

interface ImageStackMobileProps {
  imageSrcs: [string, string, string]; // [left, middle, right]
  alt: string;
}

export default function ImageStackMobile({ imageSrcs, alt }: ImageStackMobileProps) {
  const [leftSrc, middleSrc, rightSrc] = imageSrcs;
  
  return (
    <div className="relative h-[250px] w-full max-w-[400px] mx-auto flex justify-center items-center">
      {/* Gambar Kiri - Mobile Layout */}
      <motion.div 
        initial={{ opacity: 0, rotate: -15, x: -80 }}
        whileInView={{ opacity: 1, rotate: -15, x: 0 }}
        whileHover={{ rotate: 0, scale: 1.05, zIndex: 30 }}
        transition={{ 
          duration: 0.7,
          type: "spring",
          stiffness: 100
        }}
        viewport={{ once: true, margin: "-100px" }}
        className="absolute left-10 top-1/2 -translate-y-1/2 z-10 scale-[0.8]"
        style={{ transformOrigin: 'left center' }}
      >
        <CachedImage
          src={leftSrc}
          alt={`${alt} Left`}
          width={320}
          height={400}
          className="rounded-lg shadow-xl object-cover hover:shadow-2xl transition-all duration-300 w-[320px] h-[400px]"
        />
      </motion.div>

      {/* Gambar Tengah - Mobile Layout */}
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.05, zIndex: 30 }}
        transition={{ 
          duration: 0.7,
          delay: 0.2,
          type: "spring",
          stiffness: 100
        }}
        viewport={{ once: true, margin: "-100px" }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 scale-[0.8]"
      >
        <CachedImage
          src={middleSrc}
          alt={`${alt} Middle`}
          width={320}
          height={400}
          className="rounded-lg shadow-xl object-cover hover:shadow-2xl transition-all duration-300 w-[320px] h-[400px]"
          priority
        />
      </motion.div>

      {/* Gambar Kanan - Mobile Layout */}
      <motion.div 
        initial={{ opacity: 0, rotate: 15, x: 80 }}
        whileInView={{ opacity: 1, rotate: 15, x: 0 }}
        whileHover={{ rotate: 0, scale: 1.05, zIndex: 30 }}
        transition={{ 
          duration: 0.7,
          delay: 0.4,
          type: "spring",
          stiffness: 100
        }}
        viewport={{ once: true, margin: "-100px" }}
        className="absolute right-10 top-1/2 -translate-y-1/2 z-10 scale-[0.8]"
        style={{ transformOrigin: 'right center' }}
      >
        <CachedImage
          src={rightSrc}
          alt={`${alt} Right`}
          width={320}
          height={400}
          className="rounded-lg shadow-xl object-cover hover:shadow-2xl transition-all duration-300 w-[320px] h-[400px]"
        />
      </motion.div>
    </div>
  );
}
