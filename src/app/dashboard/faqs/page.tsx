"use client"

import { columns } from "./columns"
import { DataTable } from "./data-table"
import { apiRequest } from "@/lib/api"
import { apiCache } from "@/lib/browserCache"
import { FAQ } from "@/types/faqs"
import { useEffect, useState, useCallback, Suspense } from "react"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"

interface FAQResponse {
  data: FAQ[]
  message?: string
  status?: string
}

function FAQPageContent() {
  const [data, setData] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  const fetchFAQs = useCallback(async () => {
    try {
      setLoading(true)
      console.log('Fetching FAQs...')
      // Gunakan cache browser untuk mempercepat loading
      const response: FAQResponse = await apiRequest<FAQResponse>(
        'GET',
        '/api/faqs',
        undefined,
        { useCache: true } // Aktifkan cache browser
      )
      console.log('Raw API Response:', response)
      console.log('Response data:', response.data)
      
      setData(response.data || [])
      setError(null)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Gagal mengambil data FAQ"
      setError(errorMessage)
      console.error("Error fetching FAQs:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFAQs()
  }, [searchParams, fetchFAQs])

  // Re-fetch ketika window mendapat focus (user kembali ke tab/halaman)
  useEffect(() => {
    const handleFocus = () => {
      // Clear cache dan refresh data saat window mendapat focus
      apiCache.clear('/api/faqs')
      fetchFAQs()
    }

    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [fetchFAQs])

  const handleDelete = async (faq: FAQ) => {
    try {
      await apiRequest('DELETE', `/api/faqs/${faq.id}`)
      toast.success("FAQ berhasil dihapus")
      // Clear cache setelah delete untuk memastikan data fresh
      apiCache.clear('/api/faqs')
      fetchFAQs()
    } catch (err) {
      toast.error("Gagal menghapus FAQ")
      console.error("Error deleting FAQ:", err)
    }
  }

  if (loading) return <div className="container mx-auto p-4">Loading...</div>
  if (error) return <div className="container mx-auto p-4 text-red-600">{error}</div>

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">FAQ Management</h1>
          <p className="text-gray-500 mt-1">Manage data dan informasi FAQ</p>
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

export default function FAQPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-4">Loading...</div>}>
      <FAQPageContent />
    </Suspense>
  )
}
