"use client"
import React, { useState } from "react";
import Image from "next/image";
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
  image: string;
  title: string;
  description: string;
  category?: string;
}

interface GalleryProps {
  data: GalleryItem[];
}

const Gallery: React.FC<GalleryProps> = ({ data }) => {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const handleItemClick = (item: GalleryItem) => {
    setSelectedItem(item);
    setIsOpen(true);
  };

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
      >
        {data.map((item, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="group relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border border-gold/20 hover:border-gold"
            onClick={() => handleItemClick(item)}
          >
            <div className="relative h-64 w-full">
              <Image
                src={`${API_URL}${item.image}`}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <h3 className="text-white text-lg font-semibold text-center line-clamp-2">
                {truncateText(item.title || 'No Title', 30)}
              </h3>
              <p className="text-white/90 text-sm text-center mt-2 line-clamp-3">
                {truncateText(item.description || 'No Description', 60)}
              </p>
              {item.category && (
                <span className="text-gold text-xs text-center block mt-2 bg-black/40 px-3 py-1 rounded-full inline-block border border-gold/30">
                  {item.category}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

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
                  src={`${API_URL}${selectedItem.image}`}
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
};

export default Gallery;