// src/app/(lang)/booking/page.tsx
"use client"; // Tambahkan directive "use client"

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

// Definisikan tipe untuk data perjalanan
interface PackageData {
  id: string;
  title: string;
  price: string;
  daysTrip: string;
  type: "Open Trip" | "Private Trip";
  image: string;
}

// Data dummy untuk Open Trip (diambil dari app/(lang)/open-trip/page.tsx)
const openTripData: PackageData[] = [
  {
    id: "stunning-flores-overland",
    title: "Stunning Flores Overland",
    price: "IDR 3.000.000/pax",
    daysTrip: "5 Days 4 Nights",
    type: "Open Trip",
    image: "/img/imgsmall-1.png",
  },
  {
    id: "full-day-trip-by-speed-boat",
    title: "Full Day Trip by Speed Boat",
    price: "IDR 2.500.000/pax",
    daysTrip: "1 Day",
    type: "Open Trip",
    image: "/img/imgsmall-1.png",
  },
  {
    id: "sailing-komodo-tour",
    title: "Sailing Komodo Tour",
    price: "IDR 14.500.000/pax",
    daysTrip: "3 Days 2 Nights",
    type: "Open Trip",
    image: "/img/komodoisland.png",
  },
  {
    id: "explore-waerebo",
    title: "Explore Waerebo",
    price: "IDR 2.500.000/pax",
    daysTrip: "2 Days 1 Night",
    type: "Open Trip",
    image: "/img/waerebovillage.png",
  },
];

// Data dummy untuk Private Trip (dibuat serupa dengan Open Trip)
const privateTripData: PackageData[] = [
  {
    id: "sailing-komodo-tour",
    title: "Sailing Komodo Tour",
    price: "IDR 20.000.000/pax",
    daysTrip: "4 Days 3 Nights",
    type: "Private Trip",
    image: "/img/komodoisland.png",
  },
  {
    id: "stunning-flores-overland",
    title: "Stunning Flores Overland",
    price: "IDR 15.000.000/pax",
    daysTrip: "6 Days 5 Nights",
    type: "Private Trip",
    image: "/img/imgsmall-1.png",
  },
  {
    id: "explore-waerebo",
    title: "Explore Waerebo",
    price: "IDR 5.000.000/pax",
    daysTrip: "3 Days 2 Nights",
    type: "Private Trip",
    image: "/img/waerebovillage.png",
  },
  {
    id: "full-day-trip-speed-boat",
    title: "Full Day Trip by Speed Boat",
    price: "IDR 8.000.000/pax",
    daysTrip: "5 Days 2 Nights",
    type: "Private Trip",
    image: "/img/waerebovillage.png",
  },
];

// Gabungkan data Open Trip dan Private Trip
const allPackages: PackageData[] = [...openTripData, ...privateTripData];

// Update the BookingPage component to ensure the correct image is displayed based on the selected package

export default function BookingPage() {
  const searchParams = useSearchParams();
  const packageId = searchParams.get("packageId");
  const dateParam = searchParams.get("date"); // Retrieve the date from query parameters
  const packageType = searchParams.get("type"); // Retrieve the package type (open or private)

  // State for storing the selected package and date
  const [selectedPackage, setSelectedPackage] = useState<PackageData | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    dateParam ? new Date(dateParam) : undefined // Automatically set the date if provided
  );
  const [tripCount, setTripCount] = useState(0);

  // Update the surcharge logic based on high and peak season
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

    // Check if the selected date falls within high or peak season
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

  // Find the package data based on packageId and type
  useEffect(() => {
    if (packageId && packageType) {
      const packageList =
        packageType === "open" ? openTripData : privateTripData;
      const foundPackage = packageList.find((pkg) => pkg.id === packageId);
      setSelectedPackage(foundPackage || null);
    }
  }, [packageId, packageType]);

  // If packageId is not found, display a message
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
    <div className="min-h-screen bg-[#efeaea] flex justify-center p-8">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-9xl">
        <h1 className="text-3xl font-bold text-center mb-6">YOUR BOOKING</h1>
        <div className="flex space-x-6">
          {/* Left Section: Trip Information */}
          <div className="w-1/3">
            <div className="relative">
              <Image
                src={selectedPackage.image || "/img/default-image.png"} // Tambahkan fallback default
                alt={selectedPackage.title}
                width={500}
                height={900} // Tetapkan rasio aspek (misalnya, 500x300)
                layout="responsive" // Pastikan gambar responsif
                className="rounded-lg object-cover" // Tambahkan object-cover untuk memastikan gambar terpotong dengan baik
              />
              <div
                className={`absolute top-4 left-4 px-3 py-2 rounded text-white text-xs font-semibold ${
                  packageType === "open" ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {packageType === "open" ? "Open Trip" : "Private Trip"}
              </div>
            </div>
            <h2 className="text-xl font-semibold mt-4">
              {selectedPackage.title}
            </h2>
            <p className="text-gray-600">
              {selectedPackage.daysTrip} {selectedPackage.price}
            </p>
            <div className="mt-4">
              <label className="block text-sm font-medium">Jumlah Pax</label>
              <div className="flex items-center space-x-2 mt-2">
                <button
                  className="px-2 py-1 bg-gray-200 rounded"
                  onClick={() => setTripCount((prev) => Math.max(prev - 1, 0))}
                >
                  -
                </button>
                <span>{tripCount}</span>
                <button
                  className="px-2 py-1 bg-gray-200 rounded"
                  onClick={() => setTripCount((prev) => prev + 1)}
                >
                  +
                </button>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Detail Pembayaran</h3>
              <p className="text-gray-600">Sub Total</p>
              <p className="text-gray-600">
                • {packageType === "open" ? "Open Trip" : "Private Trip"}{" "}
                {selectedPackage.price}
              </p>
              {surcharge && (
                <p className="text-gray-600">• High Peak Season {surcharge}</p>
              )}
              <p className="text-lg font-semibold mt-2">
                Total Pembayaran:{" "}
                {surcharge
                  ? `${selectedPackage.price} + ${surcharge}`
                  : selectedPackage.price}
              </p>
            </div>
            <button className="mt-4 w-full bg-yellow-200 text-[#f5f5f5] py-4 rounded-lg font-bold text-xl">
              BOOK NOW
            </button>
          </div>

          {/* Right Section: Booking Form */}
          <div className="w-2/3">
            <div className="flex justify-between mb-4">
              <button className="px-4 py-2 bg-gray-200 rounded">
                DOMESTIC
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6 items-start">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-2">
                  Data Diri Pemesan
                </h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Mr"
                    className="w-full p-2 shadow-md border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Name"
                    className="w-full p-2 shadow-md border rounded"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-2 shadow-md border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    className="w-full p-2 border rounded shadow-md"
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    className="w-full p-2 border rounded shadow-md"
                  />
                  <div className="flex space-x-2">
                    <select className="w-1/4 p-2 shadow-md border rounded">
                      <option>+62</option>
                    </select>
                    <input
                      type="text"
                      placeholder="No. WhatsApp"
                      className="w-3/4 p-2 shadow-md border rounded"
                    />
                  </div>
                  <textarea
                    placeholder="Catatan Tambahan"
                    className="w-full p-2 shadow-md border rounded"
                    rows={3}
                  ></textarea>
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-2">Detail Pesanan</h3>
                <div className="space-y-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full p-5 border rounded flex justify-between items-center shadow-md"
                      >
                        {selectedDate
                          ? format(selectedDate, "PPP")
                          : "Pilih Tanggal"}
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
                  <select className="w-full p-2 border rounded shadow-md">
                    <option>Durasi</option>
                  </select>
                  <select className="w-full p-2 border rounded shadow-md">
                    <option>Additional Charge</option>
                  </select>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Request Hotel
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
