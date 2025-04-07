// components/ui/TripHighlight.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface Trip {
  id: number;
  name: string;
  type: string;
  assets: {
    id: number;
    file_url: string;
    is_external: boolean;
  }[];
  trip_durations: {
    trip_prices: {
      price_per_pax: string;
    }[];
  }[];
}

interface TripResponse {
  data: Trip[];
  message?: string;
  status?: string;
}

// Gaya kustom untuk efek shadow dan transisi
const customStyles = `
  .text-shadow-nike {
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7), 0 0 10px rgba(0, 0, 0, 0.5);
  }
  .custom-card {
    padding: 0 !important;
    transition: box-shadow 0.3s ease-in-out;
  }
  .custom-card:hover {
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  }
  .hover-text {
    color: white;
    transition: color 0.8s ease-in-out 0.4s, top 2s ease-in-out, bottom 2s ease-in-out, opacity 0.8s ease-in-out;
  }
  .hover-text.hovered {
    color: #CFB53B;
  }
  .hover-text-top {
    margin-bottom: 0;
    line-height: 1;
  }
  .hover-text-bottom {
    margin-top: 0;
    line-height: 1;
  }
`;

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function TripHighlight() {
  const [highlights, setHighlights] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.4,
        duration: 1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const response: TripResponse = await apiRequest<TripResponse>(
          'GET',
          '/api/landing-page/highlighted-trips'
        );
        setHighlights(response.data || []);
      } catch (error) {
        console.error('Error fetching highlighted trips:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHighlights();
  }, []);

  if (loading) {
    return (
      <section className="p-4 py-10 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Our Trip Highlights</h2>
            <p className="text-muted-foreground mt-2">Loading...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="p-4 py-10 bg-gray-50">
      <style>{customStyles}</style>
      <div className="container mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-6"
        >
          <h2 className="text-3xl font-bold text-gray-800">Our Trip Highlights</h2>
        </motion.div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
        >
          {highlights.map((highlight) => {
            const imageUrl = highlight.assets?.[0]?.file_url 
              ? `${API_URL}${highlight.assets[0].file_url}`
              : '/images/placeholder.jpg';

            return (
              <motion.div
                key={highlight.id}
                variants={item}
              >
                <Link
                  href={`/detail-paket/${
                    highlight.type === "Open Trip" ? "open-trip" : "private-trip"
                  }?id=${highlight.id}`}
                  className="aspect-[3/2] block"
                >
                  <Card
                    className="custom-card rounded-tr-sm overflow-hidden cursor-pointer h-full"
                    onMouseEnter={() => setHoveredCard(highlight.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <CardContent className="p-0 relative h-full">
                      <motion.div 
                        className="relative w-full h-full"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      >
                        <Image
                          src={imageUrl}
                          alt={highlight.name}
                          fill
                          className="object-cover rounded-sm"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          quality={100}
                          priority={true}
                        />
                      </motion.div>
                      <div
                        className={`absolute inset-0 transition-opacity duration-800 ${
                          hoveredCard === highlight.id ? "opacity-65 bg-black" : "opacity-0"
                        }`}
                      />
                      <Badge
                        variant="default"
                        className={`absolute top-5 left-5 ${
                          highlight.type === "Open Trip" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-orange-500 hover:bg-orange-600"
                        } text-white`}
                      >
                        {highlight.type}
                      </Badge>

                      <div
                        className={`absolute left-0 right-0 text-center transition-all duration-800 hover-text hover-text-top ${
                          hoveredCard === highlight.id
                            ? "hovered top-[40%] -translate-y-1/2 opacity-100"
                            : "top-0 opacity-0"
                        }`}
                      >
                        <p className="m-0 text-lg font-bold text-shadow-nike text-gold-light-30">
                          {highlight.type}
                        </p>
                      </div>

                      <div
                        className={`absolute left-0 right-0 text-center transition-all duration-800 hover-text hover-text-bottom ${
                          hoveredCard === highlight.id
                            ? "hovered bottom-[40%] translate-y-1/2 opacity-100"
                            : "bottom-0 opacity-0"
                        }`}
                      >
                        <p className="m-0 text-lg text-shadow-nike text-gold-light-20">
                          {highlight.name}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
          className="text-center mt-8"
        >
          <Link href="/paket/open-trip">
            <Button className="bg-gold text-white hover:bg-gold-dark-10 px-6 py-3 rounded-md">
              See more
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
