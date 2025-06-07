"use client";

import { useSearchParams } from "next/navigation";
import Payment from "@/components/ui-payment/page";
import { Suspense } from "react";

function PaymentContent() {
  const searchParams = useSearchParams();
  const packageId = searchParams.get("packageId");
  const packageType = searchParams.get("type");
  const date = searchParams.get("date");
  const tripCount = searchParams.get("tripCount");
  const bookingId = searchParams.get("bookingId");

  return (
    <Payment
      bookingId={bookingId}
      packageId={packageId}
      packageType={packageType}
      date={date}
      tripCount={tripCount}
    />
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
