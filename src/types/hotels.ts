export interface Hotel {
  id: number
  hotel_name: string
  hotel_type: "Bintang 1" | "Bintang 2" | "Bintang 3" | "Bintang 4" | "Bintang 5"
  occupancy: "Single Occupancy" | "Double Occupancy"
  price: string
  status: string
  created_at: string
  updated_at: string
  surcharges?: {
    id: number
    season: string
    start_date: string
    end_date: string
    surcharge_price: number
    status: "Aktif" | "Non Aktif"
    created_at: string
    updated_at: string
  }[]
} 