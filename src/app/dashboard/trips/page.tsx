"use client"

import { columns } from "./columns"
import { DataTable } from "./data-table"
import { Trip } from "@/types/trips"
import { apiRequest } from "@/lib/api"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface TripResponse {
  data: Trip[]
  message?: string
  status?: string
}

export default function TripPage() {
  const [data, setData] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTrips = async () => {
    try {
      setLoading(true)
      console.log('Fetching trips...')
      const response: TripResponse = await apiRequest<TripResponse>(
        'GET',
        '/api/trips'
      )
      console.log('Raw API Response:', response)
      console.log('Response data:', response.data)
      setData(response.data || [])
      setError(null)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Gagal mengambil data trip"
      setError(errorMessage)
      console.error("Error fetching trips:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrips()
  }, [])

  const handleDelete = async (trip: Trip) => {
    if (!confirm("Apakah Anda yakin ingin menghapus trip ini?")) return

    try {
      await apiRequest('DELETE', `/api/trips/${trip.id}`)
      toast.success("Trip berhasil dihapus")
      fetchTrips()
    } catch (err) {
      toast.error("Gagal menghapus trip")
      console.error("Error deleting trip:", err)
    }
  }

  if (loading) return <div className="container mx-auto p-4">Loading...</div>
  if (error) return <div className="container mx-auto p-4 text-red-600">{error}</div>

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Trips</h1>
      </div>
      <DataTable 
        columns={columns({ onDelete: handleDelete })} 
        data={data}
      />
    </div>
  )
} 