export interface TripPrice {
  id: number
  trip_duration_id: number
  pax_min: number
  pax_max: number
  price_per_pax: string
  status: "Aktif" | "Non Aktif"
  created_at: string
  updated_at: string
}

export interface TripDuration {
  id: number
  duration_label: string
  duration_days: number
  duration_nights: number
  status: "Aktif" | "Non Aktif"
  created_at: string
  updated_at: string
  trip_prices: TripPrice[]
}

export interface Itinerary {
  id: number
  trip_id: number
  day_number: number
  activities: string
  created_at: string
  updated_at: string
}

export interface FlightSchedule {
  id: number
  trip_id: number
  route: string
  eta_time: string
  eta_text: string
  etd_time: string
  etd_text: string
  created_at: string
  updated_at: string
}

export interface AdditionalFee {
  id: number
  trip_id: number
  fee_category: "Transfer" | "Tiket Masuk" | "Parkir"
  price: string
  region: "Domestic" | "Overseas"
  unit: "per_day" | "per_pax" | "per_day_guide" | "per_5pax"
  pax_min: number
  pax_max: number
  day_type: "Weekend" | "Weekday"
  is_required: number
  status: "Aktif" | "Non Aktif"
  created_at: string
  updated_at: string
}

export interface Surcharge {
  id: number
  trip_id: number
  season: "High Season" | "Low Season"
  start_date: string
  end_date: string
  surcharge_price: string
  status: "Aktif" | "Non Aktif"
  created_at: string
  updated_at: string
}

export interface Trip {
  id: number
  name: string
  include: string
  exclude: string
  note: string
  duration: string | null
  start_time: string
  end_time: string
  meeting_point: string
  type: "Open Trip" | "Private Trip"
  status: "Aktif" | "Non Aktif"
  created_at: string
  updated_at: string
  itineraries: Itinerary[]
  flight_schedules: FlightSchedule[]
  trip_durations: TripDuration[]
  additional_fees: AdditionalFee[]
  surcharges: Surcharge[]
}

export type TripResponse = Trip[] 