export interface Cabin {
  id: number
  boat_id: number
  cabin_name: string
  bed_type: "king" | "single" | "double" | "queen"
  min_pax: number
  max_pax: number
  base_price: string
  additional_price: string
  status: "Aktif" | "Non Aktif"
  created_at: string
  updated_at: string
}

export interface BoatAsset {
  id: number
  title: string
  description: string | null
  file_url: string
  is_external: boolean
  created_at: string
  updated_at: string
}

export interface Boat {
  id: number
  boat_name: string
  spesification: string
  cabin_information: string
  facilities: string
  status: "Aktif" | "Non Aktif"
  created_at: string
  updated_at: string
  cabin: Cabin[]
  assets: BoatAsset[]
}

export type BoatResponse = Boat[] 