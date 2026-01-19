// app/(landing)/detail-paket/open-trip/page.tsx
"use client";

import DetailPaketPage from "@/components/ui-detail/intermediary/DetailPaketPage";
import { Suspense } from "react";

function DetailOpenTripContent() {
  return <DetailPaketPage type="open" />;
}

export default function OpenTripPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DetailOpenTripContent />
    </Suspense>
  );
}
