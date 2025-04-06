"use client";

import DetailPaketOpenTrip from "@/components/ui-detail/DetailPaketOpenTrip";
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
  mainImage?: string; // Tambahkan properti ini
}

const openTripData: PackageData[] = [
  {
    id: "explore-waerebo",
    title: "Explore Waerebo",
    price: "IDR 2.500.000/pax",
    meetingPoint: "Ruteng",
    destination: "Waerebo Village",
    daysTrip: "3D/2N",
    description: "Discover the traditional Waerebo Village.",
    mainImage: "/img/waerebovillage.png", // Sesuaikan mainImage
    images: [
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
    itinerary: [
      { day: "Day 1", activities: ["Arrival in Ende and hotel check-in"] },
      { day: "Day 2", activities: ["Visit Kelimutu National Park"] },
      { day: "Day 3", activities: ["Explore traditional villages"] },
      { day: "Day 4", activities: ["Scenic drive to Bajawa"] },
      { day: "Day 5", activities: ["Return to Ende and departure"] },
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
    destinations: 1,
    boatImages: [
      { image: "/img/boat/boat-alf.jpg", title: "Luxury Boat 1" },
      { image: "/img/boat/boat-alf.jpg", title: "Luxury Boat 2" },
      { image: "/img/boat/boat-alf.jpg", title: "Luxury Boat 3" },
      { image: "/img/boat/boat-alf.jpg", title: "Luxury Boat 4" },
      { image: "/img/boat/boat-alf.jpg", title: "Luxury Boat 5" },
      { image: "/img/boat/boat-alf.jpg", title: "Luxury Boat 6" },
    ],
  },
  {
    id: "sailing-komodo-tour",
    title: "Sailing Komodo Tour",
    price: "IDR 14.500.000/pax",
    meetingPoint: "Labuan Bajo",
    destination: "Komodo National Park",
    daysTrip: "3D/2N",
    description: "Sail through the Komodo National Park.",
    mainImage: "/img/opentripkomodo.png", // Sesuaikan mainImage
    images: [
      "/img/opentripkomodo.png",
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
    itinerary: [
      { day: "Day 1", activities: ["Arrival in Ende and hotel check-in"] },
      { day: "Day 2", activities: ["Visit Kelimutu National Park"] },
      { day: "Day 3", activities: ["Explore traditional villages"] },
      { day: "Day 4", activities: ["Scenic drive to Bajawa"] },
      { day: "Day 5", activities: ["Return to Ende and departure"] },
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
    destinations: 4,
    boatImages: [
      { image: "/img/boat/boat-alf.jpg", title: "Luxury Boat 1" },
      { image: "/img/boat/boat-alf.jpg", title: "Luxury Boat 2" },
      { image: "/img/boat/boat-alf.jpg", title: "Luxury Boat 3" },
      { image: "/img/boat/boat-alf.jpg", title: "Luxury Boat 4" },
      { image: "/img/boat/boat-alf.jpg", title: "Luxury Boat 5" },
      { image: "/img/boat/boat-alf.jpg", title: "Luxury Boat 6" },
    ],
  },
  {
    id: "full-day-trip-by-speed-boat", // Pastikan id ini sesuai dengan data di TripHighlight
    title: "Full Day Trip - By Speed Boat",
    price: "IDR 14.500.000/pax",
    meetingPoint: "Labuan Bajo",
    destination: "Komodo National Park",
    daysTrip: "1D",
    description: "Experience a full day of adventure by speed boat.",
    mainImage: "/img/kelorisland.png", // Sesuaikan mainImage
    images: [
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
    itinerary: [
      {
        day: "3D2N",
        activities: [
          "10:00 AM: Departure from Labuan Bajo, visit Kelor Island",
          "12:00 PM: Snorkeling and trekking at Kelor Island",
          "02:00 PM: Visit Manjarite Island for snorkeling",
          "04:00 PM: Visit Kalong Island to see bats at sunset",
          "07:00 PM: Dinner and overnight on the boat",
        ],
      },
      {
        day: "2D1N",
        activities: [
          "07:00 AM: Breakfast on the boat",
          "08:00 AM: Trekking at Padar Island",
          "10:00 AM: Snorkeling at Long Pink Beach",
          "12:00 PM: Lunch on the boat",
          "01:00 PM: Visit Komodo Island to see Komodo dragons",
          "03:00 PM: Snorkeling at Manta Point",
          "05:00 PM: Dinner and overnight on the boat",
        ],
      },
      {
        day: "3D3N",
        activities: [
          "07:00 AM: Breakfast on the boat",
          "08:00 AM: Snorkeling at Kanawa Island",
          "10:00 AM: Return to Labuan Bajo",
          "12:30 PM: End of the trip",
        ],
      },
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
    destinations: 3,
    boatImages: [
      { image: "/img/boat/boat-alf.jpg", title: "Luxury Boat 1" },
      { image: "/img/boat/boat-alf.jpg", title: "Luxury Boat 2" },
      { image: "/img/boat/boat-alf.jpg", title: "Luxury Boat 3" },
      { image: "/img/boat/boat-alf.jpg", title: "Luxury Boat 4" },
      { image: "/img/boat/boat-alf.jpg", title: "Luxury Boat 5" },
      { image: "/img/boat/boat-alf.jpg", title: "Luxury Boat 6" },
    ],
  },
  {
    id: "sunset-trip-by-speed-boat",
    title: "Sunset Trip - By Speed Boat",
    price: "IDR 12.000.000/pax",
    meetingPoint: "Labuan Bajo",
    destination: "Komodo National Park",
    daysTrip: "1D",
    description: "Enjoy a sunset trip by speed boat.",
    mainImage: "/img/kelelawarisland.png", // Sesuaikan mainImage
    images: [
      "/img/kelelawarisland.png",
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
    itinerary: [
      { day: "Day 1", activities: ["Arrival in Ende and hotel check-in"] },
      { day: "Day 2", activities: ["Visit Kelimutu National Park"] },
      { day: "Day 3", activities: ["Explore traditional villages"] },
      { day: "Day 4", activities: ["Scenic drive to Bajawa"] },
      { day: "Day 5", activities: ["Return to Ende and departure"] },
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
    destinations: 3,
    boatImages: [
      { image: "/img/boat/boat-alf.jpg", title: "Luxury Boat 1" },
      { image: "/img/boat/boat-alf.jpg", title: "Luxury Boat 2" },
      { image: "/img/boat/boat-alf.jpg", title: "Luxury Boat 3" },
      { image: "/img/boat/boat-alf.jpg", title: "Luxury Boat 4" },
      { image: "/img/boat/boat-alf.jpg", title: "Luxury Boat 5" },
      { image: "/img/boat/boat-alf.jpg", title: "Luxury Boat 6" },
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

export default function DetailOpenTrip() {
  const searchParams = useSearchParams();
  const packageId = searchParams.get("id");
  console.log("Package ID:", packageId); // Log untuk memeriksa packageId

  const selectedPackage = openTripData.find((pkg) => pkg.id === packageId);
  console.log("Selected Package Data:", selectedPackage); // Log untuk memeriksa data paket yang dipilih

  // Jika paket tidak ditemukan, tampilkan pesan error atau redirect
  if (!selectedPackage) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-gray-800">
          Paket Tidak Ditemukan
        </h1>
        <p className="text-gray-600">
          Mohon maaf, paket Open Trip yang Anda cari tidak ditemukan.
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
      <DetailPaketOpenTrip data={selectedPackage} />

      {/* Review Section */}
      <DetailReview reviews={reviews} />

      {/* More Open Trip Section */}
      <DetailMoreTrip
        trips={moreOpenTrips.filter((trip) => trip.slug !== packageId)}
        tripType="open-trip"
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
