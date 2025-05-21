"use client"; // Direktif untuk menjadikan file ini sebagai Client Component

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button"; // Impor komponen Button dari ShadCN UI
import { motion, Variants } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface GalleryItem {
  id: number;
  title: string;
  description: string;
  category?: string;
  assets: {
    id: number;
    file_url: string;
  }[];
}

interface GalleryProps {
  data: GalleryItem[];
}

// Komponen Utama Gallery
export default function Gallery({ data }: GalleryProps) {
  // Menggunakan useRef untuk mengakses elemen video
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);

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

  const handleItemClick = (item: GalleryItem) => {
    setSelectedItem(item);
    setIsOpen(true);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants: Variants = {
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
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-3 gap-4"
          >
            {data.slice(0, 6).map((item) => (
              <motion.div
                key={`gallery-item-${item.id}`}
                variants={itemVariants}
                className="aspect-square group relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border border-gold/20 hover:border-gold"
                onClick={() => handleItemClick(item)}
              >
                <div className="relative h-full w-full">
                  <Image
                    src={`${API_URL}${item.assets[0].file_url}`}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-white text-sm font-semibold text-center line-clamp-2">
                      {item.title}
                    </h3>
                    {item.category && (
                      <span className="text-gold text-xs text-center block mt-2 bg-black/40 px-3 py-1 rounded-full inline-block border border-gold/30">
                        {item.category}
                      </span>
                    )}
                  </div>
                </div>
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

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl bg-white border-gold">
          <DialogHeader>
            <DialogTitle className="text-gold">{selectedItem?.title}</DialogTitle>
            <DialogDescription className="text-gray-600">{selectedItem?.description}</DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-gold/20">
                <Image
                  src={`${API_URL}${selectedItem.assets[0].file_url}`}
                  alt={selectedItem.title}
                  fill
                  className="object-cover"
                />
              </div>
              {selectedItem.category && (
                <div className="flex justify-center">
                  <span className="bg-gold/10 text-gold text-sm px-4 py-1.5 rounded-full border border-gold/20">
                    {selectedItem.category}
                  </span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
