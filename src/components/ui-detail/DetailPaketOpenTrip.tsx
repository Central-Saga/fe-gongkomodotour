// components/ui-detail/DetailPaketOpenTrip.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Function untuk format harga Indonesia
const formatPrice = (price: string): string => {
  // Hapus semua karakter non-digit kecuali titik
  const cleanPrice = price.replace(/[^\d.]/g, '');
  
  // Parse sebagai float
  const numPrice = parseFloat(cleanPrice);
  
  if (isNaN(numPrice)) {
    return price; // Return original jika tidak bisa di-parse
  }
  
  // Format dengan pemisah ribuan menggunakan titik
  return numPrice.toLocaleString('id-ID');
};

interface FlightSchedule {
  id: number;
  route: string;
  eta_time: string;
  eta_text: string;
  etd_time: string;
  etd_text: string;
}

interface PackageData {
  id: string;
  title: string;
  price: string;
  meetingPoint: string;
  destination: string;
  daysTrip: string;
  description: string;
  itinerary: {
    durationId: number;
    durationLabel: string;
    days: {
      day: string;
      activities: string; // Changed to string to handle HTML content
    }[];
  }[];
  information: string;
  boat: string;
  groupSize?: string;
  privateGuide?: string;
  images: string[];
  destinations?: number;
  include?: string[]; // Changed to handle HTML content
  exclude?: string[]; // Changed to handle HTML content
  session?: {
    highSeason: { period: string; price: string };
    peakSeason: { period: string; price: string };
  };
  flightInfo?: {
    guideFee1: string;
    guideFee2: string;
  };
  boatImages?: { image: string; title: string; id: string }[];
  mainImage?: string;
  flightSchedules?: FlightSchedule[];
  has_boat: boolean;
  destination_count: number;
  boat_ids?: number[];
  operational_days?: string[];
  tentation?: "Yes" | "No";
  note?: string; // Tambahkan field note dari API
}

const dayNameToIndex: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

interface DetailPaketOpenTripProps {
  data: PackageData;
}

const DetailPaketOpenTrip: React.FC<DetailPaketOpenTripProps> = ({ data }) => {
  const searchParams = useSearchParams();
  const mainImage =
    searchParams.get("mainImage") || data.mainImage || "/img/default-trip.jpg"; // Pastikan fallback default tetap ada
  const [activeTab, setActiveTab] = useState("itinerary");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedDurationId, setSelectedDurationId] = useState<number>(
    data.itinerary[0]?.durationId || 0
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const router = useRouter();

  // Debug: Log data gambar
  console.log("DetailPaketOpenTrip - Data:", data);
  console.log("DetailPaketOpenTrip - MainImage:", mainImage);
  console.log("DetailPaketOpenTrip - Images array:", data.images);

  // Function untuk handle image error
  const handleImageError = (imageSrc: string) => {
    console.error("Image failed to load:", imageSrc);
    setImageErrors(prev => new Set(prev).add(imageSrc));
  };

  // Function untuk get safe image source
  const getSafeImageSrc = (imageSrc: string, fallback: string = "/img/default-trip.jpg") => {
    if (imageErrors.has(imageSrc)) {
      return fallback;
    }
    return imageSrc;
  };

  // Disabled date berdasarkan hari operasional paket dan tanggal yang sudah lewat
  const allowedDaysSet = new Set(
    (data.operational_days || []).map((d) => dayNameToIndex[d])
  );
  
  // Function untuk disable tanggal yang sudah lewat
  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };
  
  const disabledByOperationalDays = (date: Date) => {
    // Disable tanggal yang sudah lewat
    if (isPastDate(date)) {
      return true;
    }
    
    // Disable berdasarkan hari operasional jika ada konfigurasi
    if (allowedDaysSet.size === 0) return false; // jika tidak ada konfigurasi, izinkan semua hari
    return !allowedDaysSet.has(date.getDay());
  };

  const handleBookNow = (packageId: string) => {
    if (selectedDate) {
      router.push(
        `/booking?type=open&packageId=${packageId}&date=${selectedDate.toISOString()}`
      );
    } else {
      alert("Please select a date before booking.");
    }
  };

  return (
    <div className="py-4 px-4">
      {/* Section 1: Gambar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Gambar Utama */}
          <Dialog
            open={!!selectedImage}
            onOpenChange={() => setSelectedImage(null)}
          >
            <DialogTrigger asChild>
              <div
                className="relative h-[400px] md:h-[458px] md:col-span-7 cursor-pointer overflow-hidden group"
                onClick={() => setSelectedImage(mainImage)}
              >
                <Image
                  src={getSafeImageSrc(mainImage)}
                  alt={data.title || "Default Image"}
                  fill
                  quality={100}
                  className="rounded-sm object-cover transition-transform duration-300 group-hover:scale-105"
                  unoptimized={true}
                  onError={() => handleImageError(mainImage)}
                  onLoad={() => console.log("Main image loaded successfully:", mainImage)}
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-5xl bg-black/95 border-none p-0">
              <DialogTitle className="sr-only">Gambar Detail</DialogTitle>
              <AnimatePresence>
                {selectedImage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    <Image
                      src={getSafeImageSrc(selectedImage)}
                      alt="Selected Image"
                      width={1200}
                      height={800}
                      quality={100}
                      className="rounded-lg"
                      unoptimized={true}
                      onError={() => selectedImage && handleImageError(selectedImage)}
                      onLoad={() => console.log("Selected image loaded successfully:", selectedImage)}
                    />
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-black/80 transition-colors duration-200"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </DialogContent>
          </Dialog>
          {/* Gambar Kecil */}
          <div className="grid grid-cols-2 gap-4 md:col-span-5">
            {data.images.slice(1, 4).map((image, index) => (
              <Dialog
                key={index}
                open={!!selectedImage}
                onOpenChange={() => setSelectedImage(null)}
              >
                <DialogTrigger asChild>
                  <div
                    className="relative h-[196px] md:h-[221px] w-full cursor-pointer overflow-hidden group"
                    onClick={() => setSelectedImage(image)}
                  >
                    <Image
                      src={getSafeImageSrc(image)}
                      alt={`${data.title} ${index + 1}`}
                      fill
                      quality={100}
                      className="rounded-sm object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized={true}
                      onError={() => handleImageError(image)}
                      onLoad={() => console.log(`Small image ${index + 1} loaded successfully:`, image)}
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-5xl bg-black/95 border-none p-0">
                  <DialogTitle className="sr-only">Gambar Detail</DialogTitle>
                  <AnimatePresence>
                    {selectedImage && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="relative"
                      >
                        <Image
                          src={getSafeImageSrc(selectedImage)}
                          alt="Selected Image"
                          width={1200}
                          height={800}
                          quality={100}
                          className="rounded-lg"
                        />
                        <button
                          onClick={() => setSelectedImage(null)}
                          className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-black/80 transition-colors duration-200"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </DialogContent>
              </Dialog>
            ))}

            {/* Gambar ke-4 dengan More Info */}
            <Dialog>
              <DialogTrigger asChild>
                <div className="relative h-[196px] md:h-[221px] w-full flex items-center justify-center rounded-sm cursor-pointer">
                  <Image
                    src={getSafeImageSrc(data.images[4] || "/img/default-trip.jpg")}
                    alt="More Info Background"
                    fill
                    quality={100}
                    className="rounded-sm object-cover"
                    unoptimized={true}
                    onError={() => data.images[4] && handleImageError(data.images[4])}
                    onLoad={() => console.log("Gallery image 4 loaded successfully:", data.images[4])}
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <p className="text-white font-semibold">More Info</p>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogTitle className="sr-only">Galeri Gambar</DialogTitle>
                <div className="grid grid-cols-2 gap-4">
                  {data.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative h-[150px] w-[150px] md:h-[200px] md:w-[200px]"
                    >
                                              <Image
                          src={getSafeImageSrc(image || "/img/default-trip.jpg")}
                        alt={`${data.title || "Default Image"} ${index + 4}`}
                        fill
                        quality={100}
                        className="rounded-sm object-cover"
                        unoptimized={true}
                        onError={() => handleImageError(image)}
                        onLoad={() => console.log(`Gallery image ${index + 4} loaded successfully:`, image)}
                      />
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </motion.div>

      {/* Section 2: Judul dan Rating */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-4 bg-[#f5f5f5] p-6 rounded-lg shadow-xl"
      >
        <div className="flex items-center mb-2">
          <Badge
            variant="secondary"
            className="bg-green-500 hover:bg-green-600 text-white border-none text-base px-6 py-2"
          >
            Open Trip
          </Badge>
        </div>
        <h1 className="text-4xl font-bold text-gray-800">{data.title}</h1>
        <p className="text-2xl text-gray-600 mt-2">
          Start from <strong>IDR {formatPrice(data.price)}</strong>
        </p>
      </motion.div>

      {/* Section 3: Destination Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white p-6 rounded-lg shadow-md mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {/* Meeting Point */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="flex items-center space-x-4"
            >
              <div className="p-2">
                <Image
                  src="/img/assembly-point.gif"
                  alt="Meeting Point Icon"
                  width={40}
                  height={40}
                  className="min-w-[40px]"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-gold font-semibold">Meeting Point</span>
                <span className="text-gray-600">{data.meetingPoint}</span>
              </div>
            </motion.div>

            {/* Destinations */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="flex items-center space-x-4"
            >
              <div className="p-2">
                <Image
                  src="/img/destination-map.gif"
                  alt="Destinations Icon"
                  width={40}
                  height={40}
                  className="min-w-[40px]"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-gold font-semibold">Destinations</span>
                <span className="text-gray-600">
                  {data.destinations} Places
                </span>
              </div>
            </motion.div>

            {/* Duration */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="flex items-center space-x-4"
            >
              <div className="p-2">
                <Image
                  src="/img/24-hour-service.gif"
                  alt="Duration Icon"
                  width={40}
                  height={40}
                  className="min-w-[40px]"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-gold font-semibold">Trip Duration</span>
                <span className="text-gray-600">{data.daysTrip}</span>
              </div>
            </motion.div>
          </div>

          <div className="flex items-center space-x-4 mt-6 md:mt-0 w-full md:w-auto justify-center">
            {data.tentation === "Yes" ? (
              <>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-gold hover:border-gold/80 text-gold px-6 py-2 rounded-lg"
                    >
                      {selectedDate ? format(selectedDate, "PPP") : "Select Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    {" "}
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={disabledByOperationalDays}
                      initialFocus
                      className="rounded-md border"
                      showOutsideDays={false}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
                {selectedDate && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      onClick={() => handleBookNow(data.id)}
                      className="bg-gold text-white px-8 py-2 rounded-lg font-semibold text-sm hover:bg-gold-dark-20 hover:scale-95 transition-all duration-300"
                    >
                      Book Now
                    </Button>
                  </motion.div>
                )}
              </>
            ) : (
              <Button
                onClick={() => window.open("https://wa.me/628123867588?text=Halo,%20saya%20tertarik%20dengan%20paket%20" + encodeURIComponent(data.title), "_blank")}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-2 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center gap-2"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Hubungi via WhatsApp
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Section 3.5: Additional Information */}
      {(data.operational_days && data.operational_days.length > 0) || (data.boat_ids && data.boat_ids.length > 0) ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white p-6 rounded-lg shadow-md mb-8"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Informasi Tambahan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.operational_days && data.operational_days.length > 0 && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex items-center space-x-4"
              >
                <div className="p-2">
                  <Image
                    src="/img/calendar-time.gif"
                    alt="Operational Days Icon"
                    width={40}
                    height={40}
                    className="min-w-[40px]"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-gold font-semibold">Hari Operasional</span>
                  <span className="text-gray-600">
                    {data.operational_days.map(day => {
                      const dayLabels: { [key: string]: string } = {
                        "Monday": "Senin",
                        "Tuesday": "Selasa", 
                        "Wednesday": "Rabu",
                        "Thursday": "Kamis",
                        "Friday": "Jumat",
                        "Saturday": "Sabtu",
                        "Sunday": "Minggu"
                      };
                      return dayLabels[day] || day;
                    }).join(", ")}
                  </span>
                </div>
              </motion.div>
            )}

            {data.boat_ids && data.boat_ids.length > 0 && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex items-center space-x-4"
              >
                <div className="p-2">
                  <Image
                    src="/img/cruise-ship.gif"
                    alt="Boat Icon"
                    width={40}
                    height={40}
                    className="min-w-[40px]"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-gold font-semibold">Kapal</span>
                  <span className="text-gray-600">
                    {data.boat_ids.length} kapal tersedia
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      ) : null}

      {/* Section 4: Navigation Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        <div className="flex space-x-4 mb-6">
          {/* Hapus tombol Description */}
          <Button
            variant={activeTab === "itinerary" ? "default" : "outline"}
            onClick={() => setActiveTab("itinerary")}
            className={`${
              activeTab === "itinerary"
                ? "bg-gold text-white hover:bg-gold-dark-20"
                : "bg-gold/5 text-gold hover:bg-gold hover:text-white"
            } px-7 py-6 rounded-lg font-semibold text-sm transition-all duration-300`}
          >
            Itinerary
          </Button>
          {(() => {
            const includeContent = data.include?.join("") || "";
            const hasInclude = includeContent.trim() !== "" && 
              includeContent.replace(/<[^>]*>/g, '').trim() !== "";
            
            const excludeContent = data.exclude?.join("") || "";
            const hasExclude = excludeContent.trim() !== "" && 
              excludeContent.replace(/<[^>]*>/g, '').trim() !== "";
            
            const hasFlight = (data.flightSchedules && data.flightSchedules.length > 0) || 
              (data.flightInfo && (data.flightInfo.guideFee1 || data.flightInfo.guideFee2));
            
            const hasNote = data.note && data.note.trim() !== "" && 
              data.note.replace(/<[^>]*>/g, '').trim() !== "";
            
            const hasDescription = data.description && 
              (Array.isArray(data.description) ? 
                data.description.some(item => item && item.trim() !== "") : 
                data.description.trim() !== "" && data.description.split(/\r?\n/).some(line => line.trim().startsWith("*"))
              );
            
            return hasInclude || hasExclude || hasFlight || hasNote || hasDescription;
          })() && (
            <Button
              variant={activeTab === "information" ? "default" : "outline"}
              onClick={() => setActiveTab("information")}
              className={`${
                activeTab === "information"
                  ? "bg-gold text-white hover:bg-gold-dark-20"
                  : "bg-gold/5 text-gold hover:bg-gold hover:text-white"
              } px-7 py-6 rounded-lg font-semibold text-sm transition-all duration-300`}
            >
              Information
            </Button>
          )}
          {data.has_boat && (
            <Button
              variant={activeTab === "boat" ? "default" : "outline"}
              onClick={() => setActiveTab("boat")}
              className={`${
                activeTab === "boat"
                  ? "bg-gold text-white hover:bg-gold-dark-20"
                  : "bg-gold/5 text-gold hover:bg-gold hover:text-white"
              } px-7 py-6 rounded-lg font-semibold text-sm transition-all duration-300`}
            >
              Boat
            </Button>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mt-6"
        >
          {/* Hapus seluruh blok activeTab === "description" */}
          {activeTab === "itinerary" && (
            <div className="space-y-6">
              <div className="flex flex-col items-start">
                <h1 className="text-3xl font-bold text-gray-800">Itinerary</h1>
                <div className="w-[120px] h-[3px] bg-gold mt-1 mb-6"></div>
              </div>

              <Tabs
                defaultValue={selectedDurationId.toString()}
                className="w-full"
                onValueChange={(value) =>
                  setSelectedDurationId(parseInt(value))
                }
              >
                <TabsList className="mb-6 bg-transparent flex flex-wrap gap-2 h-auto p-0">
                  {data.itinerary.map((duration) => (
                    <TabsTrigger
                      key={duration.durationId}
                      value={duration.durationId.toString()}
                      className="px-4 py-2 rounded-lg data-[state=active]:bg-gold data-[state=active]:text-white data-[state=active]:shadow-none bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      {duration.durationLabel}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {data.itinerary.map((duration) => (
                  <TabsContent
                    key={duration.durationId}
                    value={duration.durationId.toString()}
                    className="space-y-6 mt-2"
                  >
                    {duration.days.map((day, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="bg-white rounded-lg p-6 shadow-sm border border-gray-100"
                      >
                        <h3 className="text-lg font-semibold mb-4 text-gold">
                          {day.day}
                        </h3>
                        <div
                          className="text-gray-600 text-sm [&_ol]:list-decimal [&_ul]:list-disc [&_ol]:pl-5 [&_ul]:pl-5 [&_ol]:space-y-2 [&_ul]:space-y-2 [&_p]:my-0 [&_li]:pl-2 [&_li]:relative [&_li]:leading-normal"
                          dangerouslySetInnerHTML={{ __html: day.activities }}
                        />
                      </motion.div>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}
          {activeTab === "information" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Information
              </h1>
              <div className="w-[140px] h-[3px] bg-[#CFB53B] mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Kolom Kiri */}
                <div className="space-y-6">
                  {/* Include Section */}
                  {(() => {
                    const includeContent = data.include?.join("") || "";
                    const hasValidContent = includeContent.trim() !== "" && 
                      includeContent.replace(/<[^>]*>/g, '').trim() !== "";
                    return hasValidContent;
                  })() && (
                    <div className="bg-[#f5f5f5] p-6 rounded-lg shadow-sm min-h-[250px] flex flex-col">
                      <h2 className="text-xl font-bold text-gray-800 mb-4">
                        Include
                      </h2>
                      <div
                        className="text-gray-600 text-sm [&_ol]:list-decimal [&_ul]:list-disc [&_ol]:pl-5 [&_ul]:pl-5 [&_ol]:space-y-2 [&_ul]:space-y-2 [&_p]:my-0 [&_li]:pl-2 [&_li]:relative [&_li]:leading-normal"
                        dangerouslySetInnerHTML={{
                          __html: data.include?.join("") || "",
                        }}
                      />
                    </div>
                  )}

                  {/* Flight Information */}
                  {((data.flightSchedules && data.flightSchedules.length > 0) || 
                    (data.flightInfo && (data.flightInfo.guideFee1 || data.flightInfo.guideFee2))) && (
                    <div className="bg-[#f5f5f5] p-6 rounded-lg shadow-sm min-h-[250px] flex flex-col">
                      <h2 className="text-xl font-bold text-gray-800 mb-6">
                        Flight Information
                      </h2>
                      <div className="space-y-6">
                        {data.flightSchedules &&
                        data.flightSchedules.length > 0 ? (
                          <>
                            <div className="bg-gold/10 border-l-4 border-gold p-4 mb-4">
                              <p className="text-gold-dark text-sm font-medium">
                                <strong>Note:</strong> Flight schedules below are estimated departure and arrival times to Labuan Bajo. Actual flight times may vary depending on airline schedules and weather conditions.
                              </p>
                            </div>
                            {data.flightSchedules.map((schedule, index) => (
                              <div key={index}>
                                <h3 className="text-gold text-xl font-semibold mb-4">
                                  {schedule.route}
                                </h3>
                                <div className="grid grid-cols-2 gap-8">
                                  <div>
                                    <p className="text-gold font-medium mb-2">
                                      Estimated Departure from Labuan Bajo
                                    </p>
                                    <p className="text-gray-500">
                                      {schedule.etd_text === "-"
                                        ? `${schedule.etd_time.slice(0, -3)} WITA`
                                        : schedule.etd_text}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gold font-medium mb-2">
                                      Estimated Arrival to Labuan Bajo
                                    </p>
                                    <p className="text-gray-500">
                                      {schedule.eta_text === "-"
                                        ? `${schedule.eta_time.slice(0, -3)} WITA`
                                        : schedule.eta_text}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </>
                        ) : (
                          <div className="text-gray-600">
                            <p>{data.flightInfo?.guideFee1}</p>
                            <p className="mt-2">{data.flightInfo?.guideFee2}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Kolom Kanan */}
                <div className="space-y-6">
                  {/* Exclude Section */}
                  {(() => {
                    const excludeContent = data.exclude?.join("") || "";
                    const hasValidContent = excludeContent.trim() !== "" && 
                      excludeContent.replace(/<[^>]*>/g, '').trim() !== "";
                    return hasValidContent;
                  })() && (
                    <div className="bg-[#f5f5f5] p-6 rounded-lg shadow-sm min-h-[250px] flex flex-col">
                      <h2 className="text-xl font-bold text-gray-800 mb-4">
                        Exclude
                      </h2>
                      <div
                        className="text-gray-600 text-sm [&_ol]:list-decimal [&_ul]:list-disc [&_ol]:pl-5 [&_ul]:pl-5 [&_ol]:space-y-2 [&_ul]:space-y-2 [&_p]:my-0 [&_li]:pl-2 [&_li]:relative [&_li]:leading-normal"
                        dangerouslySetInnerHTML={{
                          __html: data.exclude?.join("") || "",
                        }}
                      />
                    </div>
                  )}

                  {/* Description Section (pindahan) */}
                  {(() => {
                    const hasNote = data.note && data.note.trim() !== "" && 
                      data.note.replace(/<[^>]*>/g, '').trim() !== "";
                    const hasDescription = data.description && 
                      (Array.isArray(data.description) ? 
                        data.description.some(item => item && item.trim() !== "") : 
                        data.description.trim() !== "" && data.description.split(/\r?\n/).some(line => line.trim().startsWith("*"))
                      );
                    return hasNote || hasDescription;
                  })() && (
                    <div className="bg-[#f5f5f5] p-6 rounded-lg shadow-sm min-h-[100px] flex flex-col">
                      <h2 className="text-xl font-bold text-gray-800 mb-4">
                        Description
                      </h2>
                      
                      {data.note ? (
                        // Jika ada note, tampilkan sebagai HTML content
                        <div
                          className="text-gray-600 text-sm [&_ol]:list-decimal [&_ul]:list-disc [&_ol]:pl-5 [&_ul]:pl-5 [&_ol]:space-y-2 [&_ul]:space-y-2 [&_p]:my-0 [&_li]:pl-2 [&_li]:relative [&_li]:leading-normal"
                          dangerouslySetInnerHTML={{
                            __html: data.note,
                          }}
                        />
                      ) : Array.isArray(data.description) ? (
                        // Jika description adalah array
                        <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                          {data.description.map((item, idx) => <li key={idx}>{item.replace(/^\*\s?/, "")}</li>)}
                        </ul>
                      ) : (
                        // Jika description adalah string
                        <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                          {data.description.split(/\r?\n/).filter(line => line.trim().startsWith("*")).map((line, idx) => (
                            <li key={idx}>{line.replace(/^\*\s?/, "")}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === "boat" && data.has_boat && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Boat</h1>
              <div className="w-[80px] h-[3px] bg-[#CFB53B] mb-6"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-8xl mx-auto items-center mb-6">
                {data.boatImages?.map((boat, index) => (
                  <Link key={index} href={`/detail-boat?id=${boat.id}`}>
                    <div className="relative group overflow-hidden rounded-lg shadow-lg cursor-pointer">
                      {/* Gambar Boat */}
                      <div className="relative h-[300px] w-full">
                        <Image
                          src={getSafeImageSrc(boat.image)}
                          alt={boat.title}
                          fill
                          className="rounded-lg transition-transform duration-300 group-hover:scale-110 object-cover"
                          unoptimized={true}
                          onError={() => handleImageError(boat.image)}
                          onLoad={() => console.log("Boat image loaded successfully:", boat.image)}
                        />
                      </div>
                      {/* Overlay dengan Judul */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <p className="text-white font-semibold text-lg">
                          {boat.title}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DetailPaketOpenTrip;
