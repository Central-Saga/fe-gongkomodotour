"use client"

import { columns } from "./columns"
import { DataTable } from "./data-table"
import { apiRequest } from "@/lib/api"
import { apiCache } from "@/lib/browserCache"
import { Testimonial } from "@/types/testimonials"
import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"

interface TestimonialResponse {
  data: Testimonial[]
  message?: string
  status?: string
}

export default function TestimonialPage() {
  const [data, setData] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true)
      // Gunakan cache browser untuk mempercepat loading
      const response = await apiRequest<TestimonialResponse>(
        'GET',
        '/api/testimonials',
        undefined,
        { useCache: true } // Aktifkan cache browser
      )
      setData(response.data || [])
      setError(null)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Gagal mengambil data testimonials"
      setError(errorMessage)
      console.error("Error fetching testimonials:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTestimonials()
  }, [fetchTestimonials])

  // Re-fetch ketika window mendapat focus (user kembali ke tab/halaman)
  useEffect(() => {
    const handleFocus = () => {
      // Clear cache dan refresh data saat window mendapat focus
      apiCache.clear('/api/testimonials')
      fetchTestimonials()
    }

    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [fetchTestimonials])

  const handleDelete = async (testimonial: Testimonial) => {
    try {
      await apiRequest('DELETE', `/api/testimonials/${testimonial.id}`)
      toast.success("Testimonial berhasil dihapus")
      // Clear cache setelah delete untuk memastikan data fresh
      apiCache.clearByPattern('testimonials')
      fetchTestimonials()
    } catch (err) {
      toast.error("Gagal menghapus testimonial")
      console.error("Error deleting testimonial:", err)
    }
  }

  if (loading) return <div className="container mx-auto p-4">Loading...</div>
  if (error) return <div className="container mx-auto p-4 text-red-600">{error}</div>

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Testimonial Management</h1>
          <p className="text-gray-500 mt-1">Manage data dan informasi testimonial</p>
        </div>
      </div>
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
        <DataTable 
          columns={columns({ onDelete: handleDelete })} 
          data={data}
        />
      </div>
    </div>
  )
}
