// app/(landing)/detail-paket/private-trip/page.tsx
"use client";

import DetailPrivateTrip from "@/components/ui-detail/intermediary/DetailPrivateTrip";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function DetailPrivateTripContent() {
  const searchParams = useSearchParams();
  const packageId = searchParams.get("id");
  return <DetailPrivateTrip packageId={packageId} />;
}

export default function PrivateTripPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DetailPrivateTripContent />
    </Suspense>
  );
}
