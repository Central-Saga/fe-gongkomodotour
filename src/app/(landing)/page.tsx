"use client";

import { useEffect, useState } from "react";
import LandingHero from "@/components/ui-home/LandingHero";
import TripHighlight from "@/components/ui-home/TripHighlight";
import AboutUs from "@/components/ui-home/AboutUs";
import WhyChooseUs from "@/components/ui-home/WhyChooseUs";
import Testimonials from "@/components/ui-home/Testimonials";
import FAQ from "@/components/ui-home/FAQ";
import Gallery from "@/components/ui-home/Gallery";
import { Gallery as GalleryType, GalleryResponse } from "@/types/galleries";
import { apiRequest } from "@/lib/api";

export default function Home() {
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

  const formattedGalleryData = galleryData
    .filter(item => item.status === "Aktif" && item.assets?.[0]?.file_url)
    .map((gallery) => ({
      id: gallery.id,
      title: gallery.title,
      description: gallery.description || 'No Description',
      category: gallery.category || 'Uncategorized',
      assets: gallery.assets ?? []
    }));

  return (
    <>
      <LandingHero />
      <TripHighlight />
      <AboutUs />
      <WhyChooseUs />
      {isLoading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      ) : (
        <Gallery data={formattedGalleryData} />
      )}
      <Testimonials />
      <FAQ />
    </>
  );
}
