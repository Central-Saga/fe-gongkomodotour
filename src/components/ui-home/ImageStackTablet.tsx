"use client";

import { CachedImage } from "@/components/ui/cached-image";
import { motion } from "framer-motion";

interface ImageStackTabletProps {
  imageSrcs: [string, string, string]; // [left, middle, right]
  alt: string;
}

export default function ImageStackTablet({ imageSrcs, alt }: ImageStackTabletProps) {
  const [leftSrc, middleSrc, rightSrc] = imageSrcs;
  
  return (
    <div className="relative h-[200px] w-full max-w-[500px] mx-auto flex justify-center items-center">
      {/* Gambar Kiri - Tablet Layout */}
      <motion.div 
        initial={{ opacity: 0, rotate: -15, x: -100 }}
        whileInView={{ opacity: 1, rotate: -15, x: 0 }}
        whileHover={{ rotate: 0, scale: 1.05, zIndex: 30 }}
        transition={{ 
          duration: 0.7,
          type: "spring",
          stiffness: 100
        }}
        viewport={{ once: true, margin: "-100px" }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 scale-100"
        style={{ transformOrigin: 'left center' }}
      >
        <CachedImage
          src={leftSrc}
          alt={`${alt} Left`}
          width={160}
          height={200}
          className="rounded-lg shadow-xl object-cover hover:shadow-2xl transition-all duration-300 w-[160px] h-[200px]"
        />
      </motion.div>

      {/* Gambar Tengah - Tablet Layout */}
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
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 scale-100"
      >
        <CachedImage
          src={middleSrc}
          alt={`${alt} Middle`}
          width={160}
          height={200}
          className="rounded-lg shadow-xl object-cover hover:shadow-2xl transition-all duration-300 w-[160px] h-[200px]"
          priority
        />
      </motion.div>

      {/* Gambar Kanan - Tablet Layout */}
      <motion.div 
        initial={{ opacity: 0, rotate: 15, x: 100 }}
        whileInView={{ opacity: 1, rotate: 15, x: 0 }}
        whileHover={{ rotate: 0, scale: 1.05, zIndex: 30 }}
        transition={{ 
          duration: 0.7,
          delay: 0.4,
          type: "spring",
          stiffness: 100
        }}
        viewport={{ once: true, margin: "-100px" }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 scale-100"
        style={{ transformOrigin: 'right center' }}
      >
        <CachedImage
          src={rightSrc}
          alt={`${alt} Right`}
          width={160}
          height={200}
          className="rounded-lg shadow-xl object-cover hover:shadow-2xl transition-all duration-300 w-[160px] h-[200px]"
        />
      </motion.div>
    </div>
  );
}
