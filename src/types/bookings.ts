export interface HotelSurcharge {
  id: number
  hotel_occupancy_id: number
  season: string
  start_date: string
  end_date: string
  surcharge_price: number
  status: string
  created_at: string
  updated_at: string
}

export interface TripPrice {
  id: number
  trip_duration_id: number
  pax_min: number
  pax_max: number
  price_per_pax: string
  status: string
  region: "Domestic" | "Overseas"
  created_at: string
  updated_at: string
}

export interface TripDuration {
  id: number
  duration_label: string
  duration_days: number
  duration_nights: number
  status: string
  created_at: string
  updated_at: string
  trip_prices: TripPrice[]
}

export interface Trip {
  id: number
  name: string
  include: string
  exclude: string
  note: string
  start_time: string
  end_time: string
  meeting_point: string
  type: string
  status: string
  is_highlight: string
  destination_count: number
  has_boat: boolean
  has_hotel: boolean
  created_at: string
  updated_at: string
}

export interface Boat {
  id: number
  boat_name: string
  spesification: string
  cabin_information: string
  facilities: string
  status: string
  created_at: string
  updated_at: string
}

export interface Cabin {
  id: number
  boat_id: number
  cabin_name: string
  bed_type: string
  min_pax: number
  max_pax: number
  base_price: string
  additional_price: string
  status: string
  created_at: string
  updated_at: string
  booking_total_pax: number
  booking_total_price: string
}

export interface User {
  id: number | null
  name: string | null
  email: string | null
  role: string | null
  status: string | null
  created_at: string | null
  updated_at: string | null
}

export interface HotelOccupancy {
  id: number
  hotel_name: string
  hotel_type: string
  occupancy: string
  price: string
  status: string
  created_at: string
  updated_at: string
  surcharges: HotelSurcharge[]
}

export interface AdditionalFee {
  id: number
  trip_id: number
  fee_category: string
  price: string
  region: "Domestic" | "Overseas"
  unit: "per_pax" | "per_5pax"
  pax_min: number
  pax_max: number
  day_type: "Weekday" | "Weekend"
  is_required: number
  status: string
  created_at: string
  updated_at: string
}

export interface Booking {
  id: number
  trip_id: number
  trip_duration_id: number
  user_id: number | null
  hotel_occupancy_id: number
  total_price: string
  total_pax: number
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled"
  created_at: string
  updated_at: string
  customer_name: string
  customer_email: string
  customer_address: string
  customer_country: string
  customer_phone: string
  is_hotel_requested: number
  trip: Trip
  trip_duration: TripDuration
  boat: Boat[]
  cabin: Cabin[]
  user: User
  hotel_occupancy: HotelOccupancy
  additional_fees: AdditionalFee[]
} 