export interface TripPrice {
  id: number
  trip_duration_id: number
  pax_min: number
  pax_max: number
  price_per_pax: number
  status: "Aktif" | "Non Aktif"
  created_at: string
  updated_at: string
}

export interface TripDuration {
  id: number
  trip_id: number
  duration_label: string
  duration_days: number
  duration_nights: number
  status: "Aktif" | "Non Aktif"
  created_at: string
  updated_at: string
  itineraries: Itinerary[]
  prices: TripPrice[]
  trip_prices: TripPrice[]
}

export interface Itinerary {
  id: number
  trip_duration_id: number
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
  fee_category: string
  price: number
  region: "Domestic" | "Overseas" | "Domestic & Overseas"
  unit: "per_pax" | "per_5pax" | "per_day" | "per_day_guide"
  pax_min: number
  pax_max: number
  day_type: "Weekday" | "Weekend" | null
  is_required: boolean
  status: "Aktif" | "Non Aktif"
  created_at: string
  updated_at: string
}

export interface Surcharge {
  id: number
  trip_id: number
  season: string
  start_date: string
  end_date: string
  surcharge_price: number
  status: "Aktif" | "Non Aktif"
  created_at: string
  updated_at: string
}

export interface TripFile {
  id: number
  trip_id: number
  file_url: string
  title: string
  description: string | null
  is_external: boolean
  created_at: string
  updated_at: string
}

export interface TripAsset {
  id: number
  title: string
  description: string | null
  file_url: string
  is_external: boolean
  created_at: string
  updated_at: string
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
  type: "Open Trip" | "Private Trip"
  status: "Aktif" | "Non Aktif"
  is_highlight: "Yes" | "No"
  created_at: string
  updated_at: string
  trip_durations: TripDuration[]
  flight_schedules: FlightSchedule[]
  additional_fees: AdditionalFee[]
  surcharges: Surcharge[]
  assets: TripAsset[]
}

export type TripResponse = Trip[] 