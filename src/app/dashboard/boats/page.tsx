"use client"

import { columns } from "./columns"
import { DataTable } from "./data-table"
import { apiRequest } from "@/lib/api"
import { Boat } from "@/types/boats"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface BoatResponse {
  data: Boat[]
  message?: string
  status?: string
}

export default function BoatPage() {
  const [data, setData] = useState<Boat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBoats = async () => {
    try {
      setLoading(true)
      console.log('Fetching boats...')
      const response: BoatResponse = await apiRequest<BoatResponse>(
        'GET',
        '/api/boats'
      )
      console.log('Raw API Response:', response)
      console.log('Response data:', response.data)
      
      setData(response.data || [])
      setError(null)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Gagal mengambil data kapal"
      setError(errorMessage)
      console.error("Error fetching boats:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBoats()
  }, [])

  const handleDelete = async (boat: Boat) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kapal ini?")) return

    try {
      await apiRequest('DELETE', `/api/boats/${boat.id}`)
      toast.success("Kapal berhasil dihapus")
      fetchBoats()
    } catch (err) {
      toast.error("Gagal menghapus kapal")
      console.error("Error deleting boat:", err)
    }
  }

  if (loading) return <div className="container mx-auto p-4">Loading...</div>
  if (error) return <div className="container mx-auto p-4 text-red-600">{error}</div>

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kapal Management</h1>
          <p className="text-gray-500 mt-1">Manage data dan informasi kapal</p>
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
