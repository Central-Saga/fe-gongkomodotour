"use client";

import DetailPaketOpenTrip from "@/components/ui-detail/DetailPaketOpenTrip";
import DetailFAQ from "@/components/ui-detail/ui-call/DetailFAQ";
import DetailReview from "@/components/ui-detail/ui-call/DetailReview";
import DetailMoreTrip from "@/components/ui-detail/ui-call/DetailMoreTrip";
import DetailBlog from "@/components/ui-detail/ui-call/DetailBlog";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { Trip, FlightSchedule } from "@/types/trips";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ApiResponse {
  data: Trip;
}

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
  boatImages?: { image: string; title: string }[];
  mainImage?: string;
  flightSchedules?: FlightSchedule[];
}

export default function DetailOpenTrip() {
  const searchParams = useSearchParams();
  const packageId = searchParams.get("id");
  const [selectedPackage, setSelectedPackage] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTripDetails = async () => {
      if (!packageId) {
        setError("ID paket tidak ditemukan");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching trip details for ID:", packageId);
        const response = await apiRequest<ApiResponse>('GET', `/api/landing-page/trips/${packageId}`);
        console.log("API Response:", response);
        
        if (!response?.data) {
          throw new Error("Data trip tidak valid");
        }
        
        setSelectedPackage(response.data);
      } catch (error) {
        console.error('Error fetching trip details:', error);
        setError("Gagal memuat detail trip");
      } finally {
        setLoading(false);
      }
    };

    fetchTripDetails();
  }, [packageId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (error || !selectedPackage) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-gray-800">
          {error || "Paket Tidak Ditemukan"}
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

  // Transform data dari API ke format yang diharapkan oleh komponen
  const transformedData: PackageData = {
    id: selectedPackage.id?.toString() || "",
    title: selectedPackage.name || "Nama Trip",
    price: selectedPackage.trip_durations?.[0]?.trip_prices?.[0]?.price_per_pax 
      ? `IDR ${parseInt(selectedPackage.trip_durations[0].trip_prices[0].price_per_pax).toLocaleString('id-ID')}/pax`
      : "Harga belum tersedia",
    meetingPoint: selectedPackage.meeting_point || "Meeting point belum ditentukan",
    destination: selectedPackage.name || "Destinasi",
    daysTrip: selectedPackage.trip_durations?.[0]?.duration_label || "Custom Duration",
    description: selectedPackage.note || "Deskripsi belum tersedia",
    itinerary: selectedPackage.itineraries?.map(itinerary => ({
      day: `Day ${itinerary.day_number}`,
      activities: itinerary.activities.split('\n').filter(activity => activity.trim())
    })) || [],
    information: selectedPackage.note || "Informasi belum tersedia",
    boat: "Speed Boat", // Sesuaikan dengan data yang ada
    groupSize: "10-15 people", // Sesuaikan dengan data yang ada
    images: selectedPackage.assets?.map(asset => `${API_URL}${asset.file_url}`) || [],
    destinations: selectedPackage.itineraries?.length || 0,
    include: selectedPackage.include?.split('\n').filter(item => item.trim()) || [],
    exclude: selectedPackage.exclude?.split('\n').filter(item => item.trim()) || [],
    mainImage: selectedPackage.assets?.[0]?.file_url 
      ? `${API_URL}${selectedPackage.assets[0].file_url}`
      : "/img/default-image.png",
    flightSchedules: selectedPackage.flight_schedules || [],
    flightInfo: {
      guideFee1: selectedPackage.additional_fees?.find(fee => 
        fee.fee_category === "Guide Fee" && fee.unit === "per_day_guide"
      )?.price?.toString() || "0",
      guideFee2: selectedPackage.additional_fees?.find(fee => 
        fee.fee_category === "Guide Fee" && fee.unit === "per_5pax"
      )?.price?.toString() || "0"
    },
    session: {
      highSeason: {
        period: selectedPackage.surcharges?.find(s => s.season === "High Season") 
          ? `${selectedPackage.surcharges.find(s => s.season === "High Season")?.start_date} ~ ${selectedPackage.surcharges.find(s => s.season === "High Season")?.end_date}`
          : "Not specified",
        price: selectedPackage.surcharges?.find(s => s.season === "High Season") 
          ? `IDR ${parseInt(selectedPackage.surcharges.find(s => s.season === "High Season")?.surcharge_price?.toString() || "0").toLocaleString('id-ID')}/pax`
          : "Not specified"
      },
      peakSeason: {
        period: selectedPackage.surcharges?.find(s => s.season === "Peak Season") 
          ? `${selectedPackage.surcharges.find(s => s.season === "Peak Season")?.start_date} ~ ${selectedPackage.surcharges.find(s => s.season === "Peak Season")?.end_date}`
          : "Not specified",
        price: selectedPackage.surcharges?.find(s => s.season === "Peak Season") 
          ? `IDR ${parseInt(selectedPackage.surcharges.find(s => s.season === "Peak Season")?.surcharge_price?.toString() || "0").toLocaleString('id-ID')}/pax`
          : "Not specified"
      }
    }
  };

  return (
    <div>
      {/* Detail Paket */}
      <DetailPaketOpenTrip data={transformedData} />

      {/* Review Section */}
      <DetailReview reviews={[]} />

      {/* More Open Trip Section */}
      <DetailMoreTrip
        trips={[]}
        tripType="open-trip"
      />

      {/* Section Latest Post dan FAQ */}
      <div className="px-4 py-12 md:flex md:space-x-6">
        {/* Latest Post */}
        <div className="md:w-1/2 mb-6 md:mb-0">
          <DetailBlog posts={[]} />
        </div>
        {/* FAQ */}
        <div className="md:w-1/2">
          <DetailFAQ faqs={[]} />
        </div>
      </div>
    </div>
  );
}
