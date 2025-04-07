"use client"; // Direktif untuk menjadikan file ini sebagai Client Component

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { Button } from "@/components/ui/button"; // Impor komponen Button dari ShadCN UI
import { motion } from "framer-motion";

// Komponen Utama Gallery
export default function Gallery() {
  const galleryImages = [
    { src: "/videos/landingvidio.mp4", alt: "Gallery Video", id: "1" },
    { src: "/img/gallery1.jpg", alt: "Gallery Image 1", id: "1" },
    { src: "/img/gallery2.jpg", alt: "Gallery Image 2", id: "2" },
    { src: "/img/gallery3.jpg", alt: "Gallery Image 3", id: "3" },
    { src: "/img/gallery4.jpg", alt: "Gallery Image 4", id: "4" },
    { src: "/img/gallery5.jpg", alt: "Gallery Image 5", id: "5" },
    { src: "/img/gallery6.jpg", alt: "Gallery Image 6", id: "6" },
    { src: "/img/gallery7.jpg", alt: "Gallery Image 7", id: "7" },
    { src: "/img/gallery8.jpg", alt: "Gallery Image 8", id: "8" },
    { src: "/img/gallery9.jpg", alt: "Gallery Image 9", id: "9" },
  ];

  // Menggunakan useRef untuk mengakses elemen video
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fungsi untuk menangani klik pada video
  const handleVideoClick = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  // Fungsi untuk menampilkan kontrol saat hover
  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.setAttribute("controls", "");
    }
  };

  // Fungsi untuk menyembunyikan kontrol saat mouse meninggalkan video
  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.removeAttribute("controls");
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900">Travel Gallery</h2>
          <p className="text-gray-600 mt-4 max-w-3xl mx-auto">
            Explore breathtaking moments from our adventures in Komodo National Park. 
            From stunning underwater landscapes to encounters with ancient dragons, 
            each image tells a unique story of Indonesia&apos;s natural beauty.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Kolom Kiri: Video */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="w-full rounded-lg overflow-hidden relative"
          >
            <video
              ref={videoRef}
              className="w-full rounded-lg"
              style={{ height: "500px", objectFit: "cover" }}
              onClick={handleVideoClick}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <source src="/videos/landingvidio.mp4" type="video/mp4" />
              <Image
                src="/img/gallery1.jpg"
                alt="Fallback Video Galeri"
                width={600}
                height={500}
                className="w-full h-auto object-cover"
                quality={100}
                priority={true}
              />
            </video>
          </motion.div>

          {/* Kolom Kanan: Grid Gambar */}
          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-3 gap-4"
          >
            {galleryImages.slice(1, 7).map((image) => (
              <motion.div
                key={image.id}
                variants={item}
                className="aspect-square"
              >
                <Link href={`/gallery/${image.id}`}>
                  <div className="relative h-full overflow-hidden rounded-lg bg-white shadow-md hover:shadow-xl transition-all duration-300">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover rounded-lg hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="flex justify-center mt-12"
        >
          <Link href="/gallery">
            <Button
              className="bg-gold text-white px-6 py-3 rounded-md text-base hover:bg-gold-dark-10 hover:scale-105 transition-all duration-300"
            >
              See More
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}