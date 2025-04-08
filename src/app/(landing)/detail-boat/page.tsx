"use client";

import { useSearchParams } from "next/navigation";
import DetailBoat from "@/components/ui-detail/boat/DetailBoat";

const DetailBoatPage = () => {
  const searchParams = useSearchParams();
  const mainImage = searchParams.get("mainImage") || "/img/default-image.png";

  const boatImages = [
    { image: "/img/boat/boat-dlx-lmb2.jpg", title: "Royal Suite Cabin" },
    { image: "/img/boat/boat-dlx-mv.jpg", title: "Deluxe Cabin" },
    { image: "/img/boat/boat-zm.jpg", title: "Superior Cabin" },
    { image: "/img/boat/boat-zn-phinisi.jpg", title: "Signature Cabin" },
    { image: "/img/boat/boat-alf.jpg", title: "Luxury Cabin" },
    { image: "/img/boat/bg-luxury.jpg", title: "Premium Cabin" },
  ];

  return (
    <div className="max-w-8xl mx-auto px-4">
      <DetailBoat boatImages={boatImages} />
    </div>
  );
};

export default DetailBoatPage;
