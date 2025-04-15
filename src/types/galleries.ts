export interface Gallery {
  id: number
  title: string
  description: string
  category: string
  status: "Aktif" | "Non Aktif"
  created_at: string
  updated_at: string
  assets?: GalleryAsset[]
}

export interface GalleryAsset {
  id: number
  file_url: string
  title: string
  description: string
  created_at: string
  updated_at: string
}

export interface GalleryResponse {
  data: Gallery[]
  meta: {
    current_page: number
    from: number
    last_page: number
    per_page: number
    to: number
    total: number
  }
} 