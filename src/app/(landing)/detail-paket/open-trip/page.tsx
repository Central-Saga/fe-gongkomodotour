// app/(landing)/detail-paket/open-trip/page.tsx
"use client";

import DetailOpenTrip from "@/components/ui-detail/intermediary/DetailOpenTrip";
import { Suspense } from "react";

function DetailOpenTripContent() {
  return <DetailOpenTrip />;
}

export default function OpenTripPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DetailOpenTripContent />
    </Suspense>
  );
}
