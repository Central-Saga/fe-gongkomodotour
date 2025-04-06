"use client"

import { useState, useEffect } from "react"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { Recipient } from "@/types/recipient"
import { apiRequest } from "@/lib/api"

export default function RecipientsPage() {
  const [data, setData] = useState<Recipient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await apiRequest<{ data: Recipient[] }>(
        'GET',
        '/api/recipients'
      )
      setData(response.data || [])
      setError(null)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Gagal mengambil data recipient"
      setError(errorMessage)
      console.error("Error fetching recipients:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) return <div className="container mx-auto p-4">Loading...</div>
  if (error) return <div className="container mx-auto p-4 text-red-600">{error}</div>

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recipient Management</h1>
          <p className="text-gray-500 mt-1">Manage data recipient</p>
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
