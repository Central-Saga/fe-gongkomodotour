"use client";

import DetailBoat from "@/components/ui-detail/boat/DetailBoat";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { Boat } from "@/types/boats";

interface BoatResponse {
  data: Boat[];
  message?: string;
  status?: string;
}

const DetailBoatPage = () => {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBoats = async () => {
      try {
        setLoading(true);
        const response = await apiRequest<BoatResponse>('GET', '/api/boats');
        if (response.data) {
          setBoats(response.data);
        }
      } catch (err) {
        console.error("Error fetching boats:", err);
        setError("Gagal mengambil data kapal");
      } finally {
        setLoading(false);
      }
    };

    fetchBoats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-gray-800">Error</h1>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  // Transform data boat ke format yang diharapkan oleh DetailBoat
  const boatImages = boats.flatMap(boat => 
    boat.assets.map(asset => ({
      image: asset.file_url.startsWith('http') 
        ? asset.file_url 
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${asset.file_url}`,
      title: asset.title || boat.boat_name
    }))
  );

  return (
    <div className="max-w-8xl mx-auto px-4">
      <DetailBoat boatImages={boatImages} />
    </div>
  );
};

export default DetailBoatPage;
