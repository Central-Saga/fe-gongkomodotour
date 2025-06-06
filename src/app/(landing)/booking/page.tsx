"use client";

import Booking from "@/components/ui-booking/Booking";
import { Suspense } from "react";

function BookingContent() {
  return <Booking />;
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingContent />
    </Suspense>
  );
}
