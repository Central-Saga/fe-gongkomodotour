"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { motion } from "framer-motion";

export default function AboutUs() {
  return (
    <section className="py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Kolom Kiri: Konten Teks */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="p-6"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">About Us</h2>
            <p className="text-black mb-6 leading-relaxed text-xl">
              Since 2010, Gong Komodo Tour has been dedicated to providing exceptional travel experiences to Komodo National Park. Our private tours are crafted to showcase the region&apos;s natural beauty and unique wildlife.
              <br />
              <br />
              With private boats, expert guides, and a commitment to customer satisfaction, we ensure your journey is comfortable and unforgettable. Discover the wonders of Komodo with us.
            </p>
            <Link href="/about">
              <Button className="bg-gold-dark-10 text-white px-6 py-3 hover:bg-gold-dark-20 transition-colors rounded-md">
                Read more
              </Button>
            </Link>
          </motion.div>

          {/* Kolom Kanan: Gambar Stack */}
          <div className="relative h-[500px] w-full max-w-[600px] mx-auto">
            {/* Gambar Kiri */}
            <motion.div 
              initial={{ opacity: 0, rotate: -15 }}
              whileInView={{ opacity: 1, rotate: -15 }}
              whileHover={{ rotate: 0, scale: 1.05, zIndex: 30 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
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
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05, zIndex: 30 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
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
              initial={{ opacity: 0, rotate: 15 }}
              whileInView={{ opacity: 1, rotate: 15 }}
              whileHover={{ rotate: 0, scale: 1.05, zIndex: 30 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
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
          </div>
        </div>
      </div>
    </section>
  );
}