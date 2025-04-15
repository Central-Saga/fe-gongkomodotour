// components/ui-detail/DetailPrivateTrip.tsx
"use client";

import DetailPaketPrivateTrip from "@/components/ui-detail/DetailPaketPrivateTrip";
import DetailFAQ from "@/components/ui-detail/ui-call/DetailFAQ";
import DetailReview from "@/components/ui-detail/ui-call/DetailReview";
import DetailMoreTrip from "@/components/ui-detail/ui-call/DetailMoreTrip";
import DetailBlog from "@/components/ui-detail/ui-call/DetailBlog"; // Impor DetailBlog
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
}

const privateTripData: PackageData[] = [
  {
    id: "stunning-flores-overland",
    title: "Stunning Flores Overland",
    price: "IDR 3.000.000/pax",
    meetingPoint: "Ende",
    destination: "Flores",
    daysTrip: "5 Days 4 Nights",
    description:
      "Explore the stunning landscapes of Flores with visits to traditional villages and volcanic lakes. Enjoy guided tours throughout your trip.",
    itinerary: [
      "Day 1: Arrival in Ende and hotel check-in",
      "Day 2: Visit Kelimutu National Park",
      "Day 3: Explore traditional villages",
      "Day 4: Scenic drive to Bajawa",
      "Day 5: Return to Ende and departure",
    ],
    include: [
      "Transportasi dengan mobil Innova",
      "Pemandu lokal",
      "1 malam menginap di Waretbo Village",
      "Makan selama perjalanan (makan siang, makan malam, sarapan)",
      "Kopi & teh",
      "Biaya masuk dan donasi ke desa",
    ],
    exclude: [
      "Tiket pesawat",
      "Akomodasi hotel di Labuan Bajo",
      "Biaya pribadi",
      "Trip insurance",
      "Porter dan tips",
    ],
    session: {
      highSeason: {
        period:
          "1 June ~ 31 August 2025; 1-10 October 2025; 14–20 February 2026; 17–24 March 2026",
        price: "IDR 300.000/pax",
      },
      peakSeason: {
        period: "25 March ~ 5 April 2025 & 20 December 2025 ~ 5 January 2026",
        price: "IDR 300.000/pax",
      },
    },
    flightInfo: {
      guideFee1:
        "ENGLISH SPEAKING GUIDE FEE (1 - 5 Pax): IDR 650.000 / Day / Guide",
      guideFee2:
        "ENGLISH SPEAKING GUIDE FEE (6 - 10 Pax): IDR 850.000 / Day / Guide",
    },
    boat: "No boat used",
    groupSize: "8-12 people",
    information:
      "This package includes guided tours, transportation, and meals throughout the trip.",
    images: [
      "/img/benavillage.png",
      "/img/gallery2.jpg",
      "/img/gallery4.jpg",
      "/img/gallery5.jpg",
      "/img/gallery6.jpg",
      "/img/gallery7.jpg",
      "/img/gallery8.jpg",
      "/img/gallery9.jpg",
      "/img/gallery2.jpg",
      "/img/gallery1.jpg",
      "/img/gallery2.jpg",
      "/img/gallery4.jpg",
    ],
    destinations: 5,
    boatImages: [
      { image: "/img/boat/boat-dlx-lmb2.jpg", title: "Luxury Boat 1" },
      { image: "/img/boat/boat-dlx-mv.jpg", title: "Luxury Boat 2" },
      { image: "/img/boat/boat-zm.jpg", title: "Luxury Boat 3" },
      { image: "/img/boat/boat-zn-phinisi.jpg", title: "Luxury Boat 4" },
      { image: "/img/boat/boat-alf.jpg", title: "Luxury Boat 5" },
      { image: "/img/boat/bg-luxury.jpg", title: "Luxury Boat 6" },
    ],
  },
  {
    id: "full-day-trip-speed-boat",
    title: "Full Day Trip by Speed Boat",
    price: "IDR 2.500.000/pax",
    meetingPoint: "Labuan Bajo",
    destination: "Komodo National Park",
    daysTrip: "1 Day",
    description:
      "Experience a full day of adventure exploring the Komodo National Park by speed boat. Visit iconic islands and enjoy snorkeling in crystal-clear waters.",
    itinerary: [
      "Morning: Departure from Labuan Bajo",
      "Visit Kelor Island for trekking and snorkeling",
      "Explore Manjarite for underwater beauty",
      "Lunch on the boat",
      "Visit Komodo Island to see Komodo dragons",
      "Afternoon: Return to Labuan Bajo",
    ],
    include: [
      "Speed boat transportation",
      "Lunch and snacks",
      "Snorkeling equipment",
      "Entrance fees to Komodo National Park",
      "Tour guide",
    ],
    exclude: ["Personal expenses", "Travel insurance", "Tips for the crew"],
    session: {
      highSeason: {
        period: "1 June ~ 31 August 2025",
        price: "IDR 300.000/pax",
      },
      peakSeason: {
        period: "25 December 2025 ~ 5 January 2026",
        price: "IDR 500.000/pax",
      },
    },
    flightInfo: {
      guideFee1:
        "ENGLISH SPEAKING GUIDE FEE (1 - 5 Pax): IDR 650.000 / Day / Guide",
      guideFee2:
        "ENGLISH SPEAKING GUIDE FEE (6 - 10 Pax): IDR 850.000 / Day / Guide",
    },
    boat: "Speed Boat",
    groupSize: "10-15 people",
    information:
      "This package includes a full-day guided tour with speed boat transportation.",
    images: [
      "/img/imgsmall-1.png",
      "/img/gallery2.jpg",
      "/img/gallery4.jpg",
      "/img/gallery5.jpg",
      "/img/gallery6.jpg",
      "/img/gallery7.jpg",
      "/img/gallery8.jpg",
      "/img/gallery9.jpg",
      "/img/gallery2.jpg",
      "/img/gallery1.jpg",
      "/img/gallery2.jpg",
      "/img/gallery4.jpg",
    ],
    destinations: 3,
    boatImages: [
      { image: "/img/boat/boat-dlx-lmb2.jpg", title: "Luxury Boat 1" },
      { image: "/img/boat/boat-dlx-mv.jpg", title: "Luxury Boat 2" },
      { image: "/img/boat/boat-zm.jpg", title: "Luxury Boat 3" },
      { image: "/img/boat/boat-zn-phinisi.jpg", title: "Luxury Boat 4" },
      { image: "/img/boat/boat-alf.jpg", title: "Luxury Boat 5" },
      { image: "/img/boat/bg-luxury.jpg", title: "Luxury Boat 6" },
    ],
  },
  {
    id: "sailing-komodo-tour",
    title: "Sailing Komodo Tour",
    price: "IDR 14.500.000/pax",
    meetingPoint: "Labuan Bajo",
    destination: "Komodo National Park",
    daysTrip: "3 Days 2 Nights",
    description:
      "Sail through the beautiful Komodo National Park, visiting pristine beaches, snorkeling spots, and the famous Komodo dragons.",
    itinerary: [
      "Day 1: Departure from Labuan Bajo, visit Kelor Island and Rinca Island",
      "Day 2: Explore Pink Beach and Komodo Island",
      "Day 3: Snorkeling at Manta Point and return to Labuan Bajo",
    ],
    include: [
      "Sailing boat accommodation",
      "Meals and drinks",
      "Snorkeling equipment",
      "Entrance fees to Komodo National Park",
      "Tour guide",
    ],
    exclude: ["Personal expenses", "Travel insurance", "Tips for the crew"],
    session: {
      highSeason: {
        period: "1 June ~ 31 August 2025",
        price: "IDR 500.000/pax",
      },
      peakSeason: {
        period: "25 December 2025 ~ 5 January 2026",
        price: "IDR 700.000/pax",
      },
    },
    flightInfo: {
      guideFee1:
        "ENGLISH SPEAKING GUIDE FEE (1 - 5 Pax): IDR 650.000 / Day / Guide",
      guideFee2:
        "ENGLISH SPEAKING GUIDE FEE (6 - 10 Pax): IDR 850.000 / Day / Guide",
    },
    boat: "Sailing Boat",
    groupSize: "8-12 people",
    information:
      "This package includes a 3-day sailing adventure with full board meals.",
    images: [
      "/img/komodoisland.png",
      "/img/komodoprivate.png",
      "/img/gallery2.jpg",
      "/img/gallery4.jpg",
      "/img/gallery5.jpg",
      "/img/gallery6.jpg",
      "/img/gallery7.jpg",
      "/img/gallery8.jpg",
      "/img/gallery9.jpg",
      "/img/gallery2.jpg",
      "/img/gallery1.jpg",
      "/img/gallery2.jpg",
      "/img/gallery4.jpg",
    ],
    destinations: 4,
    boatImages: [
      { image: "/img/boat/boat-dlx-lmb2.jpg", title: "Luxury Boat 1" },
      { image: "/img/boat/boat-dlx-mv.jpg", title: "Luxury Boat 2" },
      { image: "/img/boat/boat-zm.jpg", title: "Luxury Boat 3" },
      { image: "/img/boat/boat-zn-phinisi.jpg", title: "Luxury Boat 4" },
      { image: "/img/boat/boat-alf.jpg", title: "Luxury Boat 5" },
      { image: "/img/boat/bg-luxury.jpg", title: "Luxury Boat 6" },
    ],
  },
  {
    id: "explore-waerebo",
    title: "Explore Waerebo",
    price: "IDR 2.500.000/pax",
    meetingPoint: "Ruteng",
    destination: "Waerebo Village",
    daysTrip: "2 Days 1 Night",
    description:
      "Discover the traditional Waerebo Village, nestled in the mountains of Flores. Experience the unique culture and hospitality of the locals.",
    itinerary: [
      "Day 1: Drive from Ruteng to Denge Village, trek to Waerebo Village",
      "Day 2: Morning exploration of Waerebo, return to Ruteng",
    ],
    include: [
      "Transportation from Ruteng",
      "1-night accommodation in Waerebo Village",
      "Meals during the trip",
      "Local guide",
      "Entrance fees",
    ],
    exclude: ["Personal expenses", "Travel insurance", "Tips for the guide"],
    session: {
      highSeason: {
        period: "1 June ~ 31 August 2025",
        price: "IDR 200.000/pax",
      },
      peakSeason: {
        period: "25 December 2025 ~ 5 January 2026",
        price: "IDR 300.000/pax",
      },
    },
    flightInfo: {
      guideFee1:
        "ENGLISH SPEAKING GUIDE FEE (1 - 5 Pax): IDR 650.000 / Day / Guide",
      guideFee2:
        "ENGLISH SPEAKING GUIDE FEE (6 - 10 Pax): IDR 850.000 / Day / Guide",
    },
    boat: "No boat used",
    groupSize: "5-10 people",
    information:
      "This package includes a guided trek to Waerebo Village with meals and accommodation.",
    images: [
      "/img/waerebovillage.png",
      "/img/imgsmall-1.png",
      "/img/gallery2.jpg",
      "/img/gallery4.jpg",
      "/img/gallery5.jpg",
      "/img/gallery6.jpg",
      "/img/gallery7.jpg",
      "/img/gallery8.jpg",
      "/img/gallery9.jpg",
      "/img/gallery2.jpg",
      "/img/gallery1.jpg",
      "/img/gallery2.jpg",
      "/img/gallery4.jpg",
    ],
    destinations: 1,
    boatImages: [
      { image: "/img/boat/boat-dlx-lmb2.jpg", title: "Luxury Boat 1" },
      { image: "/img/boat/boat-dlx-mv.jpg", title: "Luxury Boat 2" },
      { image: "/img/boat/boat-zm.jpg", title: "Luxury Boat 3" },
      { image: "/img/boat/boat-zn-phinisi.jpg", title: "Luxury Boat 4" },
      { image: "/img/boat/boat-alf.jpg", title: "Luxury Boat 5" },
      { image: "/img/boat/bg-luxury.jpg", title: "Luxury Boat 6" },
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
    image: "/img/komodoprivate.png",
    label: "Private Trip",
    name: "Explore Waerebo",
    duration: "3D/2N",
    priceIDR: "IDR 4.000.000/pax",
    slug: "explore-waerebo",
  },
  {
    image: "/img/komodoprivate.png",
    label: "Private Trip",
    name: "Full Day Trip by Speed Boat",
    duration: "1D",
    priceIDR: "IDR 5.000.000/pax",
    slug: "full-day-trip-speed-boat",
  },
  {
    image: "/img/komodoprivate.png",
    label: "Private Trip",
    name: "Sunset Trip - By Speed Boat",
    duration: "1D",
    priceIDR: "IDR 12.000.000/pax",
    slug: "sunset-trip-by-speed-boat",
  },
  {
    image: "/img/komoprivate.png",
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
    image: "/img/imgsmall-1.png",
    slug: "lorem-ipsum-1",
  },
  {
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    image: "/img/imgsmall-2.png",
    slug: "lorem-ipsum-2",
  },
  {
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    image: "/img/imgsmall-3.png",
    slug: "lorem-ipsum-3",
  },
  {
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    image: "/img/imgsmall-4.png",
    slug: "lorem-ipsum-4",
  },
];

export default function DetailPrivateTrip() {
  const searchParams = useSearchParams();
  const packageId = searchParams.get("id") || "explore-waerebo"; // Default ke "explore-waerebo" jika id tidak ada
  console.log("Package ID:", packageId); // Log untuk memeriksa packageId

  const selectedPackage = privateTripData.find((pkg) => pkg.id === packageId);
  console.log("Selected Package Data:", selectedPackage); // Log untuk memeriksa data paket yang dipilih

  // Jika paket tidak ditemukan, tampilkan pesan error atau redirect
  if (!selectedPackage) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-gray-800">
          Paket Tidak Ditemukan
        </h1>
        <p className="text-gray-600">
          Mohon maaf, paket Private Trip yang Anda cari tidak ditemukan.
        </p>
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
      <DetailMoreTrip
        trips={morePrivateTrips.filter((trip) => trip.slug !== packageId)}
        tripType="private-trip"
      />

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
