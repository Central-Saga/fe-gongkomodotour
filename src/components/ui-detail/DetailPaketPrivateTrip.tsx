// components/ui-detail/DetailPaketPrivateTrip.tsx
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
import { format } from "date-fns";

// Definisikan tipe untuk data paket
interface PackageData {
  id: string;
  title: string;
  price: string;
  meetingPoint: string;
  destination: string;
  daysTrip: string;
  description: string;
  itinerary: string[];
  information: string;
  boat: string;
  groupSize?: string;
  privateGuide?: string;
  images: string[];
  destinations?: number;
}

// Definisikan tipe untuk props komponen
interface DetailPaketPrivateTripProps {
  data: PackageData;
}

// Gunakan React.FC dengan tipe props yang tepat
const DetailPaketPrivateTrip: React.FC<DetailPaketPrivateTripProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState("description");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  return (
    <div className="py-12 px-4">
      {/* Section 1: Gambar */}
      <div className="relative mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Gambar Utama */}
          <div className="relative h-[300px] md:h-[400px]">
            <Image
              src={data.images[0]}
              alt={data.title}
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
          {/* Gambar Kecil */}
          <div className="grid grid-cols-2 gap-4">
            {data.images.slice(1, 5).map((image, index) => (
              <div key={index} className="relative h-[120px] md:h-[180px]">
                <Image
                  src={image}
                  alt={`${data.title} ${index + 1}`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
              </div>
            ))}
            {data.images.length > 5 && (
              <div className="relative h-[120px] md:h-[180px] flex items-center justify-center bg-gray-200 rounded-lg">
                <p className="text-gray-600 font-semibold">More Info</p>
              </div>
            )}
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
          Start from <strong>{data.price}</strong>
        </p>
      </div>

      {/* Section 3: Destinasi */}
      <div className="bg-[#f5f5f5] p-6 rounded-lg shadow-md mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 md:mb-0 max-w-6xl">
            <div className="flex items-start">
              <Image
                src="/img/Meeting.png"
                alt="Meeting Point Icon"
                width={50}
                height={50}
                className="mr-2"
              />
              <div className="flex flex-col">
                <span className="text-gray-600 font-semibold">Meeting Point</span>
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
                <span className="text-gray-600">{data.destinations} Destinasi</span>
              </div>
            </div>
            <div className="flex items-start">
              <Image
                src="/img/Routine.png"
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
            {selectedDate && (
              <Link href="/">
                <Button className="bg-[#CFB53B] text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-[#7F6D1F] hover:scale-95 transition-all duration-300">
                  Book Now
                </Button>
              </Link>
            )}
          </div>
        </div>
        {/* Field Opsional untuk Private Trip */}
        {/* {data.privateGuide && (
          <div className="flex items-center mt-4 max-w-6xl">
            <span className="text-gray-600 font-semibold mr-2">Private Guide:</span>
            <span className="text-gray-600">{data.privateGuide}</span>
          </div>
        )} */}
      </div>

      {/* Section 4: Tab Navigasi dan Konten */}
      <div className=" bg-white p-6 rounded-lg shadow-md">
        <div className="flex space-x-4 mb-6">
          <Button
            variant={activeTab === "description" ? "default" : "outline"}
            onClick={() => setActiveTab("description")}
            className={`${
              activeTab === "description"
                ? "bg-[#CFB53B] text-white"
                : "bg-gray-200 text-gray-800"
            } px-6 py-2 rounded-lg font-semibold text-sm hover:bg-[#7F6D1F] hover:text-white transition-all duration-300`}
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
            } px-6 py-2 rounded-lg font-semibold text-sm hover:bg-[#7F6D1F] hover:text-white transition-all duration-300`}
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
            } px-6 py-2 rounded-lg font-semibold text-sm hover:bg-[#7F6D1F] hover:text-white transition-all duration-300`}
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
            } px-6 py-2 rounded-lg font-semibold text-sm hover:bg-[#7F6D1F] hover:text-white transition-all duration-300`}
          >
            Boat
          </Button>
        </div>

        <div>
          {activeTab === "description" && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Description</h2>
              <p className="text-gray-600">{data.description}</p>
            </div>
          )}
          {activeTab === "itinerary" && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Itinerary</h2>
              <ul className="list-disc list-inside text-gray-600">
                {data.itinerary.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {activeTab === "information" && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Information</h2>
              <p className="text-gray-600">{data.information}</p>
            </div>
          )}
          {activeTab === "boat" && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Boat</h2>
              <p className="text-gray-600">{data.boat}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailPaketPrivateTrip;