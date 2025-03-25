"use client";

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import Image from 'next/image';
import Link from 'next/link';

// Data untuk tur Open Trip
const openTrips = [
  {
    image: "/img/waerebovillage.png",
    label: "Open Trip",
    name: "Explore Waerebo",
    duration: "3D/2N",
    priceUSD: "$250.000/pax",
    priceIDR: "IDR 2.500.000/pax",
    slug: "explore-waerebo",
  },
  {
    image: "/img/opentripkomodo.png",
    label: "Open Trip",
    name: "Sailing Komodo Tour",
    duration: "3D/2N",
    priceUSD: "$1450.000/pax",
    priceIDR: "IDR 14.500.000/pax",
    slug: "sailing-komodo-tour",
  },
  {
    image: "/img/kelorisland.png",
    label: "Open Trip",
    name: "Full Day Trip - By Speed Boat",
    duration: "1D",
    priceUSD: "$1450.000/pax",
    priceIDR: "IDR 14.500.000/pax",
    slug: "full-day-trip-by-speed-boat",
  },
  {
    image: "/img/kelelawarisland.png",
    label: "Open Trip",
    name: "Sunset Trip - By Speed Boat",
    duration: "1D",
    priceUSD: "$1200.000/pax",
    priceIDR: "IDR 12.000.000/pax",
    slug: "sunset-trip-by-speed-boat",
  },
];

export default function OpenTrip() {
  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Bagian Hero */}
      <section className="relative h-[900px] w-full overflow-hidden">
        <Image
          src="/img/heroopen.png"
          alt="Open Trip Hero"
          fill
          className="object-contain object-center"
          quality={100}
          priority
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <h1 className="text-6xl font-bold text-white tracking-wide">OPEN TRIP</h1>
        </div>
      </section>

      {/* Bagian Tentang dan Pencarian */}
      <section className="py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row gap-8">
          {/* Tentang Open Trip */}
          <div className="md:w-2/3 bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Tentang Open Trip</h2>
            <p className="text-gray-600 leading-relaxed">
              Open Trip adalah paket perjalanan grup yang terbuka untuk umum, di mana peserta dapat bergabung dengan orang lain yang juga memesan trip yang sama. Open Trip memiliki jadwal tetap dan harga yang lebih terjangkau.
            </p>
          </div>

          {/* Formulir Pencarian */}
          <div className="md:w-1/3 bg-white p-8 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-6 text-gray-800">Cari Trip</h3>
            <div className="space-y-6">
              <Select>
                <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-yellow-500">
                  <SelectValue placeholder="Urutkan Berdasarkan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high-low">Tinggi ke Rendah</SelectItem>
                  <SelectItem value="low-high">Rendah ke Tinggi</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-yellow-500">
                  <SelectValue placeholder="Cari Durasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">1 Hari</SelectItem>
                  <SelectItem value="3d2n">3H/2M</SelectItem>
                  <SelectItem value="custom">Kustom</SelectItem>
                </SelectContent>
              </Select>
              <button className="w-full bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 transition-colors duration-300">
                Cari
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Bagian Tur */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Tur Open Trip</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Open Trip adalah paket perjalanan grup yang terbuka untuk umum, di mana peserta dapat bergabung dengan orang lain yang juga memesan trip yang sama. Open Trip memiliki jadwal tetap dan harga yang lebih terjangkau.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {openTrips.map((trip, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden group w-[370] h-[320] flex flex-col"
              >
                <div className="relative">
                  <Image
                    src={trip.image}
                    alt={trip.name}
                    width={300}
                    height={300}
                    className="w-full h-50 object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded">
                    {trip.label}
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-center items-center">
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
                    <Link href={`/tours/${trip.slug}`}>
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
      </section>
    </div>
  );
}