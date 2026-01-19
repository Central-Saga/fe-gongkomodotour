"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { FlightSchedule } from "@/types/trips";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const dayNameToIndex: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

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

// Definisikan tipe untuk data paket
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
    days: { day: string; activities: string }[];
  }[];
  information: string;
  boat: string;
  groupSize?: string;
  privateGuide?: string;
  images: string[];
  destinations?: number;
  include?: string[];
  exclude?: string[];
  session?: {
    highSeason: { period: string; price: string };
    peakSeason: { period: string; price: string };
  };
  flightInfo?: {
    guideFee1: string;
    guideFee2: string;
  };
  flightSchedules?: FlightSchedule[];
  additional_fees?: { id: number; fee_category: string; price: number; unit: string; pax_min: number; pax_max: number }[];
  boatImages?: { image: string; title: string; id: string }[];
  mainImage?: string;
  has_boat: boolean;
  destination_count: number;
  trip_durations: {
    id: number;
    duration_label: string;
    itineraries: { day: string; activities: string }[];
  }[];
  boat_ids?: number[];
  operational_days?: string[];
  tentation?: "Yes" | "No";
  note?: string; // Tambahkan field note
}

interface DetailPaketPrivateTripProps {
  data: PackageData;
}

const DetailPaketPrivateTrip: React.FC<DetailPaketPrivateTripProps> = ({
  data,
}) => {
  const searchParams = useSearchParams();
  const mainImage =
    searchParams.get("mainImage") || data.mainImage || "/img/default-image.png"; // Ambil mainImage dari query string

  const [activeTab, setActiveTab] = useState("itinerary");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();
  const [selectedDurationId, setSelectedDurationId] = useState<number>(
    data.trip_durations?.[0]?.id || 0
  );

  // Safe image handling like OpenTrip
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const handleImageError = (imageSrc: string) => {
    if (!imageSrc) return;
    setImageErrors((prev) => new Set(prev).add(imageSrc));
  };
  const getSafeImageSrc = (imageSrc: string | undefined | null, fallback: string = "/img/default-trip.jpg") => {
    if (!imageSrc || imageErrors.has(imageSrc)) {
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

  // Function untuk cek apakah tanggal adalah hari ini
  const isToday = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() === today.getTime();
  };

  const disabledByOperationalDays = (date: Date) => {
    // Disable hari ini
    if (isToday(date)) {
      return true;
    }

    // Disable tanggal yang sudah lewat
    if (isPastDate(date)) {
      return true;
    }

    // Jika ada konfigurasi hari operasional (custom jadwal), ikuti hari operasional tersebut
    // Baik jadwal fleksibel (Yes) maupun tidak fleksibel (No), jika ada operational_days harus diikuti
    if (allowedDaysSet.size > 0) {
      // Return true jika hari tidak ada dalam daftar hari operasional (disable)
      // Return false jika hari ada dalam daftar hari operasional (enable)
      return !allowedDaysSet.has(date.getDay());
    }

    // Jika tidak ada konfigurasi hari operasional, izinkan semua hari (kecuali hari ini dan yang sudah lewat)
    return false;
  };

  const handleBookNow = (packageId: string) => {
    if (selectedDate) {
      router.push(
        `/booking?type=private&packageId=${packageId}&date=${selectedDate.toISOString()}`
      );
    } else {
      alert("Please select a date before booking.");
    }
  };

  return (
    <div className="py-4 px-4">
      {/* Section 1: Gambar */}
      <div className="relative mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Gambar Utama */}
          <Dialog
            open={!!selectedImage}
            onOpenChange={() => setSelectedImage(null)}
          >
            <DialogTrigger asChild>
              <div
                className="relative h-[400px] md:h-[458px] md:col-span-7 cursor-pointer"
                onClick={() => setSelectedImage(mainImage)}
              >
                <Image
                  src={getSafeImageSrc(mainImage)}
                  alt={data.title || "Default Image"}
                  fill
                  className="rounded-sm object-cover"
                  quality={85}
                  sizes="(max-width: 768px) 100vw, 70vw"
                  priority
                  onError={() => handleImageError(mainImage)}
                />
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              {selectedImage && (
                <Image
                  src={selectedImage}
                  alt="Selected Image"
                  width={800}
                  height={600}
                  className="rounded-lg"
                  quality={85}
                  sizes="(max-width: 768px) 100vw, 70vw"
                  priority
                />
              )}
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
                    className="relative h-[196px] md:h-[221px] w-full cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  >
                    <Image
                      src={getSafeImageSrc(image || "/img/default-trip.jpg")}
                      alt={`${data.title} ${index + 1}`}
                      fill
                      className="rounded-sm object-cover"
                      quality={85}
                      sizes="(max-width: 768px) 100vw, 70vw"
                      priority
                      onError={() => handleImageError(image)}
                    />
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  {selectedImage && (
                    <Image
                      src={selectedImage}
                      alt="Selected Image"
                      width={800}
                      height={600}
                      className="rounded-lg"
                      quality={85}
                      sizes="(max-width: 768px) 100vw, 70vw"
                      priority
                    />
                  )}
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
                    className="rounded-sm object-cover"
                    quality={85}
                    sizes="(max-width: 768px) 100vw, 70vw"
                    priority
                    onError={() => data.images[4] && handleImageError(data.images[4])}
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <p className="text-white font-semibold">More Info</p>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  {data.images.slice(4).map((image, index) => (
                    <div
                      key={index}
                      className="relative h-[150px] w-[150px] md:h-[200px] md:w-[200px]"
                    >
                      <Image
                        src={getSafeImageSrc(image || "/img/default-trip.jpg")}
                        alt={`${data.title} ${index + 4}`}
                        fill
                        className="rounded-sm object-cover"
                        quality={85}
                        sizes="(max-width: 768px) 100vw, 70vw"
                        priority
                        onError={() => handleImageError(image)}
                      />
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Section 2: Judul dan Rating */}
      <div className="mb-4 bg-[#f5f5f5] p-6 rounded-lg shadow-xl">
        <div className="flex items-center mb-2">
          <span className="bg-[#E16238] text-white px-3 py-1 rounded-xs text-sm font-semibold w-fit">
            Private Trip
          </span>
          <span className="text-[#CFB53B] text-xl ml-8"> ★ 5 (100 ulasan)</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mt-2">{data.title}</h1>
        <p className="text-2xl text-gray-600 mt-2">
          Start from <strong>IDR {formatPrice(data.price)}</strong>
        </p>
      </div>

      {/* Section 3: Destination Info */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {/* Meeting Point */}
            <div className="flex items-center space-x-4">
              <div className="p-2">
                <Image
                  src="/img/assembly-point.gif"
                  unoptimized
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
            </div>

            {/* Destinations */}
            <div className="flex items-center space-x-4">
              <div className="p-2">
                <Image
                  src="/img/destination-map.gif"
                  unoptimized
                  alt="Destinations Icon"
                  width={40}
                  height={40}
                  className="min-w-[40px]"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-gold font-semibold">Destinations</span>
                <span className="text-gray-600">{data.destinations} Destinations</span>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-center space-x-4">
              <div className="p-2">
                <Image
                  src="/img/24-hour-service.gif"
                  unoptimized
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
            </div>
          </div>

          <div className="flex items-center space-x-4 mt-6 md:mt-0 w-full md:w-auto justify-center">
            {data.tentation === "Yes" ? (
              // Jika jadwal fleksibel (Yes), tampilkan button WhatsApp
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
            ) : (
              // Jika jadwal tidak fleksibel (No), tampilkan calendar dan jadwal operasional
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3">
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
                    <Button
                      onClick={() => handleBookNow(data.id)}
                      className="bg-gold text-white px-8 py-2 rounded-lg font-semibold text-sm hover:bg-gold-dark-20 hover:scale-95 transition-all duration-300"
                    >
                      Book Now
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 3.5: Additional Information */}
      {(data.operational_days && data.operational_days.length > 0) || (data.boat_ids && data.boat_ids.length > 0) ? (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Informasi Tambahan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.operational_days && data.operational_days.length > 0 && (
              <div className="flex items-center space-x-4">
                <div className="p-2">
                  <Image
                    src="/img/calendar-time.gif"
                    unoptimized
                    alt="Operational Days Icon"
                    width={40}
                    height={40}
                    className="min-w-[40px]"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-gold font-semibold">Hari Operasional</span>
                  <span className="text-gray-600">
                    {data.operational_days
                      .map((day) => {
                        const dayLabels: { [key: string]: string } = {
                          Monday: "Senin",
                          Tuesday: "Selasa",
                          Wednesday: "Rabu",
                          Thursday: "Kamis",
                          Friday: "Jumat",
                          Saturday: "Sabtu",
                          Sunday: "Minggu",
                        };
                        return dayLabels[day] || day;
                      })
                      .join(", ")}
                  </span>
                </div>
              </div>
            )}

            {data.boat_ids && data.boat_ids.length > 0 && (
              <div className="flex items-center space-x-4">
                <div className="p-2">
                  <Image
                    src="/img/cruise-ship.gif"
                    unoptimized
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
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Section 4: Tabs Navigation */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex space-x-4 mb-6">
          <Button
            variant={activeTab === "itinerary" ? "default" : "outline"}
            onClick={() => setActiveTab("itinerary")}
            className={`${activeTab === "itinerary"
              ? "bg-gold text-white hover:bg-gold-dark-20"
              : "bg-gold/5 text-gold hover:bg-gold hover:text-white"
              } px-7 py-6 rounded-lg font-semibold text-sm transition-all duration-300`}
          >
            Itinerary
          </Button>
          {(() => {
            const includeContent = (data.include || []).join("") || "";
            const hasInclude = includeContent.trim() !== "" &&
              includeContent.replace(/<[^>]*>/g, '').trim() !== "";

            const excludeContent = (data.exclude || []).join("") || "";
            const hasExclude = excludeContent.trim() !== "" &&
              excludeContent.replace(/<[^>]*>/g, '').trim() !== "";

            const hasFlight = (data.flightSchedules && data.flightSchedules.length > 0) ||
              (data.flightInfo && (data.flightInfo.guideFee1 || data.flightInfo.guideFee2));
            const hasAdditionalFees = data.additional_fees && data.additional_fees.length > 0;

            const hasNote = data.note && data.note.trim() !== "" &&
              data.note.replace(/<[^>]*>/g, '').trim() !== "";

            const hasDescription = data.description &&
              (Array.isArray(data.description) ?
                data.description.some(item => item && item.trim() !== "") :
                data.description.trim() !== "" && data.description.split(/\r?\n/).some(line => line.trim().startsWith("*"))
              );

            return hasInclude || hasExclude || hasFlight || hasAdditionalFees || hasNote || hasDescription;
          })() && (
              <Button
                variant={activeTab === "information" ? "default" : "outline"}
                onClick={() => setActiveTab("information")}
                className={`${activeTab === "information"
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
              className={`${activeTab === "boat"
                ? "bg-gold text-white hover:bg-gold-dark-20"
                : "bg-gold/5 text-gold hover:bg-gold hover:text-white"
                } px-7 py-6 rounded-lg font-semibold text-sm transition-all duration-300`}
            >
              Boat
            </Button>
          )}
        </div>

        <div>
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
                  {data.trip_durations.map((duration) => (
                    <TabsTrigger
                      key={duration.id}
                      value={duration.id.toString()}
                      className="px-4 py-2 rounded-lg data-[state=active]:bg-gold data-[state=active]:text-white data-[state=active]:shadow-none bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      {duration.duration_label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {data.trip_durations.map((duration) => (
                  <TabsContent
                    key={duration.id}
                    value={duration.id.toString()}
                    className="space-y-6 mt-2"
                  >
                    {duration.itineraries.map((day, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg p-6 shadow-sm border border-gray-100"
                      >
                        <h3 className="text-lg font-semibold mb-4 text-gold">
                          {day.day}
                        </h3>
                        <div
                          className="text-gray-600 text-sm [&_ol]:list-decimal [&_ul]:list-disc [&_ol]:pl-5 [&_ul]:pl-5 [&_ol]:space-y-2 [&_ul]:space-y-2 [&_p]:my-0 [&_li]:pl-2 [&_li]:relative [&_li]:leading-normal"
                          dangerouslySetInnerHTML={{ __html: day.activities }}
                        />
                      </div>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}
          {activeTab === "information" && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Information
              </h1>
              <div className="w-[140px] h-[3px] bg-[#CFB53B] mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Kolom Kiri */}
                <div className="space-y-6">
                  {/* Include Section */}
                  {(() => {
                    const includeContent = (data.include || []).join("") || "";
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
                            __html: (data.include || []).join("") || "",
                          }}
                        />
                      </div>
                    )}

                  {/* Flight Information - struktur sama seperti DetailPaketOpenTrip */}
                  {((data.flightSchedules && data.flightSchedules.length > 0) ||
                    (data.flightInfo && (data.flightInfo.guideFee1 || data.flightInfo.guideFee2))) && (
                      <div className="bg-[#f5f5f5] p-6 rounded-lg shadow-sm min-h-[250px] flex flex-col">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">
                          Flight Information
                        </h2>
                        <div className="space-y-6">
                          {data.flightSchedules && data.flightSchedules.length > 0 ? (
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
                            <div className="text-gray-600 space-y-2">
                              {data.flightInfo?.guideFee1 && (
                                <p>Guide Fee (Per Day): IDR {formatPrice(data.flightInfo.guideFee1)}</p>
                              )}
                              {data.flightInfo?.guideFee2 && (
                                <p>Guide Fee (Per 5 pax): IDR {formatPrice(data.flightInfo.guideFee2)}</p>
                              )}
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
                    const excludeContent = (data.exclude || []).join("") || "";
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
                            __html: (data.exclude || []).join("") || "",
                          }}
                        />
                      </div>
                    )}

                  {/* Additional Fees - grid rapi di kolom kanan */}
                  {data.additional_fees && data.additional_fees.length > 0 && (
                    <div className="bg-[#f5f5f5] p-5 rounded-lg shadow-sm">
                      <h2 className="text-xl font-bold text-gray-800 mb-3">
                        Additional Fees
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {data.additional_fees.map((fee) => {
                          const unitLabel = fee.unit === "per_pax" ? "/pax" : fee.unit === "per_5pax" ? "/5 pax" : fee.unit === "per_day" ? "/hari" : fee.unit === "per_day_guide" ? "/hari (pemandu)" : "";
                          return (
                            <div
                              key={fee.id}
                              className="flex flex-col p-3 rounded-lg bg-white border border-gray-200/80"
                            >
                              <span className="text-gray-700 text-sm leading-tight">{fee.fee_category} {unitLabel}</span>
                              <span className="font-semibold text-gold text-sm mt-1">IDR {formatPrice(String(fee.price))}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Description Section */}
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
                          <div
                            className="text-gray-600 text-sm [&_ol]:list-decimal [&_ul]:list-disc [&_ol]:pl-5 [&_ul]:pl-5 [&_ol]:space-y-2 [&_ul]:space-y-2 [&_p]:my-0 [&_li]:pl-2 [&_li]:relative [&_li]:leading-normal"
                            dangerouslySetInnerHTML={{
                              __html: data.note,
                            }}
                          />
                        ) : Array.isArray(data.description) ? (
                          <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                            {data.description.map((item, idx) => (
                              <li key={idx}>{item.replace(/^\*\s?/, "")}</li>
                            ))}
                          </ul>
                        ) : (
                          <ul className="list-disc pl-5 text-gray-600 text-sm space-y-1">
                            {data.description
                              .split(/\r?\n/)
                              .filter((line) => line.trim().startsWith("*"))
                              .map((line, idx) => (
                                <li key={idx}>{line.replace(/^\*\s?/, "")}</li>
                              ))}
                          </ul>
                        )}
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}
          {activeTab === "boat" && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Boat</h1>
              <div className="w-[80px] h-[3px] bg-[#CFB53B] mb-6"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-8xl mx-auto items-center mb-6">
                {" "}
                {data.boatImages?.map((boat, index) => (
                  <Link key={index} href={`/detail-boat?id=${boat.id}`}>
                    <div className="relative group overflow-hidden rounded-lg shadow-lg cursor-pointer">
                      {/* Gambar Boat */}
                      <div className="relative h-[330px] w-full">
                        <Image
                          src={getSafeImageSrc(boat.image)}
                          alt={boat.title}
                          fill
                          className="rounded-lg transition-transform duration-300 group-hover:scale-110 object-cover"
                          quality={85}
                          sizes="(max-width: 768px) 100vw, 70vw"
                          priority
                          onError={() => handleImageError(boat.image)}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailPaketPrivateTrip;
