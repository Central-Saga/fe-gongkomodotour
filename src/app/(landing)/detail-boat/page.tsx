"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { Boat } from "@/types/boats";
import DetailBoat from "@/components/ui-detail/boat/DetailBoat";
import Link from "next/link";
import { Suspense } from "react";

interface BoatResponse {
  data: Boat;
}

function DetailBoatContent() {
  const searchParams = useSearchParams();
  const boatId = searchParams.get("id");
  const [boat, setBoat] = useState<Boat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBoatDetails = async () => {
      if (!boatId) {
        setError("ID boat tidak ditemukan");
        setLoading(false);
        return;
      }

      try {
        const response = await apiRequest<BoatResponse>(
          "GET",
          `/api/landing-page/boats/${boatId}`
        );
        
        if (!response?.data) {
          throw new Error("Data boat tidak valid");
        }
        
        setBoat(response.data);
      } catch (error) {
        console.error("Error fetching boat details:", error);
        setError("Gagal memuat detail boat");
      } finally {
        setLoading(false);
      }
    };

    fetchBoatDetails();
  }, [boatId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (error || !boat) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-gray-800">
          {error || "Boat Tidak Ditemukan"}
        </h1>
        <p className="text-gray-600">
          Mohon maaf, boat yang Anda cari tidak ditemukan.
        </p>
        <Link href="/">
          <button className="mt-4 bg-[#CFB53B] text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-[#7F6D1F] hover:scale-95 transition-all duration-300">
            Kembali ke Beranda
          </button>
        </Link>
      </div>
    );
  }

  return <DetailBoat boat={boat} />;
}

export default function DetailBoatPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DetailBoatContent />
    </Suspense>
  );
}
