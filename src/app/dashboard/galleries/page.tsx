"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { Gallery } from "@/types/galleries"
import { apiRequest } from "@/lib/api"
import { apiCache } from "@/lib/browserCache"
import { useSearchParams } from "next/navigation"

interface GalleryResponse {
  data: Gallery[]
  message?: string
  status?: string
}

function GalleryPageContent() {
  const [data, setData] = useState<Gallery[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      console.log('Fetching galleries...')
      // Clear cache untuk memastikan data fresh (seperti trips)
      apiCache.clear('/api/galleries')
      const response: GalleryResponse = await apiRequest<GalleryResponse>(
        'GET',
        '/api/galleries',
        undefined,
        { useCache: false } // Disable cache untuk memastikan data fresh
      )
      console.log('Raw API Response:', response)
      console.log('Response data:', response.data)
      
      setData(response.data || [])
      setError(null)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Gagal mengambil data gallery"
      setError(errorMessage)
      console.error("Error fetching galleries:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [searchParams, fetchData])

  // Re-fetch ketika window mendapat focus (user kembali ke tab/halaman)
  useEffect(() => {
    const handleFocus = () => {
      fetchData()
    }

    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [fetchData])

  if (loading) return <div className="container mx-auto p-4">Loading...</div>
  if (error) return <div className="container mx-auto p-4 text-red-600">{error}</div>

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gallery Management</h1>
          <p className="text-gray-500 mt-1">Manage data dan informasi gallery (maksimal 1 gambar per item, ukuran max 10MB)</p>
        </div>
      </div>
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
        <DataTable
          columns={columns()}
          data={data}
          setData={setData}
        />
      </div>
    </div>
  )
}

export default function GalleryPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-4">Loading...</div>}>
      <GalleryPageContent />
    </Suspense>
  )
}
