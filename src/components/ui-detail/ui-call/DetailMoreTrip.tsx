// components/ui-detail/DetailMoreTrip.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Definisikan tipe untuk data tur
interface TripData {
  image: string;
  label: string;
  name: string;
  duration: string;
  priceIDR: string;
  slug: string;
}

// Definisikan tipe untuk props komponen
interface DetailMoreTripProps {
  trips: TripData[];
  tripType: "open-trip" | "private-trip";
}

export default function DetailMoreTrip({ trips, tripType }: DetailMoreTripProps) {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4 text-gray-800">
            More {tripType === "open-trip" ? "Open Trip" : "Private Trip"}
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
            Discover our selection of group travel packages, perfect for those who want to explore with other adventurers.
          </p>
        </motion.div>
        
        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.slice(0, 3).map((trip, index) => (
            <motion.div
              key={trip.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="aspect-[5/3]"
            >
              <Card className="group relative h-full overflow-hidden">
                <div className="absolute inset-0">
                  <Image
                    src={trip.image}
                    alt={trip.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    priority={index < 3}
                    quality={100}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />
                </div>
                
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className={`${tripType === "open-trip" ? "bg-green-500" : "bg-red-500"} hover:${tripType === "open-trip" ? "bg-green-600" : "bg-red-600"} text-white border-none`}>
                    {trip.label}
                  </Badge>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="transform transition-transform duration-300 group-hover:-translate-y-4">
                    <h3 className="text-xl font-semibold mb-2">{trip.name}</h3>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Image
                          src="/img/sun.png"
                          alt="Duration"
                          width={16}
                          height={16}
                          className="w-4 h-4 brightness-200 invert"
                        />
                        <span className="text-sm">{trip.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Image
                          src="/img/dollar.png"
                          alt="Price"
                          width={16}
                          height={16}
                          className="w-4 h-4 brightness-200 invert"
                        />
                        <span className="text-sm">{trip.priceIDR}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 group-hover:mt-4 transition-all duration-300">
                    <Link
                      href={`/detail-paket/${tripType}?id=${trip.slug}`}
                      className="block w-full"
                    >
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full bg-gold text-white py-2 rounded-lg hover:bg-gold-dark transition-colors duration-300"
                      >
                        View Details
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}