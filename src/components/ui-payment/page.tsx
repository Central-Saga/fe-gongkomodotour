"use client";

import { paymentDummy } from "@/data/paymentDummy";
import Image from "next/image";
import { FaUpload, FaCopy, FaCalendarAlt } from "react-icons/fa";
import { MdOutlineDescription } from "react-icons/md"; // Import icon untuk deskripsi
import { useState } from "react";

interface PaymentProps {
  packageId: string | null;
  packageType: string | null;
  date: string | null;
  tripCount: string | null;
}

export default function Payment({
  packageId,
  packageType,
  date,
  tripCount,
}: PaymentProps) {
  const [isUploaded, setIsUploaded] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Nomor rekening berhasil disalin!");
  };

  const handleUpload = () => {
    // Simulasi upload bukti pembayaran
    setIsUploaded(true);
    alert("Bukti pembayaran berhasil diupload!");
  };

  // Dummy data for booking details
  const bookingDetails = [
    {
      description: "Stunning Flores Overland (3 Day 2 Night)",
      price: "IDR 4.200.000",
    },
    {
      description: "Bintang Flores (Double Occupancy)",
      price: "IDR 4.200.000",
    },
    {
      description: "Entrance Fee Taman Nasional Komodo",
      price: "IDR 4.200.000",
    },
    { description: "Additional Charge", price: "IDR 1.000.000" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex justify-center p-8">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-7xl relative">
        <h1 className="text-3xl font-bold text-center mb-6">Order Summary</h1>
        <div className="flex justify-between">
          {/* Left Section: Details */}
          <div className="w-1/2 pr-6">
            <h2 className="text-lg font-bold mb-5">DETAILS</h2>
            <div className="flex items-center mb-4">
              <div className="text-gray-500 text-2xl mr-4">
                {/* No icon for Booking Code */}
              </div>
              <p className="font-bold">
                Booking Code: {paymentDummy.bookingCode}
              </p>
            </div>
            <div className="flex items-center mb-4">
              <MdOutlineDescription className="text-[#343232] text-2xl mr-4" />
              <div>
                <p className="font-semibold">Deskripsi</p>
                <p>{paymentDummy.packageTitle}</p>
              </div>
            </div>
            <div className="flex items-center mb-4">
              <FaCalendarAlt className="text-[#343232] text-2xl mr-4" />
              <div>
                <p className="font-semibold">Date</p>
                <p>Bayar sebelum {new Date(date || "").toLocaleString()}</p>
              </div>
            </div>
            <hr className="my-4 border-gray-300" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookingDetails.map((item, index) => (
                <div key={index}>
                  <p>{item.description}</p>
                  <p>{`1 x ${item.price}`}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <p className="font-semibold text-right mr-4">Sub Total</p>
              <p className="text-gray-600">IDR 13.600.000</p>
            </div>
            <hr className="my-4 border-gray-300" />
            <p className="font-bold text-lg">Jumlah Total: IDR 13.600.000</p>
          </div>

          {/* Right Section: Payment Method */}
          <div className="w-1/2 pl-6">
            <h2 className="text-lg font-bold">PAYMENT METHOD</h2>
            <hr className="my-2 border-gray-300" />
            {paymentDummy.paymentMethods.map((method, index) => (
              <div
                className="mt-4 flex items-center justify-between"
                key={index}
              >
                <div className="flex items-center">
                  <Image
                    src={method.logo}
                    alt={method.bank}
                    width={300}
                    height={300}
                    className="mr-4"
                  />
                  <div>
                    <p className="font-medium">{method.accountName}</p>
                    <div className="flex items-center">
                      <p className="text-xl font-bold mr-2">
                        {method.accountNumber}
                      </p>
                      <button
                        onClick={() => handleCopy(method.accountNumber)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <FaCopy />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={handleUpload}
              className="mt-6 w-full bg-yellow-400 text-white py-4 rounded-lg font-bold text-xl flex items-center justify-center"
            >
              <FaUpload className="mr-2" />
              Upload Bukti Pembayaran
            </button>
          </div>
        </div>

        {/* Next Button */}
        <button
          className={`absolute bottom-6 right-6 py-4 px-8 rounded-lg font-bold text-xl ${
            isUploaded
              ? "bg-green-500 text-white cursor-pointer"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          disabled={!isUploaded}
        >
          Next
        </button>
      </div>
    </div>
  );
}
