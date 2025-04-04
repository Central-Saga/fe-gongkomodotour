export interface User {
  id: number
  name: string
  email: string
  role: string
  status: string
  created_at: string
  updated_at: string
}

export interface Customer {
  id: number
  user_id: number
  alamat: string
  no_hp: string
  nasionality: string
  region: string
  status: string
  created_at: string
  updated_at: string
  user: User
}

export interface Testimonial {
  id: number
  customer_id: number
  rating: number
  review: string
  is_approved: boolean
  is_highlight: boolean
  created_at: string
  updated_at: string
  customer: Customer
} 