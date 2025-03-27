// components/ui-detail/DetailOpenTrip.tsx
"use client";

import DetailPaketOpenTrip from "@/components/ui-detail/DetailPaketOpenTrip";
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

// Data dummy untuk semua paket Open Trip
const openTripData: PackageData[] = [
  {
    id: "sailing-komodo-tour",
    title: "Sailing Komodo Tour",
    price: "IDR 2.500.000/pax",
    meetingPoint: "Labuan Bajo",
    destination: "Komodo Island",
    daysTrip: "3 Days 2 Nights",
    description:
      "Join our exciting Open Trip to Komodo Island, where you can explore the beauty of Komodo National Park with a group of fellow travelers. This trip includes visits to Pink Beach, Komodo Island, and Manta Point, with shared accommodations and meals provided.Join our exciting Open Trip to Komodo Island, where you can explore the beauty of Komodo National Park with a group of fellow travelers. This trip includes visits to Pink Beach, Komodo Island, and Manta Point, with shared accommodations and meals provided.Join our exciting Open Trip to Komodo Island, where you can explore the beauty of Komodo National Park with a group of fellow travelers. This trip includes visits to Pink Beach, Komodo Island, and Manta Point, with shared accommodations and meals provided.Join our exciting Open Trip to Komodo Island, where you can explore the beauty of Komodo National Park with a group of fellow travelers. This trip includes visits to Pink Beach, Komodo Island, and Manta Point, with shared accommodations and meals provided.",
    itinerary: [
      "Day 1: Arrival in Labuan Bajo, transfer to hotel.",
      "Day 2: Full day sailing to Komodo Island.",
      "Day 3: Return to Labuan Bajo, transfer to airport.",
    ],
    information:
      "This Open Trip includes: transportation, shared accommodations, meals, and guided tours. Not included: personal expenses, travel insurance, and optional activities.",
    boat: "Shared wooden boat with basic amenities, including cabins, dining area, and safety equipment.",
    groupSize: "10-15 people",
    images: [
      "/img/waerebovillage.png",
      "/img/imgsmall-2.png",
      "/img/imgsmall-3.png",
      "/img/imgsmall-4.png",
      "/img/imgsmall-1.png",
    ],
  },
  {
    id: "stunning-flores-overland",
    title: "Stunning Flores Overland",
    price: "IDR 3.000.000/pax",
    meetingPoint: "Ende",
    destination: "Flores",
    daysTrip: "5 Days 4 Nights",
    description:
      "Explore the stunning landscapes of Flores on this overland Open Trip, visiting traditional villages, volcanic lakes, and breathtaking viewpoints.",
    itinerary: [
      "Day 1: Arrival in Ende, transfer to hotel.",
      "Day 2: Visit Kelimutu National Park.",
      "Day 3: Explore traditional villages.",
      "Day 4: Scenic drive to Bajawa.",
      "Day 5: Return to Ende, transfer to airport.",
    ],
    information:
      "This Open Trip includes: transportation, shared accommodations, meals, and guided tours. Not included: personal expenses and travel insurance.",
    boat: "No boat used for this overland trip.",
    groupSize: "8-12 people",
    images: [
      "/img/flores1.jpg",
      "/img/flores2.jpg",
      "/img/flores3.jpg",
      "/img/flores4.jpg",
      "/img/flores5.jpg",
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

// Data untuk More Open Trip
const moreOpenTrips = [
  {
    image: "/img/waerebovillage.png",
    label: "Open Trip",
    name: "Explore Waerebo",
    duration: "3D/2N",
    priceIDR: "IDR 2.500.000/pax",
    slug: "explore-waerebo",
  },
  {
    image: "/img/opentripkomodo.png",
    label: "Open Trip",
    name: "Sailing Komodo Tour",
    duration: "3D/2N",
    priceIDR: "IDR 14.500.000/pax",
    slug: "sailing-komodo-tour",
  },
  {
    image: "/img/kelorisland.png",
    label: "Open Trip",
    name: "Full Day Trip - By Speed Boat",
    duration: "1D",
    priceIDR: "IDR 14.500.000/pax",
    slug: "full-day-trip-by-speed-boat",
  },
  {
    image: "/img/kelelawarisland.png",
    label: "Open Trip",
    name: "Sunset Trip - By Speed Boat",
    duration: "1D",
    priceIDR: "IDR 12.000.000/pax",
    slug: "sunset-trip-by-speed-boat",
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

export default function DetailOpenTrip() {
  const searchParams = useSearchParams();
  const packageId = searchParams.get("id");

  // Cari data paket berdasarkan packageId
  const selectedPackage = openTripData.find((pkg) => pkg.id === packageId);

  // Jika paket tidak ditemukan, tampilkan pesan error atau redirect
  if (!selectedPackage) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-gray-800">Paket Tidak Ditemukan</h1>
        <p className="text-gray-600">Mohon maaf, paket Open Trip yang Anda cari tidak ditemukan.</p>
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
      <DetailPaketOpenTrip data={selectedPackage} />

      {/* Review Section */}
      <DetailReview reviews={reviews} />

      {/* More Open Trip Section */}
      <DetailMoreTrip trips={moreOpenTrips.filter((trip) => trip.slug !== packageId)} tripType="open-trip" />

      {/* Section Latest Post dan FAQ */}
      <div className="px-4 py-12 md:flex md:space-x-6">
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