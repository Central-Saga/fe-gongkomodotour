"use client";

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
import { useRouter } from "next/navigation";
import { openTripData } from "@/components/ui-booking/data/openTripData";
import { privateTripData } from "@/components/ui-booking/data/privateTripData";

interface PackageData {
  id: string;
  title: string;
  price: string;
  daysTrip: string;
  type: "Open Trip" | "Private Trip";
  image: string;
  mainImage?: string;
}

export default function Booking() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageId = searchParams.get("packageId");
  const dateParam = searchParams.get("date");
  const packageType = searchParams.get("type");

  const [selectedPackage, setSelectedPackage] = useState<PackageData | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    dateParam ? new Date(dateParam) : undefined
  );
  const [tripCount, setTripCount] = useState(0);

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
    if (packageId && packageType) {
      const packageList =
        packageType === "open" ? openTripData : privateTripData;
      const foundPackage = packageList.find((pkg) => pkg.id === packageId);

      if (foundPackage) {
        setSelectedPackage({
          ...foundPackage,
          type: packageType === "open" ? "Open Trip" : "Private Trip", // Explicitly cast type
        });
      } else {
        setSelectedPackage(null);
      }
    }
  }, [packageId, packageType]);

  const isFormComplete = selectedPackage && selectedDate && tripCount > 0;

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
                src={selectedPackage.mainImage || "/img/default-image.png"} // Use mainImage
                alt={selectedPackage.title}
                width={500}
                height={900}
                layout="responsive"
                className="rounded-lg object-cover"
              />
              <div
                className={`absolute top-4 left-4 px-3 py-2 rounded text-white text-xs font-semibold ${
                  packageType === "open" ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {packageType === "open" ? "Open Trip" : "Private Trip"}
              </div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <h2 className="text-xl font-semibold">{selectedPackage.title}</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600">
                  Jumlah Pax
                </span>
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
            
            <p className="text-gray-600 mt-2">
              {selectedPackage.daysTrip} {selectedPackage.price}
            </p>

            <hr className="my-2 mt-8 border-gray-300" />
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
              <hr className="my-2 mt-8 border-gray-300" />
              <p className="text-lg font-semibold mt-2">
                Total Pembayaran:{" "}
                {surcharge
                  ? `${selectedPackage.price} + ${surcharge}`
                  : selectedPackage.price}
              </p>
            </div>
            <button
              className={`mt-4 w-full py-4 rounded-lg font-bold text-2xl ${
                isFormComplete
                  ? "bg-yellow-400 text-white cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!isFormComplete}
              onClick={() =>
                isFormComplete &&
                router.push(
                  `/payment?packageId=${packageId}&type=${packageType}&date=${selectedDate?.toISOString()}&tripCount=${tripCount}`
                )
              }
            >
              BOOK NOW
            </button>
          </div>

          {/* Right Section: Booking Form */}
          <div className="w-2/3">
            <div className="flex justify-between mb-4">
              <button className="px-4 py-2 bg-[#efe6e6] rounded font-medium shadow-md">
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
                    <option>Boat Pilihan</option>
                  </select>
                  <select className="w-full p-2 border rounded shadow-md">
                    <option>Cabin Boat</option>
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
