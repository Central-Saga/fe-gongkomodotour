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
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";

interface PackageData {
  id: string;
  title: string;
  price: string;
  meetingPoint: string;
  destination: string;
  daysTrip: string;
  description: string;
  itinerary: { day: string; activities: string[] }[];
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
  boatImages?: { image: string; title: string }[]; // Tambahkan properti ini
  mainImage?: string; // Tambahkan properti mainImage
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
  const [selectedDay, setSelectedDay] = useState(0); // Tambahkan state untuk hari yang dipilih
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
      <div className="relative mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Gambar Utama */}
          <div className="relative h-[400px] md:h-[458px] md:col-span-7">
            <Image
              src={mainImage} // Gunakan mainImage
              alt={data.title || "Default Image"}
              fill
              className="rounded-sm object-cover"
            />
          </div>

          {/* Gambar Kecil */}
          <div className="grid grid-cols-2 gap-4 md:col-span-5">
            {data.images.slice(1, 4).map((image, index) => {
              console.log(`Small Image ${index + 1} Path:`, image); // Log untuk gambar kecil
              return (
                <div
                  key={index}
                  className="relative h-[196px] md:h-[221px] w-full"
                >
                  <Image
                    src={image || "/img/default-image.png"} // Tambahkan fallback default
                    alt={`${data.title || "Default Image"} ${index + 1}`}
                    fill
                    className="rounded-sm object-cover"
                  />
                </div>
              );
            })}

            {/* Gambar ke-4 dengan More Info */}
            <Dialog>
              <DialogTrigger asChild>
                <div className="relative h-[196px] md:h-[221px] w-full flex items-center justify-center rounded-sm cursor-pointer">
                  <Image
                    src={data.images[4] || "/img/default-image.png"} // Tambahkan fallback default
                    alt="More Info Background"
                    fill
                    className="rounded-sm object-cover"
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
                        src={image || "/img/default-image.png"} // Tambahkan fallback default
                        alt={`${data.title || "Default Image"} ${index + 4}`}
                        fill
                        className="rounded-sm object-cover"
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
          <span className="bg-green-500 text-white px-3 py-2 rounded-sm text-sm mr-2">
            Open Trip
          </span>
          <span className="text-orange-500 text-xl ml-5">★ 5 (100 ulasan)</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-800">{data.title}</h1>
        <p className="text-2xl text-gray-600 mt-2">
          Start from <strong>{data.price}</strong>
        </p>
      </div>

      {/* Section 3: Destinasi */}
      <div className="bg-[#f5f5f5] p-6 rounded-lg shadow-md mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-80 mb-4 md:mb-0 max-w-6xl">
            <div className="flex items-start">
              <Image
                src="/img/Meeting.png"
                alt="Meeting Point Icon"
                width={50}
                height={50}
                className="mr-2"
              />
              <div className="flex flex-col">
                <span className="text-gray-600 font-semibold">
                  Meeting Point
                </span>
                <span className="text-gray-600">{data.meetingPoint}</span>
              </div>
            </div>
            <div className="flex items-start">
              <Image
                src="/img/icon-destination.png"
                alt="Destinations Icon"
                width={50}
                height={50}
                className="mr-2"
              />
              <div className="flex flex-col">
                <span className="text-gray-600 font-semibold">Destinasi</span>
                <span className="text-gray-600">
                  {data.destinations} Destinasi
                </span>
              </div>
            </div>
            <div className="flex items-start">
              <Image
                src="/img/icon/durasi.png"
                alt="Days Trip Icon"
                width={50}
                height={50}
                className="mr-2"
              />
              <div className="flex flex-col">
                <span className="text-gray-600 font-semibold">Durasi Trip</span>
                <span className="text-gray-600">{data.daysTrip}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-800 px-4 py-2 rounded-lg"
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
            {/* // components/ui-detail/DetailPaketOpenTrip.tsx */}
            {selectedDate && (
              <Button
                onClick={() => handleBookNow(data.id)}
                className="bg-[#CFB53B] text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-[#7F6D1F] hover:scale-95 transition-all duration-300"
              >
                Book Now
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Section 4: Tab Navigasi dan Konten */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex space-x-4 mb-6">
          <Button
            variant={activeTab === "description" ? "default" : "outline"}
            onClick={() => setActiveTab("description")}
            className={`${
              activeTab === "description"
                ? "bg-[#CFB53B] text-white"
                : "bg-gray-200 text-gray-800"
            } px-7 py-6 rounded-lg font-semibold text-sm hover:bg-[#7F6D1F] hover:text-white transition-all duration-300`}
          >
            Description
          </Button>
          <Button
            variant={activeTab === "itinerary" ? "default" : "outline"}
            onClick={() => setActiveTab("itinerary")}
            className={`${
              activeTab === "itinerary"
                ? "bg-[#CFB53B] text-white"
                : "bg-gray-200 text-gray-800"
            } px-7 py-6 rounded-lg font-semibold text-sm hover:bg-[#7F6D1F] hover:text-white transition-all duration-300`}
          >
            Itinerary
          </Button>
          <Button
            variant={activeTab === "information" ? "default" : "outline"}
            onClick={() => setActiveTab("information")}
            className={`${
              activeTab === "information"
                ? "bg-[#CFB53B] text-white"
                : "bg-gray-200 text-gray-800"
            } px-7 py-6  rounded-lg font-semibold text-sm hover:bg-[#7F6D1F] hover:text-white transition-all duration-300`}
          >
            Information
          </Button>
          <Button
            variant={activeTab === "boat" ? "default" : "outline"}
            onClick={() => setActiveTab("boat")}
            className={`${
              activeTab === "boat"
                ? "bg-[#CFB53B] text-white"
                : "bg-gray-200 text-gray-800"
            } px-7 py-6  rounded-lg font-semibold text-sm hover:bg-[#7F6D1F] hover:text-white transition-all duration-300`}
          >
            Boat
          </Button>
        </div>

        <div>
          {activeTab === "description" && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Description
              </h1>
              <div className="w-[150px] h-[3px] bg-[#CFB53B] mb-6"></div>
              <p className="text-gray-600">{data.description}</p>
            </div>
          )}
          {activeTab === "itinerary" && (
            <div>
              {/* Header Itinerary dengan Tombol Days */}
              <div className="mb-6">
                {/* Judul Itinerary */}
                <div className="flex flex-col items-start">
                  <h1 className="text-3xl font-bold text-gray-800">
                    Itinerary
                  </h1>
                  {/* Garis di bawah judul */}
                  <div className="w-[120px] h-[3px] bg-[#CFB53B] mt-1"></div>
                </div>

                {/* Tombol Days */}
                <div className="flex justify-center space-x-4 mt-4">
                  {data.itinerary.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedDay(index)}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                        selectedDay === index
                          ? "bg-[#f4f4f4] text-black border-t-4 border-[#CFB53B]"
                          : "bg-gray-200 text-gray-800"
                      } hover:bg-[#7F6D1F] hover:text-white transition-all duration-300`}
                    >
                      {item.day}
                    </button>
                  ))}
                </div>
              </div>
              {/* Garis di bawah judul
            <div className="w-[120px] h-[3px] bg-[#CFB53B] mb-6"></div> */}

              {/* Display Activities for Selected Day */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  {data.itinerary[selectedDay]?.day}
                </h2>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  {data.itinerary[selectedDay]?.activities.map(
                    (activity, index) => (
                      <li key={index}>{activity}</li>
                    )
                  )}
                </ul>
              </div>
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
                  <div className="bg-[#f5f5f5] p-6 rounded-lg shadow-sm min-h-[250px] flex flex-col">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                      Include
                    </h2>
                    <ul className="list-disc list-inside space-y-2">
                      {data.include?.map((item, index) => (
                        <li key={index} className="text-gray-600 text-sm">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Session Section */}
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
                        <p className="text-[#CFB53B] font-bold mt-1 text-sm">
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
                        <p className="text-[#CFB53B] font-bold mt-1 text-sm">
                          {data.session?.peakSeason.price}
                        </p>
                      </div>
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
                    <ul className="list-disc list-inside space-y-2">
                      {data.exclude?.map((item, index) => (
                        <li key={index} className="text-gray-600 text-sm">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Flight Information */}
                  <div className="bg-[#f5f5f5] p-6 rounded-lg shadow-sm min-h-[250px] flex flex-col">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                      Flight Information
                    </h2>
                    <div className="space-y-2">
                      <p className="text-gray-600 text-sm">
                        {data.flightInfo?.guideFee1}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {data.flightInfo?.guideFee2}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === "boat" && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Boat</h1>
              <div className="w-[80px] h-[3px] bg-[#CFB53B] mb-6"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-8xl mx-auto items-center mb-6">
                {data.boatImages?.map((boat, index) => (
                  <div
                    key={index}
                    className="relative group overflow-hidden rounded-lg shadow-lg"
                  >
                    {/* Gambar Boat */}
                    <div className="relative h-[300px] w-full">
                      <Image
                        src={boat.image}
                        alt={boat.title}
                        fill
                        className="rounded-lg object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    {/* Overlay with Shadow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center rounded-lg">
                      <p className="text-white font-semibold text-lg m-4 mb-10">
                        {boat.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailPaketOpenTrip;
