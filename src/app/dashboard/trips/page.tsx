"use client"

import { columns } from "./columns"
import { DataTable } from "./data-table"
import { Trip } from "@/types/trips"
import { apiRequest } from "@/lib/api"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface TripResponse {
  data: Trip[]
  message?: string
  status?: string
}

export default function TripPage() {
  const [data, setData] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null)

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
    setTripToDelete(trip)
  }

  const confirmDelete = async () => {
    if (!tripToDelete) return

    try {
      await apiRequest('DELETE', `/api/trips/${tripToDelete.id}`)
      toast.success("Trip berhasil dihapus")
      fetchTrips()
      setTripToDelete(null)
    } catch (err) {
      toast.error("Gagal menghapus trip")
      console.error("Error deleting trip:", err)
    }
  }

  const handleEdit = (trip: Trip) => {
    router.push(`/dashboard/trips/${trip.id}/edit`)
  }

  if (loading) return <div className="container mx-auto p-4">Loading...</div>
  if (error) return <div className="container mx-auto p-4 text-red-600">{error}</div>

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trips Management</h1>
          <p className="text-gray-500 mt-1">Manage trip data and information</p>
        </div>
      </div>
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
        <DataTable 
          columns={columns({ onDelete: handleDelete, onEdit: handleEdit })} 
          data={data}
        />
      </div>

      <AlertDialog open={!!tripToDelete} onOpenChange={() => setTripToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Trip &quot;{tripToDelete?.name}&quot; akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 