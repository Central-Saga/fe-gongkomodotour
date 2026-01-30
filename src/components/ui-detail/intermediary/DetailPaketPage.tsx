// components/ui-detail/intermediary/DetailPaketPage.tsx
// Halaman terpadu untuk Detail Open Trip dan Private Trip.
// Fetch data, transform, lalu render DetailPaket + DetailReview, DetailMoreTrip, DetailBlog, DetailFAQ.
// Dibedakan via prop type: "open" | "private".
"use client";

import DetailPaket from "@/components/ui-detail/DetailPaket";
import type { DetailPackageData } from "@/components/ui-detail/DetailPaket";
import DetailFAQ from "@/components/ui-detail/ui-call/DetailFAQ";
import DetailReview from "@/components/ui-detail/ui-call/DetailReview";
import DetailMoreTrip from "@/components/ui-detail/ui-call/DetailMoreTrip";
import DetailBlog from "@/components/ui-detail/ui-call/DetailBlog";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { Trip } from "@/types/trips";
import { Boat } from "@/types/boats";
import { getImageUrl } from "@/lib/imageUrl";

interface ApiResponse {
  data: Trip;
}

interface SimilarTripsResponse {
  data: Trip[];
}

interface TripData {
  image: string;
  label: string;
  name: string;
  duration: string;
  priceIDR: string;
  slug: string;
}

interface BoatResponse {
  data: Boat[];
}

interface DetailPaketPageProps {
  type: "open" | "private";
}

function buildTransform(selectedPackage: Trip, boats: Boat[]): DetailPackageData {
  const firstAsset = selectedPackage.assets?.[0];
  const assetUrl = (a: { original_file_url?: string; file_url: string } | undefined) =>
    a?.original_file_url ? getImageUrl(a.original_file_url) : a?.file_url ? getImageUrl(a.file_url) : "/img/default-trip.jpg";

  const itinerary = selectedPackage.trip_durations?.map((d) => ({
    durationId: d.id,
    durationLabel: d.duration_label,
    days: (d.itineraries || []).map((it) => ({
      day: `Day ${it.day_number}`,
      activities: (it.activities || "").split("\n").filter((a) => a.trim()).join("<br>"),
    })),
  })) || [];

  const trip_durations = selectedPackage.trip_durations?.map((d) => ({
    id: d.id,
    duration_label: d.duration_label,
    itineraries: (d.itineraries || []).map((it) => ({
      day: `Day ${it.day_number}`,
      activities: (it.activities || "").split("\n").filter((a) => a.trim()).join("<br>"),
    })),
  })) || [];

  const additional_fees = (selectedPackage.additional_fees || [])
    .filter((f) => f.status === "Aktif" || !f.status)
    .map((f) => ({
      id: f.id,
      fee_category: f.fee_category,
      price: f.price,
      unit: f.unit,
      pax_min: f.pax_min,
      pax_max: f.pax_max,
    }));

  return {
    id: selectedPackage.id?.toString() || "",
    title: selectedPackage.name || "Nama Trip",
    price: (() => {
      const p = selectedPackage.trip_durations?.[0]?.trip_prices?.[0];
      if (!p) return "Harga belum tersedia";
      const type = (p as { price_type?: "fixed" | "by_request" }).price_type ?? "fixed";
      if (type === "by_request" || p.price_per_pax == null) return "By Request";
      const raw = Number(p.price_per_pax);
      const valueRupiah = raw >= 1000 ? Math.round(raw) : Math.round(raw * 1_000_000);
      return `IDR ${valueRupiah.toLocaleString("id-ID")}/pax`;
    })(),
    priceByRequest: (() => {
      const p = selectedPackage.trip_durations?.[0]?.trip_prices?.[0];
      if (!p) return false;
      const type = (p as { price_type?: "fixed" | "by_request" }).price_type ?? "fixed";
      return type === "by_request" || p.price_per_pax == null;
    })(),
    meetingPoint: selectedPackage.meeting_point || "Meeting point belum ditentukan",
    destination: selectedPackage.name || "Destinasi",
    daysTrip: selectedPackage.trip_durations?.[0]?.duration_label || "Custom Duration",
    description: selectedPackage.note || "Deskripsi belum tersedia",
    itinerary,
    trip_durations,
    information: selectedPackage.note || "Informasi belum tersedia",
    boat: "Speed Boat",
    images: selectedPackage.assets?.map((a) => assetUrl(a)) || [],
    destinations: selectedPackage.destination_count || 0,
    include: selectedPackage.include?.split("\n").filter((i) => i.trim()) || [],
    exclude: selectedPackage.exclude?.split("\n").filter((i) => i.trim()) || [],
    mainImage: firstAsset ? assetUrl(firstAsset) : "/img/default-trip.jpg",
    flightSchedules: selectedPackage.flight_schedules || [],
    has_boat: selectedPackage.has_boat || false,
    destination_count: selectedPackage.destination_count || 0,
    boat_ids: selectedPackage.boat_ids || [],
    operational_days: selectedPackage.operational_days || [],
    tentation: selectedPackage.tentation === "Yes" || selectedPackage.tentation === "No" ? selectedPackage.tentation : "No",
    flightInfo: {
      guideFee1:
        selectedPackage.additional_fees?.find((f) => f.fee_category === "Guide Fee" && f.unit === "per_day_guide")?.price?.toString() || "0",
      guideFee2: selectedPackage.additional_fees?.find((f) => f.fee_category === "Guide Fee" && f.unit === "per_5pax")?.price?.toString() || "0",
    },
    session: {
      highSeason: {
        period:
          selectedPackage.surcharges?.find((s) => s.season === "High Season")
            ? `${selectedPackage.surcharges.find((s) => s.season === "High Season")?.start_date} ~ ${selectedPackage.surcharges.find((s) => s.season === "High Season")?.end_date}`
            : "Not specified",
        price: selectedPackage.surcharges?.find((s) => s.season === "High Season")
          ? `IDR ${parseInt(selectedPackage.surcharges.find((s) => s.season === "High Season")?.surcharge_price?.toString() || "0").toLocaleString("id-ID")}/pax`
          : "Not specified",
      },
      peakSeason: {
        period:
          selectedPackage.surcharges?.find((s) => s.season === "Peak Season")
            ? `${selectedPackage.surcharges.find((s) => s.season === "Peak Season")?.start_date} ~ ${selectedPackage.surcharges.find((s) => s.season === "Peak Season")?.end_date}`
            : "Not specified",
        price: selectedPackage.surcharges?.find((s) => s.season === "Peak Season")
          ? `IDR ${parseInt(selectedPackage.surcharges.find((s) => s.season === "Peak Season")?.surcharge_price?.toString() || "0").toLocaleString("id-ID")}/pax`
          : "Not specified",
      },
    },
    boatImages: boats
      .filter((b) => selectedPackage.boat_ids?.includes(b.id))
      .map((b) => ({
        image: b.assets?.[0] ? (b.assets[0].original_file_url ? getImageUrl(b.assets[0].original_file_url) : getImageUrl(b.assets[0].file_url)) : "/img/default-trip.jpg",
        title: b.boat_name,
        id: b.id.toString(),
      })),
    note: selectedPackage.note,
    additional_fees: additional_fees.length ? additional_fees : undefined,
  };
}

export default function DetailPaketPage({ type }: DetailPaketPageProps) {
  const searchParams = useSearchParams();
  const packageId = searchParams.get("id");
  const [selectedPackage, setSelectedPackage] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [similarTrips, setSimilarTrips] = useState<TripData[]>([]);
  const [boats, setBoats] = useState<Boat[]>([]);

  useEffect(() => {
    const fetchTripDetails = async () => {
      if (!packageId) {
        setError("ID paket tidak ditemukan");
        setLoading(false);
        return;
      }
      try {
        const response = await apiRequest<ApiResponse>("GET", `/api/landing-page/trips/${packageId}`);
        if (!response?.data) throw new Error("Data trip tidak valid");
        setSelectedPackage(response.data);

        const similarResponse = await apiRequest<SimilarTripsResponse>("GET", `/api/landing-page/trips?status=1&type=${type}`);
        if (similarResponse?.data) {
          const list = similarResponse.data
            .filter((t: Trip) => t.id !== response.data.id)
            .slice(0, 3)
            .map((t: Trip) => {
              const a = t.assets?.[0];
              return {
                image: a?.original_file_url ? getImageUrl(a.original_file_url) : a?.file_url ? getImageUrl(a.file_url) : "/img/default-trip.jpg",
                label: t.type || (type === "open" ? "Open Trip" : "Private Trip"),
                name: t.name || "Trip Name",
                duration: t.trip_durations?.[0]?.duration_label || "Custom Duration",
                priceIDR: (() => {
                  const p = t.trip_durations?.[0]?.trip_prices?.[0];
                  if (!p) return "Price not available";
                  const type = (p as { price_type?: "fixed" | "by_request" }).price_type ?? "fixed";
                  if (type === "by_request" || p.price_per_pax == null) return "By Request";
                  const raw = Number(p.price_per_pax);
                  const valueRupiah = raw >= 1000 ? Math.round(raw) : Math.round(raw * 1_000_000);
                  return `IDR ${valueRupiah.toLocaleString("id-ID")}/pax`;
                })(),
                slug: t.id?.toString() || "",
              };
            });
          setSimilarTrips(list);
        }

        const boatsRes = await apiRequest<BoatResponse>("GET", "/api/landing-page/boats");
        if (boatsRes?.data) setBoats(boatsRes.data);
      } catch (e) {
        console.error("Error fetching trip details:", e);
        setError("Gagal memuat detail trip");
      } finally {
        setLoading(false);
      }
    };
    fetchTripDetails();
  }, [packageId, type]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold" />
      </div>
    );
  }

  if (error || !selectedPackage) {
    const label = type === "open" ? "Open Trip" : "Private Trip";
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-gray-800">{error || "Paket Tidak Ditemukan"}</h1>
        <p className="text-gray-600">Mohon maaf, paket {label} yang Anda cari tidak ditemukan.</p>
        <Link href="/">
          <button className="mt-4 bg-[#CFB53B] text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-[#7F6D1F] hover:scale-95 transition-all duration-300">
            Kembali ke Beranda
          </button>
        </Link>
      </div>
    );
  }

  const transformedData = buildTransform(selectedPackage, boats);
  const tripType = type === "open" ? "open-trip" : "private-trip";

  return (
    <div>
      <DetailPaket data={transformedData} type={type} />
      <DetailReview />
      <DetailMoreTrip trips={similarTrips} tripType={tripType} />
      <div className="px-4 py-12 md:flex md:space-x-6">
        <div className="md:w-1/2 mb-6 md:mb-0">
          <DetailBlog />
        </div>
        <div className="md:w-1/2">
          <DetailFAQ />
        </div>
      </div>
    </div>
  );
}
