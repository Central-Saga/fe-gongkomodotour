// components/ui-detail/DetailMoreTrip.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

// Definisikan tipe untuk data tur
interface TripData {
  image: string;
  label: string;
  name: string;
  duration: string;
  priceIDR: string;
  slug: string;
}

// Definisikan tipe untuk props komponen
interface DetailMoreTripProps {
  trips: TripData[];
  tripType: "open-trip" | "private-trip";
}

export default function DetailMoreTrip({ trips, tripType }: DetailMoreTripProps) {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-9 text-center">
          More {tripType === "open-trip" ? "Open Trip" : "Private Trip"}
        </h2>
        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.slice(0, 3).map((trip, index) => ( // Hanya ambil 3 tur
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden group w-[350px] h-[320px] flex flex-col"
              >
                <div className="relative">
                  <Image
                    src={trip.image}
                    alt={trip.name}
                    width={350}
                    height={180}
                    className="w-full h-48 object-cover"
                  />
                  <span
                    className={`absolute top-3 left-3 text-white text-xs font-semibold px-3 py-1 rounded ${
                      tripType === "open-trip" ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {trip.label}
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-center items-center">
                  {/* Konten judul, durasi, dan harga yang akan disembunyikan saat hover */}
                  <div className="text-center group-hover:hidden">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{trip.name}</h3>
                    <div className="flex items-center justify-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Image
                          src="/img/sun.png"
                          alt="Sun Icon"
                          width={16}
                          height={16}
                          className="w-4 h-4"
                        />
                        <p className="text-gray-600 text-sm">{trip.duration}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Image
                          src="/img/dollar.png"
                          alt="Dollar Icon"
                          width={16}
                          height={16}
                          className="w-4 h-4"
                        />
                        <p className="text-gray-600 text-sm">{trip.priceIDR}</p>
                      </div>
                    </div>
                  </div>
                  {/* Tombol More Detail yang muncul saat hover */}
                  <div className="hidden group-hover:flex items-center justify-center flex-1">
                    <Link href={`/detail-paket/${tripType}?id=${trip.slug}`}>
                      <button className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors duration-300">
                        More Detail
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}