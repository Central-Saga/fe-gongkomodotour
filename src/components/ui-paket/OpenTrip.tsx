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
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowUpDown, Calendar, X, Filter } from "lucide-react";

interface TripResponse {
  data: Trip[];
  message?: string;
  status?: string;
}

import { getImageUrl } from "@/lib/imageUrl";

export default function OpenTrip() {
  const { t } = useLanguage();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [availableDurations, setAvailableDurations] = useState<string[]>([]);
  const itemsPerPage = 6;

  // Reset filters
  const handleResetFilters = () => {
    setSortBy("");
    setDuration("");
    setCurrentPage(1);
  };

  // Check if any filter is active
  const hasActiveFilters = sortBy !== "" || duration !== "";

  useEffect(() => {
    const fetchOpenTrips = async () => {
      try {
        const response = await apiRequest<TripResponse>('GET', '/api/landing-page/trips?status=1&type=open');
        let openTrips = Array.isArray(response.data) ? response.data : [];

        // Extract unique durations
        const durations = new Set<string>();
        openTrips.forEach(trip => {
          trip.trip_durations?.forEach(duration => {
            if (duration.status === "Aktif") {
              durations.add(duration.duration_label);
            }
          });
        });
        setAvailableDurations(Array.from(durations));

        // Apply sorting
        if (sortBy === "high-low") {
          openTrips.sort((a, b) => {
            const priceA = parseInt(String(a.trip_durations?.[0]?.trip_prices?.[0]?.price_per_pax || "0"));
            const priceB = parseInt(String(b.trip_durations?.[0]?.trip_prices?.[0]?.price_per_pax || "0"));
            return priceB - priceA;
          });
        } else if (sortBy === "low-high") {
          openTrips.sort((a, b) => {
            const priceA = parseInt(String(a.trip_durations?.[0]?.trip_prices?.[0]?.price_per_pax || "0"));
            const priceB = parseInt(String(b.trip_durations?.[0]?.trip_prices?.[0]?.price_per_pax || "0"));
            return priceA - priceB;
          });
        }

        // Apply duration filter
        if (duration) {
          openTrips = openTrips.filter(trip => 
            trip.trip_durations?.some(d => d.duration_label === duration && d.status === "Aktif")
          );
        }

        setTrips(openTrips);
      } catch (error) {
        console.error('Error fetching trips:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOpenTrips();
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
          src="/img/heroopen.png"
          alt="Open Trip Hero"
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
            {t('openTripTitle')}
          </h1>
        </motion.div>
      </motion.section>

      {/* About and Search Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row gap-8">
          {/* About Open Trip */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:w-2/3 bg-white p-8 rounded-lg shadow-lg"
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              {t('aboutOpenTripTitle')}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t('aboutOpenTripDescription')}
            </p>
          </motion.div>

          {/* Search Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:w-1/3 bg-gradient-to-br from-white to-gray-50 p-8 rounded-xl shadow-lg border border-gray-200"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gold" />
                <h3 className="text-xl font-semibold text-gray-800">
                  {t('findYourTripTitle')}
                </h3>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Sort By Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-gold" />
                  {t('sortBy')}
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-gold hover:border-gold transition-colors">
                    <SelectValue placeholder={t('sortBy')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high-low">{t('priceHighToLow')}</SelectItem>
                    <SelectItem value="low-high">{t('priceLowToHigh')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Duration Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gold" />
                  {t('duration')}
                </label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-gold hover:border-gold transition-colors">
                    <SelectValue placeholder={t('duration')} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDurations.length > 0 ? (
                      availableDurations.map((durationLabel) => (
                        <SelectItem key={durationLabel} value={durationLabel}>
                          {durationLabel}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-duration" disabled>
                        {t('noDurationAvailable') || 'Tidak ada durasi tersedia'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Active Filters Summary */}
              {hasActiveFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="pt-2 border-t border-gray-200"
                >
                  <p className="text-xs text-gray-500 mb-2">Filter Aktif:</p>
                  <div className="flex flex-wrap gap-2">
                    {sortBy && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                        <ArrowUpDown className="w-3 h-3 mr-1" />
                        {sortBy === "high-low" ? t('priceHighToLow') : t('priceLowToHigh')}
                      </Badge>
                    )}
                    {duration && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                        <Calendar className="w-3 h-3 mr-1" />
                        {duration}
                      </Badge>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Reset Button */}
              <div className="pt-4 border-t border-gray-200">
                <Button
                  variant={hasActiveFilters ? "default" : "outline"}
                  onClick={handleResetFilters}
                  disabled={!hasActiveFilters}
                  className={`w-full ${
                    hasActiveFilters 
                      ? "bg-red-500 hover:bg-red-600 text-white" 
                      : "border-gray-300 text-gray-400 cursor-not-allowed"
                  } transition-colors`}
                >
                  <X className="w-4 h-4 mr-2" />
                  {t('resetFilters') || 'Reset Filter'}
                </Button>
              </div>
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
              {t('openTripToursTitle')}
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              {t('openTripToursDescription')}
            </p>
          </motion.div>
          
          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentTrips.map((trip, index) => {
              const imageUrl = trip.assets?.[0]?.file_url 
                ? getImageUrl(trip.assets[0].file_url)
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
                        unoptimized={true}
                        priority={index < 3}
                        quality={100}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />
                    </div>
                    
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="bg-green-500 hover:bg-green-600 text-white border-none">
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
                              {trip.trip_durations?.[0]?.duration_label || t('customDuration')}
                            </span>
                          </div>
                          {(() => {
                            const p = trip.trip_durations?.[0]?.trip_prices?.[0];
                            if (!p) return null;
                            const type = (p as { price_type?: "fixed" | "by_request" }).price_type ?? "fixed";
                            const isByRequest = type === "by_request" || p.price_per_pax == null;
                            return (
                              <div className="flex items-center space-x-1">
                                <Image
                                  src="/img/dollar.png"
                                  alt="Price"
                                  width={16}
                                  height={16}
                                  className="w-4 h-4 brightness-200 invert"
                                />
                                <span className="text-sm">
                                  {isByRequest ? "By Request" : `IDR ${parseInt(String(p.price_per_pax)).toLocaleString("id-ID")}${t("perPax")}`}
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                      
                      <div className="h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 group-hover:mt-4 transition-all duration-300">
                        <Link
                          href={`/detail-paket/open-trip?id=${trip.id}`}
                          className="block w-full"
                        >
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full bg-gold text-white py-2 rounded-lg hover:bg-gold-dark transition-colors duration-300"
                          >
                            {t('viewDetails')}
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
                {t('previous')}
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
                {t('next')}
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
