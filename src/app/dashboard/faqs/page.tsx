"use client"

import { columns } from "./columns"
import { DataTable } from "./data-table"
import { apiRequest } from "@/lib/api"
import { FAQ } from "@/types/faqs"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface FAQResponse {
  data: FAQ[]
  message?: string
  status?: string
}

export default function FAQPage() {
  const [data, setData] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFAQs = async () => {
    try {
      setLoading(true)
      console.log('Fetching FAQs...')
      const response: FAQResponse = await apiRequest<FAQResponse>(
        'GET',
        '/api/faqs'
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
  }

  useEffect(() => {
    fetchFAQs()
  }, [])

  const handleDelete = async (faq: FAQ) => {
    try {
      await apiRequest('DELETE', `/api/faqs/${faq.id}`)
      toast.success("FAQ berhasil dihapus")
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
