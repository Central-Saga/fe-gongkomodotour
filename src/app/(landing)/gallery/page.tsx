"use client"
import React, { useEffect, useState } from "react";
import Gallery from "@/components/ui-gallery/Gallery";
import { motion } from "framer-motion";
import { Gallery as GalleryType, GalleryResponse } from "@/types/galleries";
import { apiRequest } from "@/lib/api";

export default function GalleryPage() {
  const [galleryData, setGalleryData] = useState<GalleryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        const response = await apiRequest<GalleryResponse>(
          "GET",
          "/api/landing-page/gallery"
        );
        setGalleryData(response.data);
      } catch (error) {
        console.error("Error fetching gallery data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGalleryData();
  }, []);

  const formattedGalleryData = galleryData.map((gallery) => ({
    image: gallery.assets?.[0]?.file_url || "/img/default-gallery.jpg",
    title: gallery.title,
    description: gallery.description || 'No Description',
    category: gallery.category || 'Uncategorized',
  }));

  return (
    <main className="gallery-page bg-gray-100">
      <section className="text-center py-10">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-gray-800 mb-4"
        >
          Our Gallery: Photos & Videos from Gong Komodo Tour
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-600 max-w-3xl mx-auto"
        >
          Discover the beauty of Komodo through our stunning collection of photos and videos. 
          From breathtaking landscapes to unforgettable moments, each image tells a unique story 
          of adventure and exploration. Let these visuals inspire your next journey to Komodo!
        </motion.p>
      </section>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {isLoading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        ) : (
          <Gallery data={formattedGalleryData} />
        )}
      </motion.div>
    </main>
  );
}