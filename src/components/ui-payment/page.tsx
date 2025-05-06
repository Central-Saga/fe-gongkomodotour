"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { FaUpload, FaCopy, FaCalendarAlt } from "react-icons/fa";
import { MdOutlineDescription } from "react-icons/md";
import { apiRequest } from "@/lib/api";
import { paymentDummy } from "@/data/paymentDummy";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';

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
  is_hotel_requested?: number;
}

interface CabinBooking {
  cabin_id: number;
  total_pax: number;
  total_price: number;
}

// Tambahkan interface ekstensi untuk jsPDF
interface JsPdfWithAutoTable {
  lastAutoTable?: { finalY: number }
}

export default function Payment({
  bookingId,
}: PaymentProps) {
  const [isUploaded, setIsUploaded] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [hotelRequests, setHotelRequests] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isFinalized, setIsFinalized] = useState(false);

  // Ambil tanggal perjalanan dari query param jika ada
  const tripStartDateParam = searchParams.get('date');

  const HOTEL_OPTIONS = ['Ayana Komodo Resort', 'Meruorah Hotel'];

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
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setImagePreview(ev.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
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

  // Tambahkan fungsi handlePrintInvoice
  const handlePrintInvoice = () => {
    if (!bookingData) return;
    try {
      const doc = new jsPDF();
      const gold: [number, number, number] = [218, 165, 32];
      const left = 15;
      const right = 195;
      let y = 20;

      // Header
      doc.setFontSize(10);
      doc.text('Gong Komodo Tour', left, y);
      doc.setFontSize(22);
      doc.setTextColor(gold[0], gold[1], gold[2]);
      doc.text('INVOICE', right, y, { align: 'right' });
      y += 8;
      doc.setDrawColor(gold[0], gold[1], gold[2]);
      doc.setLineWidth(1);
      doc.line(left, y, right, y);
      y += 6;

      // Info Booking Box
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(left, y, right - left, 24, 3, 3, 'F');
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      let infoY = y + 7;
      doc.text(`Booking Code: #${bookingData.id.toString().padStart(6, '0')}`, left + 4, infoY);
      if (bookingData.customer?.user_id) {
        doc.text(`Customer: ${bookingData.customer?.user_id ? bookingData.user?.name : '-'}`, left + 70, infoY);
      }
      infoY += 7;
      doc.text(`Trip: ${bookingData.trip.name}`, left + 4, infoY);
      doc.text(`Tanggal Booking: ${new Date(bookingData.created_at).toLocaleString('id-ID')}`, left + 70, infoY);
      y += 28;

      // Rincian Biaya Table
      doc.setFontSize(13);
      doc.setTextColor(gold[0], gold[1], gold[2]);
      doc.text('Rincian Biaya', left, y);
      y += 4;
      doc.setTextColor(0, 0, 0);

      // Siapkan data tabel
      const rows: [string, string][] = [];
      rows.push([
        bookingData.trip.type === 'Open Trip' ? 'Open Trip' : 'Private Trip',
        `IDR ${calculateBasePrice().toLocaleString('id-ID')}/pax x ${bookingData.total_pax} pax = IDR ${calculateBasePriceTotal().toLocaleString('id-ID')}`
      ]);
      bookingData.additional_fees.forEach(fee => {
        rows.push([
          fee.fee_category || '-',
          `IDR ${Number(fee.price).toLocaleString('id-ID')}` +
            (fee.unit === 'per_pax' ? '/pax' : '') +
            (fee.unit === 'per_5pax' ? '/5 pax' : '') +
            (fee.unit === 'per_day' ? '/hari' : '') +
            (fee.unit === 'per_day_guide' ? '/hari' : '')
        ]);
      });
      bookingData.cabin.forEach(cabin => {
        rows.push([
          `${cabin.cabin_name || '-'} (${cabin.bed_type || '-'})`,
          `${cabin.max_pax || 0} pax`
        ]);
      });
      if (bookingData.hotel_occupancy) {
        rows.push([
          `${bookingData.hotel_occupancy.hotel_name || '-'} (${bookingData.hotel_occupancy.occupancy || '-'})`,
          `IDR ${Number(bookingData.hotel_occupancy.price).toLocaleString('id-ID')}/malam x ${bookingData.trip_duration.duration_nights} malam`
        ]);
      }
      const surcharge = calculateSurcharge();
      if (surcharge > 0) {
        rows.push([
          'Surcharge (High Peak Season)',
          `IDR ${(surcharge / (bookingData.total_pax || 1)).toLocaleString('id-ID')}/pax x ${bookingData.total_pax} pax = IDR ${surcharge.toLocaleString('id-ID')}`
        ]);
      }

      // Tambahkan hotel request jika ada
      if (bookingData.is_hotel_requested === 1 && hotelRequests.length > 0) {
        rows.push(['Hotel Request', '']);
        hotelRequests.forEach(hotel => {
          rows.push([`- ${hotel}`, '']);
        });
      }

      // Pastikan rows tidak ada undefined/null
      const safeRows = rows.map(row => [row[0] || '-', row[1] || '-']);

      autoTable(doc, {
        startY: y + 4,
        head: [['Keterangan', 'Nominal']],
        body: safeRows,
        theme: 'grid',
        headStyles: { fillColor: gold, textColor: 255, fontStyle: 'bold' },
        bodyStyles: { textColor: 20 },
        styles: { fontSize: 11, cellPadding: 2 },
        columnStyles: { 1: { halign: 'right' } },
        margin: { left: left, right: 15 },
      });
      // Type guard untuk akses lastAutoTable
      let lastY = y + 8;
      const docWithTable = doc as JsPdfWithAutoTable;
      if (docWithTable.lastAutoTable && typeof docWithTable.lastAutoTable.finalY === 'number') {
        lastY = docWithTable.lastAutoTable.finalY + 8;
      }
      y = lastY;

      // Sub Total & Jumlah Total
      doc.setFontSize(13);
      doc.setTextColor(gold[0], gold[1], gold[2]);
      doc.text('Sub Total:', left, y);
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      doc.text(`IDR ${Number(bookingData.total_price || 0).toLocaleString('id-ID')}`, right, y, { align: 'right' });
      y += 9;
      doc.setFontSize(15);
      doc.setTextColor(gold[0], gold[1], gold[2]);
      doc.text('Jumlah Total:', left, y);
      doc.text(`IDR ${Number(bookingData.total_price || 0).toLocaleString('id-ID')}`, right, y, { align: 'right' });
      y += 15;

      // Footer
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, left, y);
      doc.save(`Invoice_Booking_${bookingData.id.toString().padStart(6, '0')}.pdf`);
      setIsFinalized(true);
    } catch (err) {
      alert('Gagal membuat PDF. Silakan coba lagi.');
      console.error('PDF Error:', err);
    }
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
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#f5f5f5] flex justify-center p-8"
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-7xl relative">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Section: Details */}
          <div className="w-full md:w-1/2 pr-0 md:pr-8">
            <h2 className="text-2xl md:text-3xl font-bold text-left mb-8 tracking-tight border-l-4 border-gold pl-4 text-gold">DETAILS</h2>
            <div className="mb-8">
              <div className="flex flex-col gap-2 mb-4">
                <span className="font-bold text-base md:text-lg text-gray-900">Booking Code: <span className="font-black text-black">#{bookingData?.id.toString().padStart(6, '0')}</span></span>
              </div>
              <div className="flex items-start gap-3 mb-2">
                <MdOutlineDescription className="text-gold text-xl mt-1" />
                <div>
                  <span className="font-semibold block leading-tight text-gray-900">Deskripsi</span>
                  <span className="text-black block">{bookingData?.trip.name}</span>
                </div>
              </div>
              <div className="flex items-start gap-3 mb-2">
                <FaCalendarAlt className="text-gold text-xl mt-1" />
                <div>
                  <span className="font-semibold block leading-tight text-gray-900">Date</span>
                  <span className="text-black block">Bayar sebelum {new Date(bookingData?.created_at || "").toLocaleString()}</span>
                </div>
              </div>
            </div>
            <hr className="my-6 border-gray-200" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
              {/* Base Price */}
              <div className="mb-2">
                <span className="font-semibold block mb-1 text-gray-900">{bookingData?.trip.type === "Open Trip" ? "Open Trip" : "Private Trip"}</span>
                <span className="text-black">IDR {calculateBasePrice().toLocaleString('id-ID')}/pax x {bookingData?.total_pax} pax = <b>IDR {calculateBasePriceTotal().toLocaleString('id-ID')}</b></span>
              </div>
              {/* Additional Fees */}
              {bookingData?.additional_fees.map((fee, index) => (
                <div key={index} className="mb-2">
                  <span className="font-semibold block mb-1 text-gray-900">{fee.fee_category}</span>
                  <span className="text-black">IDR {Number(fee.price).toLocaleString('id-ID')}{fee.unit === 'per_pax' ? '/pax' : ''}{fee.unit === 'per_5pax' ? '/5 pax' : ''}{fee.unit === 'per_day' ? '/hari' : ''}{fee.unit === 'per_day_guide' ? '/hari' : ''}</span>
                </div>
              ))}
              {/* Cabin Details */}
              {bookingData?.cabin.map((cabin, index) => (
                <div key={index} className="mb-2">
                  <span className="font-semibold block mb-1 text-gray-900">{cabin.cabin_name} ({cabin.bed_type})</span>
                  <span className="text-black">{cabin.max_pax} pax</span>
                </div>
              ))}
              {/* Hotel Details */}
              {bookingData?.hotel_occupancy && (
                <div className="mb-2">
                  <span className="font-semibold block mb-1 text-gray-900">{bookingData.hotel_occupancy.hotel_name} ({bookingData.hotel_occupancy.occupancy})</span>
                  <span className="text-black">IDR {Number(bookingData.hotel_occupancy.price).toLocaleString('id-ID')}/malam x {bookingData.trip_duration.duration_nights} malam</span>
                </div>
              )}
              {/* Surcharge Details */}
              <div className="mb-2">
                <span className="font-semibold block mb-1 text-gray-900">Surcharge (High Peak Season)</span>
                <span className="text-black">IDR {(bookingData && bookingData.total_pax ? (calculateSurcharge() / bookingData.total_pax) : 0).toLocaleString('id-ID')}/pax x {bookingData?.total_pax} pax = <b>IDR {calculateSurcharge().toLocaleString('id-ID')}</b></span>
              </div>
            </div>
            <div className="flex justify-end items-center mb-2">
              <span className="font-bold text-lg mr-4 text-gold">Sub Total</span>
              <span className="text-black font-bold text-lg">IDR {Number(bookingData?.total_price || 0).toLocaleString('id-ID')}</span>
            </div>
            <hr className="my-4 border-gold/40" />
            <div className="flex justify-between items-center">
              <span className="font-black text-xl md:text-2xl text-gold">Jumlah Total:</span>
              <span className="font-black text-xl md:text-2xl text-gold">IDR {Number(bookingData?.total_price || 0).toLocaleString('id-ID')}</span>
            </div>
          </div>
          {/* Right Section: Payment Method & Upload, dst tetap ada seperti sebelumnya */}
          <div className="w-full md:w-1/2 pl-0 md:pl-8">
            {bookingData?.is_hotel_requested === 1 ? (
              <>
                <h2 className="text-lg font-bold">HOTEL REQUEST</h2>
                <hr className="my-2 border-gray-300" />
                <div className="mt-8 w-full bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <p className="font-semibold text-lg mb-4 text-blue-900">Pilih Hotel</p>
                  <div className="space-y-4">
                    {HOTEL_OPTIONS.map((hotel) => (
                      <label
                        key={hotel}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                          hotelRequests.includes(hotel)
                            ? 'border-blue-500 bg-blue-100'
                            : 'hover:border-blue-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={hotelRequests.includes(hotel)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setHotelRequests([...hotelRequests, hotel]);
                            } else {
                              setHotelRequests(hotelRequests.filter(h => h !== hotel));
                            }
                          }}
                          className="mr-3 h-5 w-5 text-blue-600"
                          disabled={isFinalized}
                        />
                        <span className="font-medium">{hotel}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button
                  className={`mt-8 w-full py-4 rounded-lg font-bold text-xl transition-all duration-300 transform hover:scale-105 ${
                    hotelRequests.length > 0 && !isFinalized
                      ? "bg-green-500 text-white cursor-pointer hover:bg-green-600"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={hotelRequests.length === 0 || isFinalized}
                  type="button"
                  onClick={() => setShowDialog(true)}
                >
                  Submit
                </button>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold">PAYMENT METHOD</h2>
                <hr className="my-2 border-gray-300" />
                <form>
                  {paymentDummy.paymentMethods.map((method, index) => (
                    <label key={index} className={`mt-4 flex items-center justify-between cursor-pointer border rounded-lg p-4 mb-2 transition ${selectedPaymentMethod === method.bank ? 'border-gold bg-gold/10' : 'hover:border-gold'}`}> 
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.bank}
                          checked={selectedPaymentMethod === method.bank}
                          onChange={() => setSelectedPaymentMethod(method.bank)}
                          className="mr-4 w-5 h-5 accent-gold"
                          disabled={isFinalized}
                        />
                        <Image
                          src={method.logo}
                          alt={method.bank}
                          width={60}
                          height={60}
                          className="mr-4"
                        />
                        <div>
                          <p className="font-medium">{method.accountName}</p>
                          <div className="flex items-center">
                            <p className="text-xl font-bold mr-2">
                              {method.accountNumber}
                            </p>
                            <button
                              type="button"
                              onClick={() => handleCopy(method.accountNumber)}
                              className="text-gray-500 hover:text-gray-700"
                              disabled={isFinalized}
                            >
                              <FaCopy />
                            </button>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </form>
                <div className="mt-8 bg-gray-50 rounded-lg p-6 flex flex-col items-center border border-gray-200">
                  <p className="font-semibold text-lg mb-2 text-center">Upload Bukti Pembayaran</p>
                  <button
                    onClick={handleUploadClick}
                    className="w-full bg-gold text-white py-3 rounded-lg font-bold text-lg flex items-center justify-center mb-2 hover:bg-gold-dark-20 transition"
                    type="button"
                    disabled={isFinalized}
                  >
                    <FaUpload className="mr-2" /> Pilih File
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    disabled={isFinalized}
                  />
                  {imagePreview ? (
                    <div className="w-full flex justify-center">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={300}
                        height={180}
                        className="rounded-lg shadow object-contain border mb-2 max-h-60"
                        style={{ maxHeight: '240px', width: 'auto', height: 'auto' }}
                      />
                    </div>
                  ) : (
                    paymentProof && <span className="text-gray-700 text-sm">{paymentProof.name}</span>
                  )}
                </div>
                <button
                  className={`mt-8 w-full py-4 rounded-lg font-bold text-xl transition-all duration-300 transform hover:scale-105 ${
                    isUploaded && selectedPaymentMethod && !isFinalized
                      ? "bg-green-500 text-white cursor-pointer hover:bg-green-600"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!isUploaded || !selectedPaymentMethod || isFinalized}
                  type="button"
                  onClick={() => setShowDialog(true)}
                >
                  Submit
                </button>
              </>
            )}
            {/* Tampilkan tombol WhatsApp jika sudah finalized */}
            {isFinalized && (
              <a
                href="https://wa.me/628123867588"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full inline-block py-4 rounded-lg font-bold text-xl bg-green-600 text-white text-center hover:bg-green-700 transition"
              >
                Hubungi Admin via WhatsApp
              </a>
            )}
            {/* Dialog konfirmasi modern dengan framer-motion */}
            <AnimatePresence>
              {showDialog && (
                <motion.div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full flex flex-col items-center"
                  >
                    {!submitSuccess ? (
                      <>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring" }}
                          className="mb-6"
                        >
                          <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </motion.div>
                        <motion.h3 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="text-2xl font-bold mb-4 text-center"
                        >
                          Konfirmasi Pembayaran
                        </motion.h3>
                        <motion.p 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.4 }}
                          className="mb-6 text-center text-gray-700"
                        >
                          Apakah Anda yakin ingin submit pembayaran dengan metode <span className="font-semibold text-gold">{selectedPaymentMethod}</span>?
                        </motion.p>
                        {submitError && (
                          <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="mb-4 text-red-600 text-center font-semibold bg-red-50 p-3 rounded-lg"
                          >
                            {submitError}
                          </motion.div>
                        )}
                        <motion.div 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="flex gap-4 w-full justify-center"
                        >
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
                            onClick={() => setShowDialog(false)}
                          >
                            Batal
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition"
                            onClick={async () => {
                              setSubmitError(null);
                              const payload: Record<string, unknown> = {
                                booking_id: bookingData?.id,
                                bank_type: selectedPaymentMethod,
                                total_amount: Number(bookingData?.total_price),
                                payment_status: 'Menunggu Pembayaran',
                              };
                              if (hotelRequests.length > 0) payload.hotel_requests = hotelRequests;
                              try {
                                await apiRequest(
                                  'POST',
                                  '/api/landing-page/transactions',
                                  payload
                                );
                                setSubmitSuccess(true);
                                setTimeout(() => {
                                  setShowDialog(false);
                                  setSubmitSuccess(false);
                                }, 4000);
                              } catch (err: unknown) {
                                if (typeof err === 'object' && err && 'message' in err) {
                                  setSubmitError((err as { message?: string }).message || 'Gagal submit transaksi');
                                } else {
                                  setSubmitError('Gagal submit transaksi');
                                }
                              }
                            }}
                          >
                            Konfirmasi
                          </motion.button>
                        </motion.div>
                      </>
                    ) : (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="flex flex-col items-center w-full"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200, damping: 10 }}
                          className="mb-6"
                        >
                          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </motion.div>
                        <motion.h4 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="text-2xl font-bold mb-2 text-center text-green-600"
                        >
                          Pembayaran Berhasil!
                        </motion.h4>
                        <motion.p 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="text-gray-700 text-center mb-4"
                        >
                          Terima kasih, bukti pembayaran Anda telah dikirim.
                        </motion.p>
                        <div className="flex gap-4 mt-4">
                          <button
                            className="px-6 py-2 rounded-lg bg-gold text-white font-semibold hover:bg-gold-dark-20 transition"
                            onClick={handlePrintInvoice}
                          >
                            Cetak Invoice (PDF)
                          </button>
                          <button
                            className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
                            onClick={() => setShowDialog(false)}
                          >
                            Tutup
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

