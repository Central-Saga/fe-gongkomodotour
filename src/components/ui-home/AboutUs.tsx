"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";

export default function AboutUs() {
  const sectionRef = useRef(null);
  
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
      className="py-10 bg-gray-50 overflow-hidden"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Kolom Kiri: Konten Teks */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className="p-6"
          >
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-gray-800 mb-4"
            >
              About Us
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-black mb-6 leading-relaxed text-xl"
            >
              Since 2010, Gong Komodo Tour has been dedicated to providing exceptional travel experiences to Komodo National Park. Our private tours are crafted to showcase the region&apos;s natural beauty and unique wildlife.
              <br />
              <br />
              With private boats, expert guides, and a commitment to customer satisfaction, we ensure your journey is comfortable and unforgettable. Discover the wonders of Komodo with us.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <Link href="/about">
                <Button className="bg-gold text-white px-6 py-3 hover:bg-gold-dark-10 transition-all duration-300 rounded-md hover:scale-105">
                  Read more
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Kolom Kanan: Gambar Stack */}
          <motion.div 
            style={{ scale: smoothScale }}
            className="relative h-[500px] w-full max-w-[600px] mx-auto"
          >
            {/* Gambar Kiri */}
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
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10"
            >
              <Image
                src="/img/about.png"
                alt="About Us Left"
                width={320}
                height={400}
                className="rounded-lg shadow-xl object-cover hover:shadow-2xl transition-all duration-300"
              />
            </motion.div>

            {/* Gambar Tengah */}
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
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
            >
              <Image
                src="/img/about.png"
                alt="About Us Middle"
                width={320}
                height={400}
                className="rounded-lg shadow-xl object-cover hover:shadow-2xl transition-all duration-300"
              />
            </motion.div>

            {/* Gambar Kanan */}
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
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10"
            >
              <Image
                src="/img/about.png"
                alt="About Us Right"
                width={320}
                height={400}
                className="rounded-lg shadow-xl object-cover hover:shadow-2xl transition-all duration-300"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}