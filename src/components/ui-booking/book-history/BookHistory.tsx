"use client";

import Image from "next/image";

interface BookingData {
  bookingCode: string;
  packageTitle: string;
  date: string;
  surcharge: string;
  duration: string;
  hotel: string;
  additionalCharge: string;
  totalPrice: string;
  image: string;
  tripType: string;
}

export default function BookHistory({
  bookingData,
}: {
  bookingData: BookingData;
}) {
  return (
    <div className="min-h-screen bg-[#f5f5f5] flex justify-center p-8">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-9xl">
        <h1 className="text-3xl font-bold text-center mb-6">Book History</h1>
        <div className="border rounded-lg p-6 flex flex-col space-y-4 relative shadow-lg bg-[#fdfdfd]">
          {/* Gambar dan Label */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Image
                src={bookingData.image}
                alt="Package Image"
                width={120}
                height={120}
                className="rounded-lg"
              />
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                {bookingData.tripType}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold">{bookingData.packageTitle}</h2>
              <p className="text-sm text-gray-500">
                Booking Code: {bookingData.bookingCode}
              </p>
            </div>
          </div>

          {/* Tanggal di Kanan Atas */}
          <div className="absolute top-6 right-6 text-sm text-gray-500">
            {bookingData.date}
          </div>

          {/* Detail Booking */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">Surcharge</p>
              <p>{bookingData.surcharge}</p>
            </div>
            <div>
              <p className="font-semibold">Duration</p>
              <p>{bookingData.duration}</p>
            </div>
            <div>
              <p className="font-semibold">Hotel</p>
              <p>{bookingData.hotel}</p>
            </div>
            <div>
              <p className="font-semibold">Additional Charge</p>
              <p>{bookingData.additionalCharge}</p>
            </div>
          </div>

          {/* Penanda Verifikasi dan Harga */}
          <div className="flex justify-between items-center mt-4">
            <p className="text-red-500 font-semibold">Belum Terverifikasi</p>
            <div className="text-right">
              <p className="font-bold text-lg">Total Harga</p>
              <p className="text-xl font-bold">{bookingData.totalPrice}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
