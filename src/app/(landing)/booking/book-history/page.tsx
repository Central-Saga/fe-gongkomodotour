import BookHistory from "@/components/ui-booking/book-history/BookHistory";

export default function BookHistoryPage() {
  // Dummy data for demonstration
  const bookingData = {
    bookingCode: "#SF1250415JSJK",
    packageTitle: "Stunning Flores Overland",
    date: "29 Februari 2025",
    surcharge: "Bukan High Peak Season - IDR 200.000",
    duration: "Stunning Flores Overland (3 Day 2 Night) - IDR 4.200.000",
    hotel: "Bintang Flores (Double Occupancy) - IDR 4.200.000",
    additionalCharge: "Entrance Fee Taman Nasional Komodo - IDR 4.200.000",
    totalPrice: "IDR 10.000.000/Pax",
    image: "/img/waerebovillage.png", // Gambar sesuai booking
    tripType: "Private Trip", // Label trip
  };

  return <BookHistory bookingData={bookingData} />;
}
