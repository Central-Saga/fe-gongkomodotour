"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { Trip } from "@/types/trips";
import { Button } from "@/components/ui/button";

interface TripResponse {
  data: Trip[];
  message?: string;
  status?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function PrivateTrip() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [availableDurations, setAvailableDurations] = useState<string[]>([]);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchPrivateTrips = async () => {
      try {
        const response = await apiRequest<TripResponse>('GET', '/api/landing-page/trips?status=1&type=private');
        let privateTrips = Array.isArray(response.data) ? response.data : [];

        // Extract unique durations
        const durations = new Set<string>();
        privateTrips.forEach(trip => {
          trip.trip_durations?.forEach(duration => {
            if (duration.status === "Aktif") {
              durations.add(duration.duration_label);
            }
          });
        });
        setAvailableDurations(Array.from(durations));

        // Apply sorting
        if (sortBy === "high-low") {
          privateTrips.sort((a, b) => {
            const priceA = parseInt(a.trip_durations?.[0]?.trip_prices?.[0]?.price_per_pax || "0");
            const priceB = parseInt(b.trip_durations?.[0]?.trip_prices?.[0]?.price_per_pax || "0");
            return priceB - priceA;
          });
        } else if (sortBy === "low-high") {
          privateTrips.sort((a, b) => {
            const priceA = parseInt(a.trip_durations?.[0]?.trip_prices?.[0]?.price_per_pax || "0");
            const priceB = parseInt(b.trip_durations?.[0]?.trip_prices?.[0]?.price_per_pax || "0");
            return priceA - priceB;
          });
        }

        // Apply duration filter
        if (duration) {
          privateTrips = privateTrips.filter(trip => 
            trip.trip_durations?.some(d => d.duration_label === duration && d.status === "Aktif")
          );
        }

        setTrips(privateTrips);
      } catch (error) {
        console.error('Error fetching trips:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrivateTrips();
  }, [sortBy, duration]);

  // Calculate pagination
  const totalPages = Math.ceil(trips.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTrips = trips.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-[500px] w-full overflow-hidden"
      >
        <Image
          src="/img/heroprivate.png"
          alt="Private Trip Hero"
          fill
          className="object-cover object-center"
          quality={100}
          priority
        />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="absolute inset-0 bg-black/40 flex items-center justify-center"
        >
          <h1 className="text-5xl font-bold text-white tracking-wide">
            PRIVATE TRIP
          </h1>
        </motion.div>
      </motion.section>

      {/* About and Search Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row gap-8">
          {/* About Private Trip */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:w-2/3 bg-white p-8 rounded-lg shadow-lg"
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              About Private Trip
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Private Trip is an exclusive travel package specially designed for groups or individuals, where participants can arrange the itinerary according to their needs. This package offers a more personal and flexible experience.
            </p>
          </motion.div>

          {/* Search Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:w-1/3 bg-white p-8 rounded-lg shadow-lg"
          >
            <h3 className="text-xl font-semibold mb-6 text-gray-800">
              Find Your Trip
            </h3>
            <div className="space-y-6">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-gold">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high-low">Price: High to Low</SelectItem>
                  <SelectItem value="low-high">Price: Low to High</SelectItem>
                </SelectContent>
              </Select>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-gold">
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent>
                  {availableDurations.map((duration) => (
                    <SelectItem key={duration} value={duration}>
                      {duration}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tours Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              Private Trip Tours
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              Discover our selection of exclusive travel packages, perfect for those who want a personalized experience.
            </p>
          </motion.div>
          
          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentTrips.map((trip, index) => {
              const imageUrl = trip.assets?.[0]?.file_url 
                ? `${API_URL}${trip.assets[0].file_url}`
                : '/img/default-trip.jpg';

              return (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="aspect-[5/3]"
                >
                  <Card className="group relative h-full overflow-hidden">
                    <div className="absolute inset-0">
                      <Image
                        src={imageUrl}
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
                      <Badge variant="secondary" className="bg-orange-500 hover:bg-orange-600 text-white border-none">
                        {trip.type}
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
                            <span className="text-sm">
                              {trip.trip_durations?.[0]?.duration_label || trip.duration || "Custom Duration"}
                            </span>
                          </div>
                          {trip.trip_durations?.[0]?.trip_prices?.[0]?.price_per_pax && (
                            <div className="flex items-center space-x-1">
                              <Image
                                src="/img/dollar.png"
                                alt="Price"
                                width={16}
                                height={16}
                                className="w-4 h-4 brightness-200 invert"
                              />
                              <span className="text-sm">
                                IDR {parseInt(trip.trip_durations[0].trip_prices[0].price_per_pax).toLocaleString('id-ID')}/pax
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 group-hover:mt-4 transition-all duration-300">
                        <Link
                          href={`/detail-paket/private-trip?id=${trip.id}`}
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
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? "bg-gold text-white" : ""}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
