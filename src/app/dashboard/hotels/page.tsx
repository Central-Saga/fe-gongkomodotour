"use client"

import { columns } from "./columns"
import { DataTable } from "./data-table"
import { apiRequest } from "@/lib/api"
import { Hotel } from "@/types/hotels"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface HotelResponse {
  data: Hotel[]
  message?: string
  status?: string
}

export default function HotelPage() {
  const [data, setData] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHotels = async () => {
    try {
      setLoading(true)
      console.log('Fetching hotels...')
      const response: HotelResponse = await apiRequest<HotelResponse>(
        'GET',
        '/api/hotels'
      )
      console.log('Raw API Response:', response)
      console.log('Response data:', response.data)
      
      setData(response.data || [])
      setError(null)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Gagal mengambil data hotel"
      setError(errorMessage)
      console.error("Error fetching hotels:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHotels()
  }, [])

  const handleDelete = async (hotel: Hotel) => {
    try {
      await apiRequest('DELETE', `/api/hotels/${hotel.id}`)
      toast.success("Hotel berhasil dihapus")
      fetchHotels()
    } catch (err) {
      toast.error("Gagal menghapus hotel")
      console.error("Error deleting hotel:", err)
    }
  }

  if (loading) return <div className="container mx-auto p-4">Loading...</div>
  if (error) return <div className="container mx-auto p-4 text-red-600">{error}</div>

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hotel Management</h1>
          <p className="text-gray-500 mt-1">Manage data dan informasi hotel</p>
        </div>
      </div>
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
        <DataTable 
          columns={columns({ onDelete: handleDelete })} 
          data={data}
          setData={setData}
        />
      </div>
    </div>
  )
}
