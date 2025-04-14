"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/api";
import { Trip } from "@/types/trips";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface TripPrice {
  id: number;
  trip_duration_id: number;
  pax_min: number;
  pax_max: number;
  price_per_pax: number;
  status: string;
}

interface PackageData {
  id: string;
  title: string;
  price: string;
  daysTrip: string;
  type: "Open Trip" | "Private Trip";
  image: string;
  mainImage?: string;
  itinerary?: {
    durationId: number;
    durationLabel: string;
    days: { day: string; activities: string }[];
  }[];
  boatImages?: { image: string; title: string; id: string }[];
  has_boat?: boolean;
  trip_durations?: {
    id: number;
    duration_label: string;
    duration_days: number;
    trip_prices?: TripPrice[];
    itineraries: { day: string; activities: string }[];
  }[];
  additional_fees?: {
    id: number;
    fee_category: string;
    price: number;
    region: "Domestic" | "Overseas" | "Domestic & Overseas";
    unit: "per_pax" | "per_5pax" | "per_day" | "per_day_guide";
    pax_min: number;
    pax_max: number;
    day_type: "Weekday" | "Weekend" | null;
    is_required: boolean;
  }[];
  surcharges?: {
    id: number;
    season: string;
    start_date: string;
    end_date: string;
    surcharge_price: number;
  }[];
}

export default function Booking() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageId = searchParams.get("packageId");
  const dateParam = searchParams.get("date");
  const packageType = searchParams.get("type");

  const [selectedPackage, setSelectedPackage] = useState<PackageData | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    dateParam ? new Date(dateParam) : undefined
  );
  const [tripCount, setTripCount] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState<string>("");
  const [selectedBoat, setSelectedBoat] = useState<string>("");
  const [selectedCabin, setSelectedCabin] = useState<string>("");
  const [additionalCharges, setAdditionalCharges] = useState<string[]>([]);
  const [selectedDurationDays, setSelectedDurationDays] = useState<number>(0);

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const getDatesInRange = (startDate: Date, days: number) => {
    const dates = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const calculateSurcharge = () => {
    if (!selectedPackage || !selectedDate || !selectedDurationDays) return null;

    const tripDates = getDatesInRange(selectedDate, selectedDurationDays);
    let surchargeAmount = 0;

    selectedPackage.surcharges?.forEach(surcharge => {
      const surchargeStart = new Date(surcharge.start_date);
      const surchargeEnd = new Date(surcharge.end_date);

      // Cek apakah ada tanggal dalam range perjalanan yang masuk ke periode surcharge
      const isInSurchargePeriod = tripDates.some(date => 
        date >= surchargeStart && date <= surchargeEnd
      );

      // Jika ada tanggal yang masuk periode surcharge, tambahkan surcharge (hanya sekali)
      if (isInSurchargePeriod) {
        surchargeAmount = Number(surcharge.surcharge_price);
      }
    });

    return surchargeAmount > 0 ? surchargeAmount : null;
  };

  const getApplicableAdditionalFees = () => {
    if (!selectedPackage?.additional_fees || !selectedDate || !selectedDurationDays) return [];

    const tripDates = getDatesInRange(selectedDate, selectedDurationDays);
    const applicableFees: typeof selectedPackage.additional_fees = [];

    // Kelompokkan fee berdasarkan kategori
    const feesByCategory = selectedPackage.additional_fees.reduce((acc, fee) => {
      const hasWeekendDay = tripDates.some(date => isWeekend(date));
      const hasWeekdayDay = tripDates.some(date => !isWeekend(date));
      
      if (
        !fee.day_type ||
        (fee.day_type === "Weekend" && hasWeekendDay) ||
        (fee.day_type === "Weekday" && hasWeekdayDay)
      ) {
        const category = fee.fee_category.replace(/[0-9]/g, '').trim();
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(fee);
      }
      return acc;
    }, {} as Record<string, typeof selectedPackage.additional_fees>);

    // Untuk setiap kategori, pilih fee yang sesuai dengan range pax
    Object.values(feesByCategory).forEach(fees => {
      if (fees.length > 0) {
        // Jika ada multiple fee dengan kategori yang sama, pilih yang sesuai range pax
        const applicableFee = tripCount > 0
          ? fees.find(fee => tripCount >= fee.pax_min && tripCount <= fee.pax_max)
          : fees[0]; // Default ke fee pertama jika belum ada tripCount

        if (applicableFee) {
          applicableFees.push(applicableFee);
        }
      }
    });

    return applicableFees;
  };

  useEffect(() => {
    const fetchTripData = async () => {
      if (!packageId) return;

      try {
        const response = await apiRequest<{ data: Trip }>(
          'GET',
          `/api/landing-page/trips/${packageId}`
        );

        if (response.data) {
          const trip = response.data;
          const transformedData: PackageData = {
            id: trip.id.toString(),
            title: trip.name,
            price: trip.trip_durations?.[0]?.trip_prices?.[0]?.price_per_pax?.toString() || "0",
            daysTrip: trip.trip_durations?.[0]?.duration_label || "",
            type: trip.type,
            image: trip.assets?.[0]?.file_url ? `${API_URL}${trip.assets[0].file_url}` : "/img/default-image.png",
            mainImage: trip.assets?.[0]?.file_url ? `${API_URL}${trip.assets[0].file_url}` : "/img/default-image.png",
            itinerary: trip.trip_durations?.map(duration => ({
              durationId: duration.id,
              durationLabel: duration.duration_label,
              days: duration.itineraries?.map(itinerary => ({
                day: `Day ${itinerary.day_number}`,
                activities: itinerary.activities
              })) || []
            })),
            boatImages: trip.boat_assets?.map(asset => ({
              image: asset.file_url ? `${API_URL}${asset.file_url}` : "/img/default-image.png",
              title: asset.title || "Boat",
              id: asset.id.toString()
            })),
            has_boat: trip.has_boat,
            trip_durations: trip.trip_durations?.map(duration => ({
              id: duration.id,
              duration_label: duration.duration_label,
              duration_days: duration.duration_days,
              trip_prices: duration.trip_prices,
              itineraries: duration.itineraries?.map(itinerary => ({
                day: `Day ${itinerary.day_number}`,
                activities: itinerary.activities
              })) || []
            })),
            additional_fees: trip.additional_fees?.map(fee => ({
              id: fee.id,
              fee_category: fee.fee_category.replace(/[0-9]/g, '').trim(),
              price: Number(fee.price || 0),
              region: fee.region,
              unit: fee.unit,
              pax_min: fee.pax_min,
              pax_max: fee.pax_max,
              day_type: fee.day_type,
              is_required: Boolean(fee.is_required)
            })),
            surcharges: trip.surcharges?.map(surcharge => ({
              id: surcharge.id,
              season: surcharge.season,
              start_date: surcharge.start_date,
              end_date: surcharge.end_date,
              surcharge_price: Number(surcharge.surcharge_price)
            }))
          };

          setSelectedPackage(transformedData);
          
          // Set additional charges yang required secara otomatis
          const requiredFees = trip.additional_fees
            ?.filter(fee => Boolean(fee.is_required))
            .map(fee => fee.id.toString()) || [];
          setAdditionalCharges(requiredFees);
        }
      } catch (error) {
        console.error('Error fetching trip data:', error);
      }
    };

    fetchTripData();
  }, [packageId]);

  useEffect(() => {
    if (selectedDuration && selectedPackage?.trip_durations) {
      const duration = selectedPackage.trip_durations.find(
        d => d.duration_label === selectedDuration
      );
      if (duration) {
        setSelectedDurationDays(duration.duration_days);
      }
    }
  }, [selectedDuration, selectedPackage]);

  useEffect(() => {
    // Update additional charges based on date and duration
    if (selectedDate && selectedDurationDays && tripCount > 0) {
      const applicableFees = getApplicableAdditionalFees();
      
      // Pisahkan antara fee required dan non-required
      const requiredFees = applicableFees.filter(fee => fee.is_required);
      const nonRequiredFees = applicableFees.filter(fee => !fee.is_required);
      
      // Untuk fee required, auto select yang sesuai range pax
      const requiredFeeIds = requiredFees.map(fee => fee.id.toString());
      
      // Untuk non-required, pertahankan pilihan user yang masih valid
      const validNonRequiredCharges = additionalCharges.filter(id => 
        nonRequiredFees.some(fee => fee.id.toString() === id)
      );
      
      const newCharges = [...new Set([...requiredFeeIds, ...validNonRequiredCharges])];
      if (JSON.stringify(newCharges) !== JSON.stringify(additionalCharges)) {
        setAdditionalCharges(newCharges);
      }
    }
  }, [selectedDate, selectedDurationDays, tripCount, selectedPackage]);

  const handleDurationChange = (value: string) => {
    setSelectedDuration(value);
    // Reset boat dan cabin saat durasi berubah
    setSelectedBoat("");
    setSelectedCabin("");
  };

  const handleBoatChange = (value: string) => {
    setSelectedBoat(value);
    // Reset cabin saat boat berubah
    setSelectedCabin("");
  };

  const calculateBasePrice = () => {
    if (!selectedPackage?.trip_durations?.[0]?.trip_prices || tripCount === 0) return 0;
    
    // Cari harga yang sesuai dengan jumlah pax
    const applicablePrice = selectedPackage.trip_durations[0].trip_prices.find(
      price => tripCount >= price.pax_min && tripCount <= price.pax_max
    );

    if (!applicablePrice) return 0;
    return Number(applicablePrice.price_per_pax);
  };

  const calculateBasePriceTotal = () => {
    return calculateBasePrice() * tripCount;
  };

  const calculateAdditionalFeeAmount = (fee: NonNullable<PackageData['additional_fees']>[number]) => {
    const basePrice = Number(fee.price);
    
    switch (fee.unit) {
      case 'per_pax':
        return basePrice * tripCount;
      case 'per_5pax':
        return basePrice * Math.ceil(tripCount / 5);
      case 'per_day':
        // Ambil jumlah hari dari durasi yang dipilih
        const durationData = selectedPackage?.trip_durations?.find(
          d => d.duration_label === selectedDuration
        );
        return basePrice * (durationData?.duration_days || 0);
      case 'per_day_guide':
        // Guide per hari
        const durationInfo = selectedPackage?.trip_durations?.find(
          d => d.duration_label === selectedDuration
        );
        return basePrice * (durationInfo?.duration_days || 0);
      default:
        return basePrice;
    }
  };

  const calculateAdditionalFees = () => {
    if (!selectedPackage?.additional_fees) return 0;
    return selectedPackage.additional_fees
      .filter(fee => additionalCharges.includes(fee.id.toString()))
      .reduce((total, fee) => total + calculateAdditionalFeeAmount(fee), 0);
  };

  const calculateSurchargeAmount = () => {
    const surcharge = calculateSurcharge();
    if (!surcharge) return 0;
    // Surcharge dikalikan dengan jumlah pax
    return surcharge * tripCount;
  };

  const calculateTotalPrice = () => {
    return calculateBasePriceTotal() + calculateAdditionalFees() + calculateSurchargeAmount();
  };

  if (!packageId || !selectedPackage) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex justify-center p-8">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl">
          <h1 className="text-3xl font-bold text-center mb-6">YOUR BOOKING</h1>
          <p className="text-center text-gray-600">
            No package selected. Please select a package to book.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#efeaea] flex justify-center p-8"
    >
      <Card className="w-full max-w-9xl p-6">
        <motion.h1 
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl font-bold text-center mb-6"
        >
          YOUR BOOKING
        </motion.h1>
        <div className="flex space-x-6">
          {/* Left Section: Trip Information */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-1/3"
          >
            <div className="relative">
              <Image
                src={selectedPackage.mainImage || "/img/default-image.png"}
                alt={selectedPackage.title}
                width={500}
                height={900}
                layout="responsive"
                className="rounded-lg object-cover"
              />
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="absolute top-4 left-4"
              >
                <Badge variant="secondary" className={packageType === "open" ? "bg-green-500 hover:bg-green-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"}>
                  {packageType === "open" ? "Open Trip" : "Private Trip"}
                </Badge>
              </motion.div>
            </div>
            <div className="mt-4 space-y-4">
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="text-xl font-semibold"
              >
                {selectedPackage.title}
              </motion.h2>
              
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex items-center space-x-4"
              >
                <Label htmlFor="pax">Jumlah Pax</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTripCount((prev) => Math.max(prev - 1, 0))}
                    className="hover:bg-gold hover:text-white transition-colors duration-300"
                  >
                    -
                  </Button>
                  <Input
                    id="pax"
                    type="number"
                    value={tripCount}
                    readOnly
                    className="w-16 text-center"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTripCount((prev) => prev + 1)}
                    className="hover:bg-gold hover:text-white transition-colors duration-300"
                  >
                    +
                  </Button>
                </div>
              </motion.div>

              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="space-y-2"
              >
                <p className="text-gray-600">{selectedPackage.daysTrip}</p>
                <p className="text-2xl font-bold text-gold">
                  IDR {calculateBasePrice().toLocaleString('id-ID')}/pax
                </p>
              </motion.div>

              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="space-y-2"
              >
                <h3 className="text-lg font-semibold">Detail Pembayaran</h3>
                <div className="space-y-1">
                  <p className="text-gray-600">Sub Total</p>
                  <p className="text-gray-600">
                    • {packageType === "open" ? "Open Trip" : "Private Trip"}{" "}
                    IDR {calculateBasePrice().toLocaleString('id-ID')}/pax x {tripCount} pax = IDR {calculateBasePriceTotal().toLocaleString('id-ID')}
                  </p>
                  {calculateSurcharge() && (
                    <p className="text-gray-600">
                      • High Peak Season IDR {(parseInt(calculateSurcharge()?.toString() || "0")).toLocaleString('id-ID')}/pax x {tripCount} pax = IDR {calculateSurchargeAmount().toLocaleString('id-ID')}
                    </p>
                  )}
                  {selectedPackage?.additional_fees && selectedPackage.additional_fees.filter(fee => additionalCharges.includes(fee.id.toString())).length > 0 && (
                    <div className="space-y-1">
                      <p className="text-gray-600">• Additional Fees:</p>
                      {selectedPackage.additional_fees
                        .filter(fee => additionalCharges.includes(fee.id.toString()))
                        .map(fee => {
                          const durationData = selectedPackage.trip_durations?.find(
                            d => d.duration_label === selectedDuration
                          );
                          const days = durationData?.duration_days || 0;
                          const amount = calculateAdditionalFeeAmount(fee);
                          
                          return (
                            <p key={fee.id} className="text-gray-600 ml-4">
                              - {fee.fee_category}: IDR {Number(fee.price).toLocaleString('id-ID')}
                              {fee.unit === 'per_pax' ? `/pax × ${tripCount} pax` : ''}
                              {fee.unit === 'per_5pax' ? `/5 pax × ${Math.ceil(tripCount / 5)} unit` : ''}
                              {fee.unit === 'per_day' ? `/hari × ${days} hari` : ''}
                              {fee.unit === 'per_day_guide' ? `/hari × ${days} hari` : ''}
                              {' = '}IDR {amount.toLocaleString('id-ID')}
                            </p>
                          );
                        })}
                    </div>
                  )}
                </div>
                <div className="border-t pt-2">
                  <p className="text-lg font-semibold">
                    Total Pembayaran:{" "}
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={calculateTotalPrice()}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="text-gold"
                      >
                        IDR {calculateTotalPrice().toLocaleString('id-ID')}
                      </motion.span>
                    </AnimatePresence>
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                <Button
                  className={`w-full py-6 rounded-lg font-bold text-2xl transition-all duration-300 transform hover:scale-105 ${
                    selectedDuration && selectedDate && tripCount > 0
                      ? "bg-gold text-white hover:bg-gold-dark-20 shadow-lg hover:shadow-xl"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!selectedDuration || !selectedDate || tripCount === 0}
                  onClick={() =>
                    selectedDuration && selectedDate && tripCount > 0 &&
                    router.push(
                      `/payment?packageId=${packageId}&type=${packageType}&date=${selectedDate?.toISOString()}&tripCount=${tripCount}`
                    )
                  }
                >
                  BOOK NOW
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Section: Booking Form */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="w-2/3"
          >
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex justify-between mb-4"
            >
              <Badge variant="secondary" className="bg-[#efe6e6] text-gray-700 hover:bg-[#efe6e6]/80">
                DOMESTIC
              </Badge>
            </motion.div>
            <div className="grid grid-cols-2 gap-6">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold">Data Diri Pemesan</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" placeholder="Mr" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" placeholder="Address" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" placeholder="Country" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex space-x-2">
                      <Select>
                        <SelectTrigger className="w-1/4">
                          <SelectValue placeholder="+62" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="+62">+62</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input id="phone" placeholder="No. WhatsApp" className="w-3/4" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Catatan Tambahan</Label>
                    <Input id="notes" placeholder="Catatan Tambahan" className="h-20" />
                  </div>
                </div>
              </motion.div>
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold">Detail Pesanan</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Durasi</Label>
                    <Select value={selectedDuration} onValueChange={handleDurationChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Durasi" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedPackage?.trip_durations?.map((duration) => (
                          <SelectItem key={duration.id} value={duration.duration_label}>
                            {duration.duration_label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tanggal Keberangkatan</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${!selectedDuration ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={!selectedDuration}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Pilih Tanggal"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" onOpenAutoFocus={e => e.preventDefault()}>
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={!selectedDuration}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {selectedPackage?.has_boat && (
                    <>
                      <div className="space-y-2">
                        <Label>Boat</Label>
                        <Select value={selectedBoat} onValueChange={handleBoatChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Boat" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedPackage.boatImages?.map((boat) => (
                              <SelectItem key={boat.id} value={boat.id}>
                                {boat.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedBoat && (
                        <div className="space-y-2">
                          <Label>Cabin</Label>
                          <Select value={selectedCabin} onValueChange={setSelectedCabin}>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Cabin" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standard">Standard Cabin</SelectItem>
                              <SelectItem value="deluxe">Deluxe Cabin</SelectItem>
                              <SelectItem value="suite">Suite Cabin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </>
                  )}

                  {selectedDuration && selectedDate && (
                    <div className="space-y-2">
                      <Label>Additional Charges</Label>
                      <div className="space-y-2">
                        {getApplicableAdditionalFees().map((fee) => (
                          <div key={fee.id} className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`fee-${fee.id}`}
                                checked={
                                  fee.is_required 
                                    ? tripCount >= fee.pax_min && tripCount <= fee.pax_max
                                    : additionalCharges.includes(fee.id.toString())
                                }
                                onChange={(e) => {
                                  if (fee.is_required) return; // Tidak ada perubahan untuk fee required
                                  if (e.target.checked) {
                                    setAdditionalCharges([...additionalCharges, fee.id.toString()]);
                                  } else {
                                    setAdditionalCharges(additionalCharges.filter(id => id !== fee.id.toString()));
                                  }
                                }}
                                readOnly={fee.is_required}
                                className={`rounded focus:ring-gold ${
                                  fee.is_required ? 'cursor-not-allowed opacity-50' : 'text-gold'
                                }`}
                              />
                              <Label htmlFor={`fee-${fee.id}`} className="cursor-pointer flex items-center">
                                <span>{fee.fee_category}</span>
                                {fee.is_required && <sup className="text-red-500 ml-0.5">*</sup>}
                              </Label>
                            </div>
                            <span className="text-gold font-semibold">
                              {fee.price > 0 ? `IDR ${fee.price.toLocaleString('id-ID')}` : ""}
                              {fee.unit === 'per_pax' ? '/pax' : ''}
                              {fee.unit === 'per_5pax' ? '/5 pax' : ''}
                              {fee.unit === 'per_day' ? '/hari' : ''}
                              {fee.unit === 'per_day_guide' ? '/hari' : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="hotel" className="rounded" />
                    <Label htmlFor="hotel">Request Hotel</Label>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}
