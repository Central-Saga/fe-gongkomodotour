// app/(landing)/detail-paket/private-trip/page.tsx
"use client";

import DetailPrivateTrip from "@/components/ui-detail/intermediary/DetailPrivateTrip";
import { Suspense } from "react";

function DetailPrivateTripContent() {
  return <DetailPrivateTrip />;
}

export default function PrivateTripPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DetailPrivateTripContent />
    </Suspense>
  );
}
