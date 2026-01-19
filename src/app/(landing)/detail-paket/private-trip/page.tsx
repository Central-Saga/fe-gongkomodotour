// app/(landing)/detail-paket/private-trip/page.tsx
"use client";

import DetailPaketPage from "@/components/ui-detail/intermediary/DetailPaketPage";
import { Suspense } from "react";

function DetailPrivateTripContent() {
  return <DetailPaketPage type="private" />;
}

export default function PrivateTripPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DetailPrivateTripContent />
    </Suspense>
  );
}
