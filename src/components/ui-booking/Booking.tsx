"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
import { motion } from "framer-motion";
import { Boat, Cabin } from "@/types/boats";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
// @ts-expect-error: No types for country-telephone-data
import { allCountries } from "country-telephone-data";

// Inisialisasi daftar negara
countries.registerLocale(enLocale);
const countryList = countries.getNames("en", { select: "official" });
const countryOptions = Object.entries(countryList).map(([code, name]) => ({
  value: code,
  label: name,
}));

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Klasifikasi kapasitas boat untuk pengelompokan di dropdown
function getBoatCapacityClass(cap: number): 'kecil' | 'sedang' | 'besar' {
  if (cap <= 10) return 'kecil';
  if (cap <= 20) return 'sedang';
  return 'besar';
}

interface TripPrice {
  id: number;
  trip_duration_id: number;
  pax_min: number;
  pax_max: number;
  price_per_pax: number;
  status: string;
  region: "Domestic" | "Overseas" | "Domestic & Overseas";
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
  has_boat?: boolean;
  boat_ids?: number[];
  has_hotel?: boolean;
  trip_durations?: {
    id: number;
    duration_label: string;
    duration_days: number;
    duration_nights?: number;
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
  operational_days?: string[];
}

type BoatResponse = {
  data: Boat[];
};

interface Hotel {
  id: number;
  hotel_name: string;
  hotel_type: string;
  occupancy: "Single Occupancy" | "Double Occupancy";
  price: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface BookingResponse {
  data: {
    id: number;
    // tambahkan field lain jika diperlukan
  };
}

// Helper untuk mendapatkan kode negara telepon
function getCountryCallingCode(countryCode: string) {
  if (!countryCode) return "";
  const country = allCountries.find(
    (c: { iso2: string }) => c.iso2.toUpperCase() === countryCode.toUpperCase()
  );
  return country ? `+${country.dialCode}` : "";
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
  // Inisialisasi tripCount dengan 0
  const [tripCount, setTripCount] = useState(1);
  const [selectedDuration, setSelectedDuration] = useState<string>("");
  const [selectedBoat, setSelectedBoat] = useState<string>("");
  const [additionalCharges, setAdditionalCharges] = useState<string[]>([]);
  const [selectedDurationDays, setSelectedDurationDays] = useState<number>(0);
  const [boats, setBoats] = useState<Boat[]>([]);
  const [filteredBoats, setFilteredBoats] = useState<Boat[]>([]);
  const [requiredBoats, setRequiredBoats] = useState<number>(0);
  const [requiredCabins, setRequiredCabins] = useState<number>(0);
  const [selectedCabins, setSelectedCabins] = useState<{ cabinId: string, pax: number }[]>([]);
  const [isLoadingBoats, setIsLoadingBoats] = useState(false);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoadingHotels, setIsLoadingHotels] = useState(false);
  const [selectedHotelRooms, setSelectedHotelRooms] = useState<{ hotelId: string, rooms: number, pax: number }[]>([]);
  // Helper: hitung jumlah malam dari data durasi
  const computeNights = useCallback((duration?: { duration_label: string; duration_days: number; duration_nights?: number; }) => {
    if (!duration) return 0;
    // 1) Coba parse dari label, contoh: "4D5N", "4d 5n"
    const match = duration.duration_label?.match(/(\d+)\s*[dD][^\d]*?(\d+)\s*[nN]/);
    if (match) {
      const nightsFromLabel = Number(match[2]);
      if (Number.isFinite(nightsFromLabel) && nightsFromLabel >= 0) return nightsFromLabel;
    }
    // 2) Pakai duration_nights bila tersedia
    if (typeof duration.duration_nights === 'number' && duration.duration_nights >= 0) {
      return duration.duration_nights;
    }
    // 3) Fallback: days - 1
    return Math.max((duration.duration_days || 0) - 1, 0);
  }, []);
  const [userRegion, setUserRegion] = useState<"domestic" | "overseas">("domestic");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    country: "",
    phone: "",
    notes: "",
    requestHotel: false,
    selectedHotel: "",
    numberOfRooms: 1
  });

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  // Disable kalender mengikuti operational_days
  const dayNameToIndex: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };
  const allowedDaysSet = new Set(
    (selectedPackage?.operational_days || []).map((d) => dayNameToIndex[d])
  );
  const disabledByOperationalDays = (date: Date) => {
    if (allowedDaysSet.size === 0) return false; // jika tidak ada konfigurasi, izinkan semua hari
    return !allowedDaysSet.has(date.getDay());
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

  const getApplicableAdditionalFees = useCallback(() => {
    if (!selectedPackage?.additional_fees || !selectedDate || !selectedDurationDays) return [];

    const tripDates = getDatesInRange(selectedDate, selectedDurationDays);
    const applicableFees: typeof selectedPackage.additional_fees = [];

    // Kelompokkan fee berdasarkan kategori
    const feesByCategory = selectedPackage.additional_fees.reduce((acc, fee) => {
      // Cek apakah fee berlaku untuk region yang dipilih
      const isApplicableRegion =
        fee.region === "Domestic & Overseas" ||
        (userRegion === "domestic" && fee.region === "Domestic") ||
        (userRegion === "overseas" && fee.region === "Overseas");

      if (!isApplicableRegion) return acc;

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
        const applicableFee = tripCount > 0
          ? fees.find(fee => tripCount >= fee.pax_min && tripCount <= fee.pax_max)
          : fees[0];

        if (applicableFee) {
          applicableFees.push(applicableFee);
        }
      }
    });

    return applicableFees;
  }, [selectedPackage, selectedDate, selectedDurationDays, tripCount, userRegion]);

  const isActive = (status: unknown) => {
    if (typeof status === "string") {
      const s = status.toLowerCase();
      return s.includes("aktif") || s.includes("active") || s === "1" || s === "true";
    }
    if (typeof status === "number") return status === 1;
    if (typeof status === "boolean") return status;
    return true; // default to active if unknown
  };

  const toNumber = (value: unknown) => {
    return typeof value === "number" ? value : Number(value ?? 0);
  };

  // Kapasitas tertinggi (total max_pax kabin aktif)
  const calculateTotalBoatCapacity = useCallback((boat: Boat) => {
    return boat.cabin
      .filter(cabin => isActive(cabin.status))
      .reduce((total, cabin) => total + toNumber(cabin.max_pax), 0);
  }, []);

  // Teks kapasitas boat: BUKAN dihitung (bukan dijumlah). Cukup:
  // - cabin minimal terendah = min_pax terkecil di antara kabin aktif
  // - cabin maximal terbesar = max_pax terbesar di antara kabin aktif
  // Contoh: kabin 2-2, 2-2, 4-6 pax → 2 pax (min) dan 6 pax (max).
  const getBoatCapacityRangeText = useCallback((boat: Boat) => {
    const active = boat.cabin.filter(c => isActive(c.status));
    if (!active.length) return "0 pax";
    const min = Math.min(...active.map(c => toNumber(c.min_pax)));
    const max = Math.max(...active.map(c => toNumber(c.max_pax)));
    return min === max ? `${min} pax` : `${min}-${max} pax`;
  }, []);

  useEffect(() => {
    // Tampilkan loading saat melakukan re-filter boat akibat perubahan pax/boats
    setIsLoadingBoats(true);

    const availableBoats = boats
      .filter(boat => isActive(boat.status))
      .filter(boat => {
        const totalMax = calculateTotalBoatCapacity(boat);
        return tripCount <= totalMax;
      });
    setFilteredBoats(availableBoats);

    // Reset selected boat jika boat yang dipilih tidak tersedia lagi
    if (selectedBoat) {
      const selectedBoatData = availableBoats.find(boat => boat.id.toString() === selectedBoat);
      if (!selectedBoatData) {
        setSelectedBoat("");
      }
    }

    // Tahan indikator loading sebentar agar terlihat oleh user
    const timeoutId = setTimeout(() => setIsLoadingBoats(false), 300);
    return () => clearTimeout(timeoutId);
  }, [tripCount, boats, selectedBoat, calculateTotalBoatCapacity]);

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
          console.log('Original Trip Data:', trip);
          // Helper untuk memastikan file_url tidak double API_URL
          const getImageUrl = (file_url: string | undefined) => {
            if (!file_url) return "/img/default-image.png";
            if (/^https?:\/\//.test(file_url)) return file_url;
            return `${API_URL}${file_url}`;
          };

          const transformedData: PackageData = {
            id: trip.id.toString(),
            title: trip.name,
            price: trip.trip_durations?.[0]?.trip_prices?.[0]?.price_per_pax?.toString() || "0",
            daysTrip: trip.trip_durations?.[0]?.duration_label || "",
            type: trip.type,
            image: getImageUrl(trip.assets?.[0]?.file_url),
            mainImage: getImageUrl(trip.assets?.[0]?.file_url),
            itinerary: trip.trip_durations?.map(duration => ({
              durationId: duration.id,
              durationLabel: duration.duration_label,
              days: duration.itineraries?.map(itinerary => ({
                day: `Day ${itinerary.day_number}`,
                activities: itinerary.activities
              })) || []
            })),
            has_boat: trip.has_boat,
            boat_ids: trip.boat_ids || [],
            has_hotel: trip.has_hotel,
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
            })),
            operational_days: trip.operational_days || []
          };
          console.log('Transformed Package Data:', transformedData);
          setSelectedPackage(transformedData);
          // Set durasi otomatis jika hanya ada satu opsi
          if (transformedData.trip_durations?.length === 1) {
            setSelectedDuration(transformedData.trip_durations[0].duration_label);
          }
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

  // Set tripCount ke minimal pax saat paket/durasi berubah
  // Catatan: Jangan bergantung pada tripCount agar tidak me-reset saat user menambah
  useEffect(() => {
    if (!selectedPackage?.trip_durations || selectedPackage.trip_durations.length === 0) return;

    const duration = selectedPackage.trip_durations.find(
      (d) => d.duration_label === selectedDuration
    ) || selectedPackage.trip_durations[0];

    const minFromPrices = duration?.trip_prices?.reduce((min, price) => {
      const currentMin = Number(price.pax_min ?? Infinity);
      return Number.isFinite(currentMin) ? Math.min(min, currentMin) : min;
    }, Infinity);

    const minimumPax = Number.isFinite(minFromPrices) ? Number(minFromPrices) : 1;

    setTripCount((prev) => {
      const current = Number(prev) || 0;
      return current < minimumPax ? minimumPax : current;
    });
  }, [selectedPackage, selectedDuration]);

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

  // Minimum pax helper (berdasarkan trip_prices, fallback 1)
  const getMinimumPax = useCallback(() => {
    if (!selectedPackage?.trip_durations || selectedPackage.trip_durations.length === 0) {
      return 1;
    }
    const duration = selectedPackage.trip_durations.find(
      (d) => d.duration_label === selectedDuration
    ) || selectedPackage.trip_durations[0];
    const minFromPrices = duration?.trip_prices?.reduce((min, price) => {
      const currentMin = Number(price.pax_min ?? Infinity);
      return Number.isFinite(currentMin) ? Math.min(min, currentMin) : min;
    }, Infinity);
    const minPax = Number.isFinite(minFromPrices) ? Number(minFromPrices) : 1;
    return Math.max(minPax, 1);
  }, [selectedDuration, selectedPackage]);

  // Pastikan tripCount tidak turun di bawah minimum saat state relevan berubah
  useEffect(() => {
    const minimumPax = getMinimumPax();
    if (tripCount < minimumPax) {
      setTripCount(minimumPax);
    }
  }, [getMinimumPax, tripCount]);

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
  }, [selectedDate, selectedDurationDays, tripCount, selectedPackage, additionalCharges, getApplicableAdditionalFees]);

  const handleDurationChange = (value: string) => {
    setSelectedDuration(value);
    // Reset boat saat durasi berubah
    setSelectedBoat("");
  };

  const handleBoatChange = (value: string) => {
    // Ganti boat: reset alokasi cabin & kebutuhan
    setSelectedBoat(value);
    setSelectedCabins([]);
    setRequiredBoats(0);
    setRequiredCabins(0);
  };

  const calculateBasePrice = () => {
    if (!selectedPackage?.trip_durations || tripCount === 0) return 0;
    // Jika trip punya relasi boat, abaikan trip_prices (harga mengikuti boat/cabin)
    if (selectedPackage?.has_boat) return 0;

    // Cari durasi yang dipilih
    const selectedDurationData = selectedPackage.trip_durations.find(
      d => d.duration_label === selectedDuration
    );

    if (!selectedDurationData?.trip_prices) return 0;

    // Cari harga yang sesuai dengan jumlah pax dan region
    const applicablePrice = selectedDurationData.trip_prices.find(
      price => {
        const isInPaxRange = tripCount >= price.pax_min && tripCount <= price.pax_max;
        // Cek apakah harga sesuai dengan region atau berlaku untuk kedua region
        const isApplicableRegion =
          price.region === "Domestic & Overseas" ||
          (userRegion === "domestic" && price.region === "Domestic") ||
          (userRegion === "overseas" && price.region === "Overseas");
        return isInPaxRange && isApplicableRegion;
      }
    );

    if (!applicablePrice) return 0;
    return Number(applicablePrice.price_per_pax);
  };

  const calculateBasePriceTotal = () => {
    return calculateBasePrice() * tripCount;
  };

  const calculateAdditionalFeeAmount = (fee: NonNullable<PackageData['additional_fees']>[number]) => {
    // Cek apakah fee berlaku untuk region yang dipilih
    const isApplicableRegion =
      fee.region === "Domestic & Overseas" ||
      (userRegion === "domestic" && fee.region === "Domestic") ||
      (userRegion === "overseas" && fee.region === "Overseas");

    if (!isApplicableRegion) return 0;

    const basePrice = Number(fee.price);

    switch (fee.unit) {
      case 'per_pax':
        return basePrice * tripCount;
      case 'per_5pax':
        return basePrice * Math.ceil(tripCount / 5);
      case 'per_day':
        const durationData = selectedPackage?.trip_durations?.find(
          d => d.duration_label === selectedDuration
        );
        return basePrice * (durationData?.duration_days || 0);
      case 'per_day_guide':
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

    // Filter additional fees berdasarkan region
    const applicableFees = selectedPackage.additional_fees.filter(fee => {
      if (fee.region === "Domestic & Overseas") return true;
      if (userRegion === "domestic" && fee.region === "Domestic") return true;
      if (userRegion === "overseas" && fee.region === "Overseas") return true;
      return false;
    });

    const feesWithAmounts = applicableFees
      .filter(fee => additionalCharges.includes(fee.id.toString()))
      .map(fee => ({
        fee,
        amount: calculateAdditionalFeeAmount(fee)
      }));

    console.log('Booking Additional Fees:', {
      selectedFees: additionalCharges,
      applicableFees: feesWithAmounts,
      total: feesWithAmounts.reduce((total, { amount }) => total + amount, 0)
    });

    return feesWithAmounts.reduce((total, { amount }) => total + amount, 0);
  };

  const calculateSurchargeAmount = () => {
    const surcharge = calculateSurcharge();
    if (!surcharge) return 0;
    // Surcharge dikalikan dengan jumlah pax
    return surcharge * tripCount;
  };

  const calculateTotalHotelPrice = () => {
    if (!selectedDuration || !selectedPackage?.trip_durations) return 0;

    // Cari durasi yang dipilih
    const durationData = selectedPackage.trip_durations.find(
      d => d.duration_label === selectedDuration
    );

    // Hitung jumlah malam dengan helper yang konsisten
    const nights = computeNights(durationData);

    return selectedHotelRooms.reduce((total, room) => {
      const hotel = hotels.find(h => h.id.toString() === room.hotelId);
      if (!hotel) return total;
      return total + (Number(hotel.price) * room.rooms * nights);
    }, 0);
  };

  const calculateTotalPrice = () => {
    const basePriceTotal = calculateBasePriceTotal();
    const additionalFeesTotal = calculateAdditionalFees();
    const surchargeTotal = calculateSurchargeAmount();
    const cabinTotal = calculateTotalCabinPrice();
    const hotelTotal = calculateTotalHotelPrice();

    return basePriceTotal + additionalFeesTotal + surchargeTotal + cabinTotal + hotelTotal;
  };

  useEffect(() => {
    const fetchBoats = async () => {
      try {
        setIsLoadingBoats(true);
        const response = await apiRequest<BoatResponse>(
          'GET',
          '/api/landing-page/boats'
        );

        if (response && response.data && Array.isArray(response.data)) {
          let activeBoats = response.data.filter(boat => isActive(boat.status));
          // Filter oleh boat_ids trip jika ada (hanya tampilkan kapal yang terhubung ke trip)
          if (selectedPackage?.boat_ids && selectedPackage.boat_ids.length > 0) {
            activeBoats = activeBoats.filter(boat => selectedPackage.boat_ids!.includes(boat.id));
          }
          setBoats(activeBoats);
          const availableNow = activeBoats.filter(boat => {
            const totalMax = calculateTotalBoatCapacity(boat);
            return tripCount <= totalMax;
          });
          setFilteredBoats(availableNow);
        }
      } catch (error) {
        console.error('Error fetching boats:', error);
      } finally {
        setIsLoadingBoats(false);
      }
    };

    if (selectedPackage?.has_boat) {
      fetchBoats();
    }
  }, [selectedPackage, calculateTotalBoatCapacity, tripCount]);

  // Reset alokasi cabin saat jumlah pax berubah
  useEffect(() => {
    setSelectedCabins([]);
    setRequiredBoats(0);
    setRequiredCabins(0);
  }, [tripCount]);

  const calculateBoatAndCabinRequirements = useCallback(() => {
    if (!selectedBoat || !tripCount) return;

    const selectedBoatData = boats.find(boat => boat.id.toString() === selectedBoat);
    if (!selectedBoatData) return;

    const activeCabins = selectedBoatData.cabin?.filter(c => isActive(c.status)) ?? [];
    const totalCabinCapacity = calculateTotalBoatCapacity(selectedBoatData);
    // Jumlah cabin: pakai max_pax TERBESAR (cabin maximal terbesar), bukan dihitung/dijumlah
    const largestMaxPax = activeCabins.length ? Math.max(...activeCabins.map(c => toNumber(c.max_pax))) : 1;

    setRequiredBoats(Math.ceil(tripCount / totalCabinCapacity));
    setRequiredCabins(Math.ceil(tripCount / largestMaxPax));
  }, [selectedBoat, tripCount, boats, calculateTotalBoatCapacity]);

  useEffect(() => {
    calculateBoatAndCabinRequirements();
  }, [calculateBoatAndCabinRequirements, tripCount]);

  // Ambil harga per pax terendah dari cabin (base_price) untuk sebuah boat
  const getMinimumCabinBasePriceForBoat = (boat: Boat | undefined) => {
    if (!boat) return 0;
    const activeCabins = boat.cabin.filter(c => c.status === "Aktif");
    if (activeCabins.length === 0) return 0;
    return activeCabins.reduce((min, c) => {
      const price = Number(c.base_price || 0);
      return min === 0 ? price : Math.min(min, price);
    }, 0);
  };

  // Harga per pax untuk display di panel kiri
  const calculateDisplayPricePerPax = () => {
    // Jika mengikuti boat, tampilkan harga cabin (min base price)
    if (selectedPackage?.has_boat) {
      // Jika boat sudah dipilih, pakai boat tersebut
      if (selectedBoat) {
        const boat = boats.find(b => b.id.toString() === selectedBoat);
        return getMinimumCabinBasePriceForBoat(boat);
      }
      // Jika belum pilih boat, pakai boat termurah dari daftar tersedia
      const list = filteredBoats.length > 0 ? filteredBoats : boats;
      if (list.length === 0) return 0;
      const minAcrossBoats = list.reduce((min, b) => {
        const boatMin = getMinimumCabinBasePriceForBoat(b);
        if (boatMin === 0) return min;
        return min === 0 ? boatMin : Math.min(min, boatMin);
      }, 0);
      return minAcrossBoats;
    }
    // Jika tidak punya boat, pakai trip base price
    return calculateBasePrice();
  };

  const calculateCabinPrice = (cabin: Cabin, pax: number) => {
    const basePrice = Number(cabin.base_price);
    // Harga cabin per pax
    return basePrice * pax;
  };

  const calculateTotalCabinPrice = () => {
    return selectedCabins.reduce((total, selectedCabin) => {
      const cabinData = boats
        .find(boat => boat.id.toString() === selectedBoat)
        ?.cabin.find(c => c.id.toString() === selectedCabin.cabinId);

      if (!cabinData) return total;

      const cabinPrice = calculateCabinPrice(cabinData, selectedCabin.pax);

      return total + cabinPrice;
    }, 0);
  };

  const calculateTotalSelectedPax = () => {
    return selectedCabins.reduce((total, cabin) => total + cabin.pax, 0);
  };

  const handleCabinPaxChange = (cabinId: string, increment: boolean) => {
    const currentPax = selectedCabins.find(sc => sc.cabinId === cabinId)?.pax || 0;
    const totalSelectedPax = calculateTotalSelectedPax();
    const cabin = boats
      .find(boat => boat.id.toString() === selectedBoat)
      ?.cabin.find(c => c.id.toString() === cabinId);

    if (!cabin) return;

    if (increment) {
      // Saat pertama kali add, gunakan min_pax cabin (bukan 1). Jika totalSelectedPax + min_pax > tripCount, naikkan tripCount otomatis.
      if (currentPax === 0) {
        const minToAdd = Math.min(cabin.min_pax, cabin.max_pax);
        const neededTotal = totalSelectedPax + minToAdd;
        if (neededTotal > tripCount) {
          setTripCount(neededTotal);
        }
        setSelectedCabins([...selectedCabins, { cabinId, pax: minToAdd }]);
        return;
      }
      // Tambah 1 per klik, batasi oleh max_pax dan total tripCount
      if (currentPax < cabin.max_pax) {
        if (totalSelectedPax + 1 > tripCount) {
          setTripCount(totalSelectedPax + 1);
        }
        setSelectedCabins(selectedCabins.map(sc =>
          sc.cabinId === cabinId ? { ...sc, pax: sc.pax + 1 } : sc
        ));
      }
    } else {
      // Kurangi pax; tidak boleh kurang dari min_pax (tidak menjadi 0)
      if (currentPax > cabin.min_pax) {
        setSelectedCabins(selectedCabins.map(sc =>
          sc.cabinId === cabinId ? { ...sc, pax: sc.pax - 1 } : sc
        ));
      }
    }
  };

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setIsLoadingHotels(true);
        console.log('Fetching hotels...');
        const response = await apiRequest<{ data: Hotel[] }>(
          'GET',
          '/api/landing-page/hotels'
        );
        console.log('Hotels response:', response);

        if (response && response.data) {
          // Filter hanya hotel yang aktif
          const activeHotels = response.data.filter(hotel => hotel.status === "Aktif");
          console.log('Active hotels:', activeHotels);
          setHotels(activeHotels);
        } else {
          console.log('No hotels data received');
        }
      } catch (error) {
        console.error('Error fetching hotels:', error);
      } finally {
        setIsLoadingHotels(false);
      }
    };

    // Panggil fetchHotels ketika komponen dimount
    fetchHotels();
  }, []);

  const calculateTotalSelectedHotelPax = () => {
    return selectedHotelRooms.reduce((total, room) => total + room.pax, 0);
  };

  const handleRoomChange = (hotelId: string, increment: boolean) => {
    setSelectedHotelRooms(prev => {
      const currentRoom = prev.find(room => room.hotelId === hotelId);
      const hotel = hotels.find(h => h.id.toString() === hotelId);
      if (!hotel) return prev;

      const maxPaxPerRoom = hotel.occupancy === "Single Occupancy" ? 1 : 2;
      const totalPaxAllocated = calculateTotalSelectedHotelPax();
      const currentPax = currentRoom?.pax || 0;
      const remainingPax = tripCount - (totalPaxAllocated - currentPax);

      if (!currentRoom) {
        // Izinkan tambah kamar meski remainingPax < maxPaxPerRoom (contoh: pax 1, double occupancy)
        if (!increment || remainingPax <= 0) return prev;
        const initialPax = Math.min(maxPaxPerRoom, remainingPax);
        return [...prev, { hotelId, rooms: 1, pax: initialPax }];
      }

      if (increment) {
        // Tambah kamar: naikkan rooms, alokasikan pax hingga sisa (remainingPax)
        if (remainingPax <= 0) return prev;
        const newRooms = currentRoom.rooms + 1;
        const newPax = Math.min(currentPax + maxPaxPerRoom, Math.max(remainingPax, 0));
        return prev.map(room =>
          room.hotelId === hotelId ? { ...room, rooms: newRooms, pax: newPax } : room
        );
      } else {
        if (currentRoom.rooms <= 1) {
          return prev.filter(room => room.hotelId !== hotelId);
        }
        const newRooms = currentRoom.rooms - 1;
        const newPax = Math.max(currentPax - maxPaxPerRoom, 0);
        return prev.map(room =>
          room.hotelId === hotelId ? { ...room, rooms: newRooms, pax: newPax } : room
        );
      }
    });
  };

  const handleBooking = async () => {
    try {
      if (!selectedPackage || !selectedDate || !userRegion) {
        console.error('Missing required data for booking');
        return;
      }

      // Hitung tanggal selesai berdasarkan durasi yang dipilih
      const durationData = selectedPackage.trip_durations?.find(
        d => d.duration_label === selectedDuration
      );
      const endDate = new Date(selectedDate);
      // Lama inap untuk hotel mengikuti jumlah malam, bukan hari
      const nights = computeNights(durationData);
      endDate.setDate(endDate.getDate() + nights);

      // Siapkan data booking
      const bookingData = {
        trip_id: Number(selectedPackage.id),
        trip_duration_id: durationData?.id || 0,
        customer_name: formData.name,
        customer_email: formData.email,
        customer_address: formData.address,
        customer_country: formData.country,
        customer_phone: `${getCountryCallingCode(formData.country)}${formData.phone}`,
        hotel_occupancy_id: selectedHotelRooms.length > 0 ?
          Number(selectedHotelRooms[0].hotelId) : null,
        total_pax: tripCount,
        status: "Pending",
        start_date: format(selectedDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        total_price: calculateTotalPrice(),
        cabins: selectedCabins.length > 0 ? selectedCabins.map(cabin => {
          const cabinData = boats
            .find(boat => boat.id.toString() === selectedBoat)
            ?.cabin.find(c => c.id.toString() === cabin.cabinId);

          return {
            cabin_id: Number(cabin.cabinId),
            total_pax: cabin.pax,
            total_price: cabinData ? calculateCabinPrice(cabinData, cabin.pax) : 0
          };
        }) : [],
        boat_ids: selectedBoat ? [Number(selectedBoat)] : [],
        additional_fee_ids: additionalCharges.map(feeId => {
          const fee = selectedPackage.additional_fees?.find(f => f.id.toString() === feeId);
          return {
            additional_fee_id: Number(feeId),
            total_price: fee ? calculateAdditionalFeeAmount(fee) : 0
          };
        })
      };

      // Kirim data ke API (tanpa dialog konfirmasi)
      const response = await apiRequest<BookingResponse>(
        'POST',
        '/api/landing-page/bookings',
        bookingData
      );

      if (response?.data?.id) {
        // Redirect ke halaman payment dengan ID booking
        router.push(
          `/payment?bookingId=${response.data.id}&packageId=${packageId}&type=${packageType}&date=${selectedDate?.toISOString()}&tripCount=${tripCount}`
        );
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      // Tambahkan handling error sesuai kebutuhan
    }
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
                    onClick={() => {
                      const minimumPax = getMinimumPax();
                      setTripCount((prev) => Math.max(Number(prev) - 1, minimumPax));
                    }}
                    disabled={tripCount <= getMinimumPax()}
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
                    onClick={() => setTripCount((prev) => Number(prev) + 1)}
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
                {/* <p className="text-2xl font-bold text-gold">
                  IDR {calculateDisplayPricePerPax().toLocaleString('id-ID')}/pax
                </p> */}
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="space-y-6"
              >
                {selectedPackage?.has_boat && selectedBoat && (() => {
                  const selectedBoatData = boats.find(boat => boat.id.toString() === selectedBoat);
                  const activeCabins = selectedBoatData?.cabin?.filter(c => isActive(c.status)) ?? [];

                  // Cabin terkecil & terbesar: JANGAN dihitung/dijumlah min pax tiap cabin.
                  // Cukup: cabin yang minimalnya terendah → ambil nilai itu; cabin yang maximalnya terbesar → ambil nilai itu.
                  // Contoh: kabin 2-2, 2-2, 4-6 pax → terkecil 2 (min terendah), terbesar 6 (max terbesar).
                  const smallestMin = activeCabins.length ? Math.min(...activeCabins.map(c => toNumber(c.min_pax))) : 0;
                  const largestMax = activeCabins.length ? Math.max(...activeCabins.map(c => toNumber(c.max_pax))) : 0;

                  return (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-lg">Detail Boat & Cabin</h3>

                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          Cabin terkecil: {smallestMin} pax
                          <span className="block text-xs text-gray-400 mt-0.5">(cabin yang minimalnya terendah, bukan dihitung)</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Cabin terbesar: {largestMax} pax
                          <span className="block text-xs text-gray-400 mt-0.5">(cabin yang maximalnya terbesar, bukan dihitung)</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Jumlah Boat yang Dibutuhkan: {requiredBoats} boat
                          <span className="block text-xs text-gray-400 mt-0.5">(dihitung dari Jumlah Pax ÷ total kapasitas boat)</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Jumlah Cabin yang Dibutuhkan: {requiredCabins} cabin
                          <span className="block text-xs text-gray-400 mt-0.5">(dihitung dari Jumlah Pax ÷ cabin maximal terbesar)</span>
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Distribusi Pax per Cabin:</h4>
                        {selectedCabins.map((cabin, index) => {
                          const cabinData = boats
                            .find(boat => boat.id.toString() === selectedBoat)
                            ?.cabin.find(c => c.id.toString() === cabin.cabinId);

                          if (!cabinData) return null;

                          const cabinPrice = calculateCabinPrice(cabinData, cabin.pax);

                          return (
                            <div key={index} className="flex flex-col p-2 bg-white rounded">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">
                                  {cabinData.cabin_name} ({cabinData.bed_type})
                                </span>
                                <span className="text-sm font-medium">
                                  {cabin.pax} pax
                                </span>
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {cabin.pax <= cabinData.min_pax ? (
                                  <span>Base Price: IDR {Number(cabinData.base_price).toLocaleString('id-ID')}</span>
                                ) : (
                                  <>
                                    <span>Base Price: IDR {Number(cabinData.base_price).toLocaleString('id-ID')}</span>
                                    <br />
                                    <span>
                                      Additional: {cabin.pax - cabinData.min_pax} pax × IDR {Number(cabinData.additional_price).toLocaleString('id-ID')}
                                      = IDR {((cabin.pax - cabinData.min_pax) * Number(cabinData.additional_price)).toLocaleString('id-ID')}
                                    </span>
                                  </>
                                )}
                              </div>
                              <div className="text-sm font-medium text-gold mt-1">
                                Total: IDR {cabinPrice.toLocaleString('id-ID')}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-2 border-t">
                        <p className="text-sm font-medium">
                          Total Harga Cabin: IDR {calculateTotalCabinPrice().toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-lg mb-4">Detail Pembayaran</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">• Harga Cabin: IDR {calculateTotalCabinPrice().toLocaleString('id-ID')}</p>
                    {calculateSurcharge() && (
                      <p className="text-gray-600">• High/Peak Season: IDR {calculateSurchargeAmount().toLocaleString('id-ID')}</p>
                    )}
                    {selectedPackage?.additional_fees && selectedPackage.additional_fees.filter(fee => additionalCharges.includes(fee.id.toString())).length > 0 && (
                      <div className="space-y-1">
                        <p className="text-gray-600">• Additional Fees:</p>
                        {selectedPackage.additional_fees
                          .filter(fee => additionalCharges.includes(fee.id.toString()))
                          .map(fee => (
                            <p key={fee.id} className="text-gray-600 ml-4">- {fee.fee_category}: IDR {calculateAdditionalFeeAmount(fee).toLocaleString('id-ID')}</p>
                          ))}
                      </div>
                    )}
                    {selectedHotelRooms.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-gray-600">• Hotel:</p>
                        {selectedHotelRooms.map(room => {
                          const hotel = hotels.find(h => h.id.toString() === room.hotelId);
                          if (!hotel) return null;
                          const durationData = selectedPackage?.trip_durations?.find(d => d.duration_label === selectedDuration);
                          const nights = computeNights(durationData);
                          const totalHotel = Number(hotel.price) * room.rooms * Math.max(nights, 0);
                          return (
                            <p key={hotel.id} className="text-gray-600 ml-4">- {hotel.hotel_name}: IDR {totalHotel.toLocaleString('id-ID')}</p>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xl font-semibold">
                      Total Pembayaran:{" "}
                      <span className="text-gold">
                        IDR {calculateTotalPrice().toLocaleString('id-ID')}
                      </span>
                    </p>
                  </div>
                </div>

                <Button
                  className={`w-full py-6 rounded-lg font-bold text-2xl transition-all duration-300 transform hover:scale-105 ${selectedDuration && selectedDate && tripCount > 0
                    ? "bg-gold text-white hover:bg-gold-dark-20 shadow-lg hover:shadow-xl"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  disabled={!selectedDuration || !selectedDate || tripCount === 0}
                  onClick={handleBooking}
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
              <Badge variant="secondary" className={`${userRegion === "overseas"
                ? "bg-blue-100 text-blue-700 hover:bg-blue-100/80"
                : "bg-[#efe6e6] text-gray-700 hover:bg-[#efe6e6]/80"
                }`}>
                {userRegion === "overseas" ? "OVERSEAS" : "DOMESTIC"}
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
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="example@gmail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Your address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) => {
                        setFormData(prev => ({ ...prev, country: value }));
                        // Update region based on country
                        setUserRegion(value === "ID" ? "domestic" : "overseas");
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countryOptions.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex space-x-2">
                      <Input
                        value={getCountryCallingCode(formData.country)}
                        disabled
                        className="w-1/4 text-center bg-gray-100"
                      />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Nomor telepon"
                        className="w-3/4"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Catatan Tambahan</Label>
                    <div className="space-y-4">
                      <Input
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Catatan Tambahan"
                        className="h-20"
                      />
                      {/* Hotel Section */}
                      {selectedDuration && selectedDate && selectedPackage?.has_hotel && (
                        <div className="space-y-2">
                          <Label>Hotel</Label>
                          <div className="space-y-4">
                            {isLoadingHotels ? (
                              <div className="p-2 text-center text-sm text-gray-500">
                                Loading hotels...
                              </div>
                            ) : hotels.length === 0 ? (
                              <div className="p-2 text-center text-sm text-gray-500">
                                Tidak ada hotel tersedia
                              </div>
                            ) : (
                              hotels.map((hotel) => {
                                const selectedRoom = selectedHotelRooms.find(room => room.hotelId === hotel.id.toString());
                                const currentRooms = selectedRoom?.rooms || 0;
                                const currentPax = selectedRoom?.pax || 0;
                                return (
                                  <div key={hotel.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="space-y-1">
                                      <div className="font-medium">{hotel.hotel_name}</div>
                                      <div className="text-sm text-gray-500">
                                        {hotel.hotel_type} - {hotel.occupancy}
                                      </div>
                                      <div className="text-sm text-gold">
                                        IDR {Number(hotel.price).toLocaleString('id-ID')}/malam
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {currentPax} dari {tripCount} pax dialokasikan
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRoomChange(hotel.id.toString(), false)}
                                        disabled={currentRooms <= 0}
                                      >
                                        -
                                      </Button>
                                      <Input
                                        type="number"
                                        value={currentRooms}
                                        readOnly
                                        className="w-16 text-center"
                                      />
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRoomChange(hotel.id.toString(), true)}
                                        disabled={calculateTotalSelectedHotelPax() >= tripCount}
                                      >
                                        +
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>
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
                        {!selectedPackage?.trip_durations ? (
                          <div className="p-2 text-center text-sm text-gray-500">
                            Tidak ada durasi tersedia
                          </div>
                        ) : selectedPackage.trip_durations.length === 0 ? (
                          <div className="p-2 text-center text-sm text-gray-500">
                            Tidak ada durasi tersedia untuk paket ini
                          </div>
                        ) : (
                          selectedPackage.trip_durations.map((duration) => (
                            <SelectItem key={duration.id} value={duration.duration_label}>
                              {duration.duration_label}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tanggal Keberangkatan</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${!selectedDuration ? "opacity-50 cursor-not-allowed" : ""}`}
                          disabled={!selectedDuration}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Pilih Tanggal"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={!selectedDuration ? true : disabledByOperationalDays}
                          initialFocus
                          className="rounded-md border"
                          showOutsideDays={false}
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {selectedPackage?.has_boat && (
                    <>
                      <div className="space-y-2">
                        <Label>Boat</Label>
                        <Select
                          value={selectedBoat}
                          onValueChange={handleBoatChange}
                          disabled={isLoadingBoats}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingBoats ? "Loading boats..." : "Pilih Boat"} />
                          </SelectTrigger>
                          <SelectContent>
                            {isLoadingBoats ? (
                              <div className="p-2 text-center text-sm text-gray-500">
                                Loading boats...
                              </div>
                            ) : filteredBoats.length === 0 ? (
                              <div className="p-2 text-center text-sm text-gray-500">
                                {tripCount > 0 ? "Tidak ada boat yang tersedia untuk jumlah pax ini" : "Tidak ada boat tersedia"}
                              </div>
                            ) : (() => {
                              const byClass: Record<string, Boat[]> = { kecil: [], sedang: [], besar: [] };
                              filteredBoats.forEach(boat => {
                                const c = getBoatCapacityClass(calculateTotalBoatCapacity(boat));
                                byClass[c].push(boat);
                              });
                              const labels: Record<string, string> = { kecil: "Kapasitas Kecil (1–10 pax)", sedang: "Kapasitas Sedang (11–20 pax)", besar: "Kapasitas Besar (21+ pax)" };
                              return (["kecil", "sedang", "besar"] as const).map(cls =>
                                byClass[cls].length === 0 ? null : (
                                  <SelectGroup key={cls}>
                                    <SelectLabel>{labels[cls]}</SelectLabel>
                                    {byClass[cls].map(boat => (
                                      <SelectItem key={boat.id} value={boat.id.toString()} className="flex flex-col items-start">
                                        <span className="font-medium">{boat.boat_name}{boat.boat_type ? ` - ${boat.boat_type}` : ""}</span>
                                        <span className="text-xs text-gray-500">Kapasitas: {getBoatCapacityRangeText(boat)}</span>
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                )
                              );
                            })()}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedBoat && (
                        <div className="space-y-2">
                          <Label>Cabin</Label>
                          <div className="space-y-4">
                            {boats
                              .find(boat => boat.id.toString() === selectedBoat)
                              ?.cabin
                              .filter(cabin => cabin.status === "Aktif")
                              .map((cabin) => (
                                <div key={cabin.id} className="flex items-center justify-between p-3 border rounded-lg">
                                  <div className="space-y-1">
                                    <div className="font-medium">{cabin.cabin_name}</div>
                                    <div className="text-sm text-gray-500">
                                      {cabin.bed_type} - {cabin.min_pax}-{cabin.max_pax} pax
                                    </div>
                                    <div className="text-sm text-gold">
                                      Base Price: IDR {Number(cabin.base_price).toLocaleString('id-ID')}
                                      <br />
                                      Additional Price: IDR {Number(cabin.additional_price).toLocaleString('id-ID')}/pax
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleCabinPaxChange(cabin.id.toString(), false)}
                                      disabled={!selectedCabins.find(sc => sc.cabinId === cabin.id.toString())?.pax}
                                    >
                                      -
                                    </Button>
                                    <Input
                                      type="number"
                                      value={Math.max(
                                        selectedCabins.find(sc => sc.cabinId === cabin.id.toString())?.pax || 0,
                                        selectedCabins.find(sc => sc.cabinId === cabin.id.toString()) ? cabin.min_pax : 0
                                      )}
                                      readOnly
                                      className="w-16 text-center"
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleCabinPaxChange(cabin.id.toString(), true)}
                                      disabled={
                                        selectedCabins.find(sc => sc.cabinId === cabin.id.toString())?.pax === cabin.max_pax ||
                                        calculateTotalSelectedPax() >= tripCount
                                      }
                                    >
                                      +
                                    </Button>
                                  </div>
                                </div>
                              ))}
                          </div>
                          <div className="text-sm text-gray-500">
                            Total Pax Terpilih: {calculateTotalSelectedPax()} dari {tripCount} pax
                          </div>
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
                                className={`rounded focus:ring-gold ${fee.is_required ? 'cursor-not-allowed opacity-50' : 'text-gold'
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
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}
