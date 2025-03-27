// components/ui-detail/DetailPrivateTrip.tsx
"use client";

import DetailPaketPrivateTrip from "@/components/ui-detail/DetailPaketPrivateTrip";
import DetailFAQ from "@/components/ui-detail/DetailFAQ";
import DetailReview from "@/components/ui-detail/DetailReview";
import DetailMoreTrip from "@/components/ui-detail/DetailMoreTrip";
import DetailBlog from "@/components/ui-detail/DetailBlog"; // Impor DetailBlog
import { useSearchParams } from "next/navigation";
import Link from "next/link";

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

// Data dummy untuk semua paket Private Trip
const privateTripData: PackageData[] = [
  {
    id: "explore-waerebo",
    title: "Explore Waerebo",
    price: "IDR 4.000.000/pax",
    meetingPoint: "Labuan Bajo",
    destination: "Waerebo Village",
    daysTrip: "3 Days 2 Nights",
    description:
      "Experience a luxurious Private Trip to Waerebo Village, tailored to your preferences. This exclusive trip includes private transportation, personalized itineraries, and a dedicated guide to ensure a memorable experience.",
    itinerary: [
      "Day 1: Arrival in Labuan Bajo, private transfer to hotel.",
      "Day 2: Journey to Waerebo Village, cultural experience.",
      "Day 3: Return to Labuan Bajo, transfer to airport.",
    ],
    information:
      "This Private Trip includes: private transportation, luxury accommodations, gourmet meals, and a dedicated guide. Not included: personal expenses and travel insurance.",
    boat: "No boat used for this trip.",
    privateGuide: "Dedicated English-speaking guide",
    destinations: 2,
    images: [
      "/img/waerebo1.jpg",
      "/img/waerebo2.jpg",
      "/img/waerebo3.jpg",
      "/img/waerebo4.jpg",
      "/img/waerebo5.jpg",
    ],
  },
  {
    id: "full-day-trip-speed-boat",
    title: "Full Day Trip by Speed Boat",
    price: "IDR 5.000.000/pax",
    meetingPoint: "Labuan Bajo",
    destination: "Komodo Island",
    daysTrip: "1 Day",
    description:
      "Enjoy a full-day Private Trip to Komodo Island on a speed boat, with a personalized itinerary and a dedicated guide.",
    itinerary: [
      "08:00 AM: Depart from Labuan Bajo.",
      "09:00 AM: Arrive at Komodo Island, explore the park.",
      "12:00 PM: Lunch on the boat.",
      "02:00 PM: Visit Pink Beach.",
      "04:00 PM: Return to Labuan Bajo.",
    ],
    information:
      "This Private Trip includes: speed boat, lunch, guide, and entrance fees. Not included: personal expenses and travel insurance.",
    boat: "Private speed boat with air-conditioned cabin and safety equipment.",
    privateGuide: "Dedicated English-speaking guide",
    destinations: 2,
    images: [
      "/img/speedboat1.jpg",
      "/img/speedboat2.jpg",
      "/img/speedboat3.jpg",
      "/img/speedboat4.jpg",
      "/img/speedboat5.jpg",
    ],
  },
];

// Data dummy untuk FAQ di halaman detail paket
const detailFaqs = [
  { question: "Pertanyaan 1", answer: "Jawaban untuk Pertanyaan 1." },
  { question: "Pertanyaan 2", answer: "Jawaban untuk Pertanyaan 2." },
  { question: "Pertanyaan 3", answer: "Jawaban untuk Pertanyaan 3." },
  { question: "Pertanyaan 4", answer: "Jawaban untuk Pertanyaan 4." },
  { question: "Pertanyaan 5", answer: "Jawaban untuk Pertanyaan 5." },
];

// Data dummy untuk ulasan
const reviews = [
  {
    judul: "Review Title",
    nama: "Reviewer Name",
    tanggal: "Date",
    komentar: "Review body",
    gambar: "/img/pic-testi.jpg",
    rating: 5,
  },
  {
    judul: "Review Title",
    nama: "Reviewer Name",
    tanggal: "Date",
    komentar: "Review body",
    gambar: "/img/pic-testi.jpg",
    rating: 5,
  },
  {
    judul: "Review Title",
    nama: "Reviewer Name",
    tanggal: "Date",
    komentar: "Review body",
    gambar: "/img/pic-testi.jpg",
    rating: 5,
  },
  {
    judul: "Review Title",
    nama: "Reviewer Name",
    tanggal: "Date",
    komentar: "Review body",
    gambar: "/img/pic-testi.jpg",
    rating: 5,
  },
];

// Data untuk More Private Trip
const morePrivateTrips = [
  {
    image: "/img/waerebo1.jpg",
    label: "Private Trip",
    name: "Explore Waerebo",
    duration: "3D/2N",
    priceIDR: "IDR 4.000.000/pax",
    slug: "explore-waerebo",
  },
  {
    image: "/img/speedboat1.jpg",
    label: "Private Trip",
    name: "Full Day Trip by Speed Boat",
    duration: "1D",
    priceIDR: "IDR 5.000.000/pax",
    slug: "full-day-trip-speed-boat",
  },
  {
    image: "/img/kelorisland.png",
    label: "Private Trip",
    name: "Sunset Trip - By Speed Boat",
    duration: "1D",
    priceIDR: "IDR 12.000.000/pax",
    slug: "sunset-trip-by-speed-boat",
  },
  {
    image: "/img/kelelawarisland.png",
    label: "Private Trip",
    name: "Luxury Komodo Tour",
    duration: "3D/2N",
    priceIDR: "IDR 20.000.000/pax",
    slug: "luxury-komodo-tour",
  },
];

// Data dummy untuk Latest Post
const blogPosts = [
  {
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    image: "/img/blog1.jpg",
    slug: "lorem-ipsum-1",
  },
  {
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    image: "/img/blog2.jpg",
    slug: "lorem-ipsum-2",
  },
  {
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    image: "/img/blog3.jpg",
    slug: "lorem-ipsum-3",
  },
  {
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    image: "/img/blog4.jpg",
    slug: "lorem-ipsum-4",
  },
];

export default function DetailPrivateTrip() {
  const searchParams = useSearchParams();
  const packageId = searchParams.get("id") || "explore-waerebo"; // Default ke "explore-waerebo" jika id tidak ada

  // Cari data paket berdasarkan packageId
  const selectedPackage = privateTripData.find((pkg) => pkg.id === packageId);

  // Jika paket tidak ditemukan, tampilkan pesan error atau redirect
  if (!selectedPackage) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-gray-800">Paket Tidak Ditemukan</h1>
        <p className="text-gray-600">Mohon maaf, paket Private Trip yang Anda cari tidak ditemukan.</p>
        <Link href="/">
          <button className="mt-4 bg-[#CFB53B] text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-[#7F6D1F] hover:scale-95 transition-all duration-300">
            Kembali ke Beranda
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Detail Paket */}
      <DetailPaketPrivateTrip data={selectedPackage} />

      {/* Review Section */}
      <DetailReview reviews={reviews} />

      {/* More Private Trip Section */}
      <DetailMoreTrip trips={morePrivateTrips.filter((trip) => trip.slug !== packageId)} tripType="private-trip" />

      {/* Section Latest Post dan FAQ */}
      <div className="max-w-6xl mx-auto px-4 py-12 md:flex md:space-x-6">
        {/* Latest Post */}
        <div className="md:w-1/2 mb-6 md:mb-0">
          <DetailBlog posts={blogPosts} />
        </div>
        {/* FAQ */}
        <div className="md:w-1/2">
          <DetailFAQ faqs={detailFaqs} />
        </div>
      </div>
    </div>
  );
}