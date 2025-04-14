"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/api";
import { Trip } from "@/types/trips";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface PackageData {
  id: string;
  title: string;
  price: string;
  daysTrip: string;
  type: "Open Trip" | "Private Trip";
  image: string;
  mainImage?: string;
  itinerary?: {
    durationId: number;
    durationLabel: string;
    days: { day: string; activities: string }[];
  }[];
  boatImages?: { image: string; title: string; id: string }[];
  has_boat?: boolean;
  trip_durations?: {
    id: number;
    duration_label: string;
    itineraries: { day: string; activities: string }[];
  }[];
}

export default function Booking() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageId = searchParams.get("packageId");
  const dateParam = searchParams.get("date");
  const packageType = searchParams.get("type");

  const [selectedPackage, setSelectedPackage] = useState<PackageData | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    dateParam ? new Date(dateParam) : undefined
  );
  const [tripCount, setTripCount] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState<string>("");
  const [selectedBoat, setSelectedBoat] = useState<string>("");
  const [selectedCabin, setSelectedCabin] = useState<string>("");
  const [additionalCharges, setAdditionalCharges] = useState<string[]>([]);

  const calculateSurcharge = () => {
    if (!selectedPackage || !selectedDate) return null;

    const highSeasonPeriods = [
      "1 June ~ 31 August 2025",
      "1-10 October 2025",
      "14–20 February 2026",
      "17–24 March 2026",
    ];
    const peakSeasonPeriods = [
      "25 March ~ 5 April 2025",
      "20 December 2025 ~ 5 January 2026",
    ];

    const highSeasonPrice = "IDR 300.000/pax";
    const peakSeasonPrice = "IDR 500.000/pax";

    const isHighSeason = highSeasonPeriods.some((period) => {
      const [start, end] = period
        .split("~")
        .map((date) => new Date(date.trim()));
      return selectedDate >= start && selectedDate <= end;
    });

    const isPeakSeason = peakSeasonPeriods.some((period) => {
      const [start, end] = period
        .split("~")
        .map((date) => new Date(date.trim()));
      return selectedDate >= start && selectedDate <= end;
    });

    if (isPeakSeason) return peakSeasonPrice;
    if (isHighSeason) return highSeasonPrice;
    return null;
  };

  const surcharge = calculateSurcharge();

  useEffect(() => {
    const fetchTripData = async () => {
      if (!packageId) return;

      try {
        const response = await apiRequest<{ data: Trip }>(
          'GET',
          `/api/landing-page/trips/${packageId}`
        );

        if (response.data) {
          const trip = response.data;
          const transformedData: PackageData = {
            id: trip.id.toString(),
            title: trip.name,
            price: trip.trip_durations?.[0]?.trip_prices?.[0]?.price_per_pax?.toString() || "0",
            daysTrip: trip.trip_durations?.[0]?.duration_label || "",
            type: trip.type,
            image: trip.assets?.[0]?.file_url ? `${API_URL}${trip.assets[0].file_url}` : "/img/default-image.png",
            mainImage: trip.assets?.[0]?.file_url ? `${API_URL}${trip.assets[0].file_url}` : "/img/default-image.png",
            itinerary: trip.trip_durations?.map(duration => ({
              durationId: duration.id,
              durationLabel: duration.duration_label,
              days: duration.itineraries?.map(itinerary => ({
                day: `Day ${itinerary.day_number}`,
                activities: itinerary.activities
              })) || []
            })),
            boatImages: trip.boat_assets?.map(asset => ({
              image: asset.file_url ? `${API_URL}${asset.file_url}` : "/img/default-image.png",
              title: asset.title || "Boat",
              id: asset.id.toString()
            })),
            has_boat: trip.has_boat,
            trip_durations: trip.trip_durations?.map(duration => ({
              id: duration.id,
              duration_label: duration.duration_label,
              itineraries: duration.itineraries?.map(itinerary => ({
                day: `Day ${itinerary.day_number}`,
                activities: itinerary.activities
              })) || []
            }))
          };

          setSelectedPackage(transformedData);
        }
      } catch (error) {
        console.error('Error fetching trip data:', error);
      }
    };

    fetchTripData();
  }, [packageId]);

  const isFormComplete = selectedPackage && selectedDate && tripCount > 0;

  const handleDurationChange = (value: string) => {
    setSelectedDuration(value);
    // Reset boat dan cabin saat durasi berubah
    setSelectedBoat("");
    setSelectedCabin("");
  };

  const handleBoatChange = (value: string) => {
    setSelectedBoat(value);
    // Reset cabin saat boat berubah
    setSelectedCabin("");
  };

  const calculateTotalPrice = () => {
    if (!selectedPackage?.price) return 0;
    
    const basePrice = parseInt(selectedPackage.price);
    const surchargeAmount = surcharge ? parseInt(surcharge.replace(/[^0-9]/g, '')) : 0;
    const totalPerPax = basePrice + surchargeAmount;
    
    return totalPerPax * tripCount;
  };

  if (!packageId || !selectedPackage) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex justify-center p-8">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl">
          <h1 className="text-3xl font-bold text-center mb-6">YOUR BOOKING</h1>
          <p className="text-center text-gray-600">
            No package selected. Please select a package to book.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#efeaea] flex justify-center p-8"
    >
      <Card className="w-full max-w-9xl p-6">
        <motion.h1 
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl font-bold text-center mb-6"
        >
          YOUR BOOKING
        </motion.h1>
        <div className="flex space-x-6">
          {/* Left Section: Trip Information */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-1/3"
          >
            <div className="relative">
              <Image
                src={selectedPackage.mainImage || "/img/default-image.png"}
                alt={selectedPackage.title}
                width={500}
                height={900}
                layout="responsive"
                className="rounded-lg object-cover"
              />
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="absolute top-4 left-4"
              >
                <Badge variant="secondary" className={packageType === "open" ? "bg-green-500 hover:bg-green-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"}>
                  {packageType === "open" ? "Open Trip" : "Private Trip"}
                </Badge>
              </motion.div>
            </div>
            <div className="mt-4 space-y-4">
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-xl font-semibold"
              >
                {selectedPackage.title}
              </motion.h2>
              
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex items-center space-x-4"
              >
                <Label htmlFor="pax">Jumlah Pax</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTripCount((prev) => Math.max(prev - 1, 0))}
                    className="hover:bg-gold hover:text-white transition-colors duration-300"
                  >
                    -
                  </Button>
                  <Input
                    id="pax"
                    type="number"
                    value={tripCount}
                    readOnly
                    className="w-16 text-center"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTripCount((prev) => prev + 1)}
                    className="hover:bg-gold hover:text-white transition-colors duration-300"
                  >
                    +
                  </Button>
                </div>
              </motion.div>

              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="space-y-2"
              >
                <p className="text-gray-600">{selectedPackage.daysTrip}</p>
                <p className="text-2xl font-bold text-gold">
                  {selectedPackage.price ? `IDR ${parseInt(selectedPackage.price).toLocaleString('id-ID')}/pax` : "Harga belum tersedia"}
                </p>
              </motion.div>

              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="space-y-2"
              >
                <h3 className="text-lg font-semibold">Detail Pembayaran</h3>
                <div className="space-y-1">
                  <p className="text-gray-600">Sub Total</p>
                  <p className="text-gray-600">
                    • {packageType === "open" ? "Open Trip" : "Private Trip"}{" "}
                    {selectedPackage.price ? `IDR ${parseInt(selectedPackage.price).toLocaleString('id-ID')}/pax` : "0"}
                  </p>
                  {surcharge && (
                    <p className="text-gray-600">• High Peak Season {surcharge}</p>
                  )}
                </div>
                <div className="border-t pt-2">
                  <p className="text-lg font-semibold">
                    Total Pembayaran:{" "}
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={calculateTotalPrice()}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="text-gold"
                      >
                        IDR {calculateTotalPrice().toLocaleString('id-ID')}
                      </motion.span>
                    </AnimatePresence>
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                <Button
                  className={`w-full py-4 rounded-lg font-bold text-2xl ${
                    isFormComplete
                      ? "bg-gold text-white hover:bg-gold-dark-20"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  } transition-colors duration-300`}
                  disabled={!isFormComplete}
                  onClick={() =>
                    isFormComplete &&
                    router.push(
                      `/payment?packageId=${packageId}&type=${packageType}&date=${selectedDate?.toISOString()}&tripCount=${tripCount}`
                    )
                  }
                >
                  BOOK NOW
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Section: Booking Form */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="w-2/3"
          >
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex justify-between mb-4"
            >
              <Badge variant="secondary" className="bg-[#efe6e6] text-gray-700 hover:bg-[#efe6e6]/80">
                DOMESTIC
              </Badge>
            </motion.div>
            <div className="grid grid-cols-2 gap-6">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold">Data Diri Pemesan</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" placeholder="Mr" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" placeholder="Address" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" placeholder="Country" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex space-x-2">
                      <Select>
                        <SelectTrigger className="w-1/4">
                          <SelectValue placeholder="+62" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="+62">+62</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input id="phone" placeholder="No. WhatsApp" className="w-3/4" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Catatan Tambahan</Label>
                    <Input id="notes" placeholder="Catatan Tambahan" className="h-20" />
                  </div>
                </div>
              </motion.div>
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold">Detail Pesanan</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tanggal Keberangkatan</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Pilih Tanggal"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Durasi</Label>
                    <Select value={selectedDuration} onValueChange={handleDurationChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Durasi" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedPackage.itinerary?.map((duration) => (
                          <SelectItem key={duration.durationId} value={duration.durationLabel}>
                            {duration.durationLabel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedPackage.has_boat && (
                    <div className="space-y-2">
                      <Label>Boat</Label>
                      <Select value={selectedBoat} onValueChange={handleBoatChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Boat" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedPackage.boatImages?.map((boat) => (
                            <SelectItem key={boat.id} value={boat.id}>
                              {boat.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {selectedBoat && (
                    <div className="space-y-2">
                      <Label>Cabin</Label>
                      <Select value={selectedCabin} onValueChange={setSelectedCabin}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Cabin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard Cabin</SelectItem>
                          <SelectItem value="deluxe">Deluxe Cabin</SelectItem>
                          <SelectItem value="suite">Suite Cabin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Additional Charges</Label>
                    <Select 
                      value={additionalCharges.join(",")} 
                      onValueChange={(value) => setAdditionalCharges(value.split(","))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Additional Charges" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="snorkeling">Snorkeling Equipment</SelectItem>
                        <SelectItem value="camera">Underwater Camera</SelectItem>
                        <SelectItem value="insurance">Travel Insurance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="hotel" className="rounded" />
                    <Label htmlFor="hotel">Request Hotel</Label>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}
