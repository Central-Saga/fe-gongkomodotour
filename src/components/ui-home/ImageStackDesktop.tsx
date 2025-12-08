"use client";

import { CachedImage } from "@/components/ui/cached-image";
import { motion } from "framer-motion";

interface ImageStackDesktopProps {
  imageSrcs: [string, string, string]; // [left, middle, right]
  alt: string;
}

export default function ImageStackDesktop({ imageSrcs, alt }: ImageStackDesktopProps) {
  const [leftSrc, middleSrc, rightSrc] = imageSrcs;
  
  return (
    <div className="relative h-[280px] w-full max-w-[700px] mx-auto flex justify-center items-center">
      {/* Gambar Kiri - Desktop Layout */}
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
        className="absolute left-20 top-1/2 -translate-y-1/2 z-10 scale-100"
        style={{ transformOrigin: 'left center' }}
      >
        <CachedImage
          src={leftSrc}
          alt={`${alt} Left`}
          width={220}
          height={280}
          className="rounded-lg shadow-xl object-cover hover:shadow-2xl transition-all duration-300 w-[220px] h-[280px]"
        />
      </motion.div>

      {/* Gambar Tengah - Desktop Layout */}
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
          width={220}
          height={280}
          className="rounded-lg shadow-xl object-cover hover:shadow-2xl transition-all duration-300 w-[220px] h-[280px]"
          priority={true}
        />
      </motion.div>

      {/* Gambar Kanan - Desktop Layout */}
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
        className="absolute right-20 top-1/2 -translate-y-1/2 z-10 scale-100"
        style={{ transformOrigin: 'right center' }}
      >
        <CachedImage
          src={rightSrc}
          alt={`${alt} Right`}
          width={220}
          height={280}
          className="rounded-lg shadow-xl object-cover hover:shadow-2xl transition-all duration-300 w-[220px] h-[280px]"
        />
      </motion.div>
    </div>
  );
}
