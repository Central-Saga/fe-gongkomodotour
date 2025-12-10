"use client"

import { columns } from "./columns"
import { DataTable } from "./data-table"
import { Trip } from "@/types/trips"
import { apiRequest } from "@/lib/api"
import { apiCache } from "@/lib/browserCache"
import { useEffect, useState, useCallback, Suspense } from "react"
import { toast } from "sonner"
import { useRouter, useSearchParams } from "next/navigation"
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

function TripPageContent() {
  const [data, setData] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null)

  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true)
      console.log('Fetching trips...')
      // Clear cache untuk memastikan data fresh
      apiCache.clear('/api/trips')
      const response: TripResponse = await apiRequest<TripResponse>(
        'GET',
        '/api/trips',
        undefined,
        { useCache: false } // Disable cache untuk memastikan data fresh
      )
      console.log('Raw API Response:', response)
      console.log('Response data:', response.data)
      
      // Log detail assets untuk debugging
      if (response.data && response.data.length > 0) {
        response.data.forEach((trip, index) => {
          console.log(`Trip ${index} (${trip.name}):`, {
            id: trip.id,
            name: trip.name,
            assetsCount: trip.assets?.length || 0,
            assets: trip.assets?.map(a => ({
              id: a.id,
              title: a.title,
              file_url: a.file_url,
              description: a.description
            })) || []
          })
        })
      }
      
      setData(response.data || [])
      setError(null)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Gagal mengambil data trip"
      setError(errorMessage)
      console.error("Error fetching trips:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTrips()
  }, [searchParams, fetchTrips])

  // Re-fetch ketika window mendapat focus (user kembali ke tab/halaman)
  useEffect(() => {
    const handleFocus = () => {
      fetchTrips()
    }

    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [fetchTrips])

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

export default function TripPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-4">Loading...</div>}>
      <TripPageContent />
    </Suspense>
  )
} 