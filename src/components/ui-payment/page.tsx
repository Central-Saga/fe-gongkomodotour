"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  region: string;
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
  surcharges: Surcharge[];
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
  booking_total_price?: string;
  booking_total_pax?: number;
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

interface Surcharge {
  id: number;
  trip_id: number;
  surcharge_price: string;
  start_date: string;
  end_date: string;
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
  customer_country?: string;
  cabins?: CabinBooking[];
}

interface CabinBooking {
  cabin_id: number;
  total_pax: number;
  total_price: number;
}

export default function Payment({
  bookingId,
}: PaymentProps) {
  const [isUploaded, setIsUploaded] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Ambil tanggal perjalanan dari query param jika ada
  const tripStartDateParam = searchParams.get('date');

  useEffect(() => {
    const fetchBookingData = async () => {
      if (!bookingId) return;
      
      try {
        const response = await apiRequest<{ data: BookingData }>(
          'GET',
          `/api/landing-page/bookings/${bookingId}`
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

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentProof(file);
      setIsUploaded(true);
      alert("Bukti pembayaran berhasil diupload!");
    }
  };

  const getRegionFromCountry = (country: string | undefined) => {
    if (!country || country === 'ID') return 'domestic';
    return 'overseas';
  };

  const calculateBasePrice = () => {
    if (!bookingData) return 0;
    const prices = bookingData.trip_duration.trip_prices;
    const region = getRegionFromCountry(bookingData.customer_country);
    const price = prices.find(p =>
      bookingData.total_pax >= p.pax_min &&
      bookingData.total_pax <= p.pax_max &&
      (p.region === 'Domestic & Overseas' ||
       (region === 'domestic' && p.region === 'Domestic') ||
       (region === 'overseas' && p.region === 'Overseas'))
    );
    return price ? Number(price.price_per_pax) : 0;
  };

  const calculateBasePriceTotal = () => {
    const basePrice = calculateBasePrice();
    const total = basePrice * (bookingData?.total_pax || 0);
    
    console.log('Payment Base Price Calculation:', {
      basePrice,
      totalPax: bookingData?.total_pax,
      total
    });
    
    return total;
  };

  // Fungsi untuk menormalkan tanggal ke jam 00:00:00
  const normalizeDate = (date: string | Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // Fungsi untuk mendapatkan array tanggal perjalanan
  const getTripDates = () => {
    if (!bookingData) return [];
    const startDateStr = tripStartDateParam || bookingData.trip?.start_time || bookingData.created_at;
    const days = bookingData.trip_duration?.duration_days || 0;
    if (!startDateStr || !days) return [];
    const startDate = normalizeDate(startDateStr);
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      d.setHours(0, 0, 0, 0);
      return d;
    });
  };

  // Perhitungan surcharge berdasarkan tanggal perjalanan
  const calculateSurcharge = () => {
    console.log('DEBUG bookingData:', bookingData);
    if (!bookingData?.trip?.surcharges) {
      console.log('DEBUG: Tidak ada surcharges di trip');
      return 0;
    }
    const tripDates = getTripDates();
    console.log('DEBUG tripDates:', tripDates);
    let surchargeAmount = 0;
    bookingData.trip.surcharges.forEach(surcharge => {
      const start = normalizeDate(surcharge.start_date);
      const end = normalizeDate(surcharge.end_date);
      console.log('DEBUG surcharge period:', start, end, 'price:', surcharge.surcharge_price);
      const isInSurchargePeriod = tripDates.some(date => date >= start && date <= end);
      if (isInSurchargePeriod) {
        surchargeAmount = Number(surcharge.surcharge_price);
      }
    });
    return surchargeAmount * (bookingData.total_pax || 1);
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
                return (
                  <div key={index}>
                    <p>{cabin.cabin_name} ({cabin.bed_type})</p>
                    <p>{cabin.max_pax} pax</p>
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

              {/* Surcharge Details */}
              <div>
                <p>Surcharge (High Peak Season)</p>
                <p>
                  IDR {(bookingData && bookingData.total_pax ? (calculateSurcharge() / bookingData.total_pax) : 0).toLocaleString('id-ID')}/pax x {bookingData?.total_pax} pax = IDR {calculateSurcharge().toLocaleString('id-ID')}
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <p className="font-semibold text-right mr-4">Sub Total</p>
              <p className="text-gray-600">IDR {Number(bookingData?.total_price || 0).toLocaleString('id-ID')}</p>
            </div>
            <hr className="my-4 border-gray-300" />
            <p className="font-bold text-lg">Jumlah Total: IDR {Number(bookingData?.total_price || 0).toLocaleString('id-ID')}</p>
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
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="image/*,application/pdf"
              onChange={handleFileChange}
            />
            <button
              onClick={handleUploadClick}
              className="mt-6 w-full bg-gold text-white py-4 rounded-lg font-bold text-xl flex items-center justify-center"
            >
              <FaUpload className="mr-2" />
              Upload Bukti Pembayaran
            </button>
            {paymentProof && (
              <div className="mt-2 text-green-600 text-sm">
                File terpilih: {paymentProof.name}
              </div>
            )}
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
