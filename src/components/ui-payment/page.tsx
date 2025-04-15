"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaUpload, FaCopy, FaCalendarAlt } from "react-icons/fa";
import { MdOutlineDescription } from "react-icons/md";
import { apiRequest } from "@/lib/api";
import { paymentDummy } from "@/data/paymentDummy";

interface PaymentProps {
  bookingId: string | null;
}

interface TripPrice {
  id: number;
  trip_duration_id: number;
  pax_min: number;
  pax_max: number;
  price_per_pax: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface TripDuration {
  id: number;
  duration_label: string;
  duration_days: number;
  duration_nights: number;
  status: string;
  created_at: string;
  updated_at: string;
  trip_prices: TripPrice[];
}

interface Trip {
  id: number;
  name: string;
  include: string;
  exclude: string;
  note: string;
  region: string;
  start_time: string;
  end_time: string;
  meeting_point: string;
  type: string;
  status: string;
  is_highlight: string;
  destination_count: number;
  has_boat: boolean;
  created_at: string;
  updated_at: string;
}

interface Customer {
  id: number;
  user_id: number;
  alamat: string;
  no_hp: string;
  nasionality: string;
  region: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Boat {
  id: number;
  boat_name: string;
  spesification: string;
  cabin_information: string;
  facilities: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Cabin {
  id: number;
  boat_id: number;
  cabin_name: string;
  bed_type: string;
  min_pax: number;
  max_pax: number;
  base_price: string;
  additional_price: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface HotelOccupancy {
  id: number;
  hotel_name: string;
  hotel_type: string;
  occupancy: string;
  price: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface AdditionalFee {
  id: number;
  trip_id: number;
  fee_category: string;
  price: string;
  region: string;
  unit: string;
  pax_min: number;
  pax_max: number;
  day_type: string;
  is_required: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface BookingData {
  id: number;
  trip_id: number;
  trip_duration_id: number;
  customer_id: number;
  user_id: number;
  hotel_occupancy_id: number;
  total_price: string;
  total_pax: number;
  status: string;
  created_at: string;
  updated_at: string;
  trip: Trip;
  trip_duration: TripDuration;
  customer: Customer;
  boat: Boat[];
  cabin: Cabin[];
  user: User;
  hotel_occupancy: HotelOccupancy;
  additional_fees: AdditionalFee[];
}

export default function Payment({
  bookingId,
}: PaymentProps) {
  const [isUploaded, setIsUploaded] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchBookingData = async () => {
      if (!bookingId) return;
      
      try {
        const response = await apiRequest<{ data: BookingData }>(
          'GET',
          `/api/bookings/${bookingId}`
        );
        
        if (response.data) {
          setBookingData(response.data);
        }
      } catch (error) {
        console.error('Error fetching booking data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingData();
  }, [bookingId]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Nomor rekening berhasil disalin!");
  };

  const handleUpload = () => {
    // Simulasi upload bukti pembayaran
    setIsUploaded(true);
    alert("Bukti pembayaran berhasil diupload!");
  };

  const calculateBasePrice = () => {
    if (!bookingData) return 0;
    
    const price = bookingData.trip_duration.trip_prices.find(
      p => bookingData.total_pax >= p.pax_min && bookingData.total_pax <= p.pax_max
    );
    
    return price ? Number(price.price_per_pax) : 0;
  };

  const calculateBasePriceTotal = () => {
    if (!bookingData || !bookingData.total_pax) return 0;
    return calculateBasePrice() * bookingData.total_pax;
  };

  const calculateAdditionalFees = () => {
    if (!bookingData) return 0;
    
    return bookingData.additional_fees.reduce((total, fee) => {
      switch (fee.unit) {
        case 'per_pax':
          return total + (Number(fee.price) * bookingData.total_pax);
        case 'per_5pax':
          return total + (Number(fee.price) * Math.ceil(bookingData.total_pax / 5));
        case 'per_day':
          return total + (Number(fee.price) * bookingData.trip_duration.duration_days);
        case 'per_day_guide':
          return total + (Number(fee.price) * bookingData.trip_duration.duration_days);
        default:
          return total + Number(fee.price);
      }
    }, 0);
  };

  const calculateCabinPrice = (cabin: Cabin, pax: number) => {
    const basePrice = Number(cabin.base_price);
    const additionalPrice = Number(cabin.additional_price);
    const minPax = cabin.min_pax;
    
    if (pax <= minPax) {
      return basePrice;
    } else {
      const additionalPax = pax - minPax;
      return basePrice + (additionalPrice * additionalPax);
    }
  };

  const calculateTotalCabinPrice = () => {
    if (!bookingData?.cabin) return 0;
    
    return bookingData.cabin.reduce((total, cabin) => {
      return total + calculateCabinPrice(cabin, cabin.max_pax);
    }, 0);
  };

  const calculateHotelPrice = () => {
    if (!bookingData?.hotel_occupancy) return 0;
    
    return Number(bookingData.hotel_occupancy.price) * bookingData.trip_duration.duration_nights;
  };

  const calculateTotalPrice = () => {
    return calculateBasePriceTotal() + 
           calculateAdditionalFees() + 
           calculateTotalCabinPrice() + 
           calculateHotelPrice();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
                Booking Code: #{bookingData?.id.toString().padStart(6, '0')}
              </p>
            </div>
            <div className="flex items-center mb-4">
              <MdOutlineDescription className="text-[#343232] text-2xl mr-4" />
              <div>
                <p className="font-semibold">Deskripsi</p>
                <p>{bookingData?.trip.name}</p>
              </div>
            </div>
            <div className="flex items-center mb-4">
              <FaCalendarAlt className="text-[#343232] text-2xl mr-4" />
              <div>
                <p className="font-semibold">Date</p>
                <p>Bayar sebelum {new Date(bookingData?.created_at || "").toLocaleString()}</p>
              </div>
            </div>
            <hr className="my-4 border-gray-300" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Base Price */}
              <div>
                <p>{bookingData?.trip.type === "Open Trip" ? "Open Trip" : "Private Trip"}</p>
                <p>IDR {calculateBasePrice().toLocaleString('id-ID')}/pax x {bookingData?.total_pax} pax = IDR {calculateBasePriceTotal().toLocaleString('id-ID')}</p>
              </div>

              {/* Additional Fees */}
              {bookingData?.additional_fees.map((fee, index) => (
                <div key={index}>
                  <p>{fee.fee_category}</p>
                  <p>IDR {Number(fee.price).toLocaleString('id-ID')}{fee.unit === 'per_pax' ? '/pax' : ''}{fee.unit === 'per_5pax' ? '/5 pax' : ''}{fee.unit === 'per_day' ? '/hari' : ''}{fee.unit === 'per_day_guide' ? '/hari' : ''}</p>
                </div>
              ))}

              {/* Cabin Details */}
              {bookingData?.cabin.map((cabin, index) => {
                const cabinPrice = calculateCabinPrice(cabin, cabin.max_pax);
                
                return (
                  <div key={index}>
                    <p>{cabin.cabin_name} ({cabin.bed_type})</p>
                    <p>{cabin.max_pax} pax = IDR {cabinPrice.toLocaleString('id-ID')}</p>
                  </div>
                );
              })}

              {/* Hotel Details */}
              {bookingData?.hotel_occupancy && (
                <div>
                  <p>{bookingData.hotel_occupancy.hotel_name} ({bookingData.hotel_occupancy.occupancy})</p>
                  <p>IDR {Number(bookingData.hotel_occupancy.price).toLocaleString('id-ID')}/malam x {bookingData.trip_duration.duration_nights} malam</p>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <p className="font-semibold text-right mr-4">Sub Total</p>
              <p className="text-gray-600">IDR {calculateTotalPrice().toLocaleString('id-ID')}</p>
            </div>
            <hr className="my-4 border-gray-300" />
            <p className="font-bold text-lg">Jumlah Total: IDR {calculateTotalPrice().toLocaleString('id-ID')}</p>
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
          onClick={() => {
            if (isUploaded) {
              router.push("/booking/book-history"); // Redirect to Book History page
            }
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
