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
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      activities: string;  // Changed to string to handle HTML content
    }[];
  }[];
  information: string;
  boat: string;
  groupSize?: string;
  privateGuide?: string;
  images: string[];
  destinations?: number;
  include?: string[];  // Changed to handle HTML content
  exclude?: string[];  // Changed to handle HTML content
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
}

interface DetailPaketOpenTripProps {
  data: PackageData;
}

const DetailPaketOpenTrip: React.FC<DetailPaketOpenTripProps> = ({ data }) => {
  const searchParams = useSearchParams();
  const mainImage =
    searchParams.get("mainImage") || data.mainImage || "/img/default-image.png"; // Pastikan fallback default tetap ada
  const [activeTab, setActiveTab] = useState("description");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedDurationId, setSelectedDurationId] = useState<number>(data.itinerary[0]?.durationId || 0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();

  // Tambahkan log untuk memeriksa nilai mainImage dan data.images
  console.log("Query Main Image:", searchParams.get("mainImage"));
  console.log("Data Main Image:", data.mainImage);
  console.log("Final Main Image Path:", mainImage);
  console.log("Data Images Array:", data.images);

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
                  src={mainImage}
                  alt={data.title || "Default Image"}
                  fill
                  quality={100}
                  className="rounded-sm object-cover transition-transform duration-300 group-hover:scale-105"
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
                      src={selectedImage}
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
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                      src={image}
                      alt={`${data.title} ${index + 1}`}
                      fill
                      quality={100}
                      className="rounded-sm object-cover transition-transform duration-300 group-hover:scale-105"
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
                          src={selectedImage}
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
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                    src={data.images[4] || "/img/default-image.png"}
                    alt="More Info Background"
                    fill
                    quality={100}
                    className="rounded-sm object-cover"
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
                        src={image || "/img/default-image.png"}
                        alt={`${data.title || "Default Image"} ${index + 4}`}
                        fill
                        quality={100}
                        className="rounded-sm object-cover"
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
          <Badge variant="secondary" className="bg-green-500 hover:bg-green-600 text-white border-none text-base px-6 py-2">
            Open Trip
          </Badge>
        </div>
        <h1 className="text-4xl font-bold text-gray-800">{data.title}</h1>
        <p className="text-2xl text-gray-600 mt-2">
          Start from <strong>{data.price}</strong>
        </p>
      </motion.div>

      {/* Section 3: Destination Info */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-gold/5 p-6 rounded-lg shadow-md mb-8"
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
                  src="/img/Meeting.png"
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
                  src="/img/icon-destination.png"
                  alt="Destinations Icon"
                  width={40}
                  height={40}
                  className="min-w-[40px]"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-gold font-semibold">Destinations</span>
                <span className="text-gray-600">{data.destinations} Places</span>
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
                  src="/img/icon/durasi.png"
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="border-gold hover:border-gold/80 text-gold px-6 py-2 rounded-lg"
                >
                  {selectedDate ? format(selectedDate, "PPP") : "Select Date"}
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
          </div>
        </div>
      </motion.div>

      {/* Section 4: Navigation Tabs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        <div className="flex space-x-4 mb-6">
          <Button
            variant={activeTab === "description" ? "default" : "outline"}
            onClick={() => setActiveTab("description")}
            className={`${
              activeTab === "description"
                ? "bg-gold text-white hover:bg-gold-dark-20"
                : "bg-gold/5 text-gold hover:bg-gold hover:text-white"
            } px-7 py-6 rounded-lg font-semibold text-sm transition-all duration-300`}
          >
            Description
          </Button>
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
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mt-6"
        >
          {activeTab === "description" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Description</h1>
              <div className="w-[150px] h-[3px] bg-gold mb-6"></div>
              <p className="text-gray-600">{data.description}</p>
            </motion.div>
          )}
          {activeTab === "itinerary" && (
            <div className="space-y-6">
              <div className="flex flex-col items-start">
                <h1 className="text-3xl font-bold text-gray-800">Itinerary</h1>
                <div className="w-[120px] h-[3px] bg-gold mt-1 mb-6"></div>
              </div>

              <Tabs
                defaultValue={selectedDurationId.toString()}
                className="w-full"
                onValueChange={(value) => setSelectedDurationId(parseInt(value))}
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
                        <h3 className="text-lg font-semibold mb-4 text-gold">{day.day}</h3>
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
                  <div className="bg-[#f5f5f5] p-6 rounded-lg shadow-sm min-h-[250px] flex flex-col">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                      Include
                    </h2>
                    <div 
                      className="text-gray-600 text-sm [&_ol]:list-decimal [&_ul]:list-disc [&_ol]:pl-5 [&_ul]:pl-5 [&_ol]:space-y-2 [&_ul]:space-y-2 [&_p]:my-0 [&_li]:pl-2 [&_li]:relative [&_li]:leading-normal"
                      dangerouslySetInnerHTML={{ __html: data.include?.join('') || '' }}
                    />
                  </div>

                  {/* Flight Information */}
                  <div className="bg-[#f5f5f5] p-6 rounded-lg shadow-sm min-h-[250px] flex flex-col">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">
                      Flight Information
                    </h2>
                    <div className="space-y-6">
                      {data.flightSchedules && data.flightSchedules.length > 0 ? (
                        data.flightSchedules.map((schedule, index) => (
                          <div key={index}>
                            <h3 className="text-gold text-xl font-semibold mb-4">
                              {schedule.route}
                            </h3>
                            <div className="grid grid-cols-2 gap-8">
                              <div>
                                <p className="text-gray-600 font-medium mb-2">Departure</p>
                                <p className="text-gray-500">
                                  {schedule.etd_text === "-" 
                                    ? `${schedule.etd_time.slice(0, -3)} WITA` 
                                    : schedule.etd_text}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600 font-medium mb-2">Arrival</p>
                                <p className="text-gray-500">
                                  {schedule.eta_text === "-" 
                                    ? `${schedule.eta_time.slice(0, -3)} WITA` 
                                    : schedule.eta_text}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-600">
                          <p>{data.flightInfo?.guideFee1}</p>
                          <p className="mt-2">{data.flightInfo?.guideFee2}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan */}
                <div className="space-y-6">
                  {/* Exclude Section */}
                  <div className="bg-[#f5f5f5] p-6 rounded-lg shadow-sm min-h-[250px] flex flex-col">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                      Exclude
                    </h2>
                    <div 
                      className="text-gray-600 text-sm [&_ol]:list-decimal [&_ul]:list-disc [&_ol]:pl-5 [&_ul]:pl-5 [&_ol]:space-y-2 [&_ul]:space-y-2 [&_p]:my-0 [&_li]:pl-2 [&_li]:relative [&_li]:leading-normal"
                      dangerouslySetInnerHTML={{ __html: data.exclude?.join('') || '' }}
                    />
                  </div>

                  {/* Season Section */}
                  <div className="bg-[#f5f5f5] p-6 rounded-lg shadow-sm min-h-[250px] flex flex-col">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                      Season
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-700">
                          High Season Period:
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {data.session?.highSeason.period}
                        </p>
                        <p className="text-gold font-bold mt-1 text-sm">
                          {data.session?.highSeason.price}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700">
                          Peak Season Period:
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {data.session?.peakSeason.period}
                        </p>
                        <p className="text-gold font-bold mt-1 text-sm">
                          {data.session?.peakSeason.price}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === "boat" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Boat</h1>
              <div className="w-[80px] h-[3px] bg-[#CFB53B] mb-6"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-8xl mx-auto items-center mb-6">
                {data.boatImages?.map((boat, index) => (
                  <Link
                    key={index}
                    href={`/detail-boat?id=${boat.id}`}
                  >
                    <div className="relative group overflow-hidden rounded-lg shadow-lg cursor-pointer">
                      {/* Gambar Boat */}
                      <div className="relative h-[300px] w-full">
                        <Image
                          src={boat.image}
                          alt={boat.title}
                          layout="fill"
                          objectFit="cover"
                          className="rounded-lg transition-transform duration-300 group-hover:scale-110"
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
