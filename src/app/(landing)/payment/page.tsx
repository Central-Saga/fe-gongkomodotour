"use client";

import { useSearchParams } from "next/navigation";
import Payment from "@/components/ui-payment/page";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const packageId = searchParams.get("packageId");
  const packageType = searchParams.get("type");
  const date = searchParams.get("date");
  const tripCount = searchParams.get("tripCount");
  const bookingId = searchParams.get("bookingId");

  return (
    <Payment
      packageId={packageId}
      packageType={packageType}
      date={date}
      tripCount={tripCount}
      bookingId={bookingId}
    />
  );
}
