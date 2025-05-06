export interface Transaction {
  id: string
  booking_id: string
  bank_type: string
  total_amount: string
  payment_status: string
  payment_proof: string
  created_at: string
  updated_at: string
  booking: {
    id: string
    customer_name: string
    customer_email: string
    customer_phone: string
    customer_address: string
    customer_country: string
    trip: {
      id: string
      name: string
      type: string
      status: string
      start_time: string
      end_time: string
      meeting_point: string
    }
  }
  details: {
    id: string
    amount: string
    description: string
    created_at: string
  }[]
} 