"use client"

import { apiRequest } from '@/lib/api'
import { Customer, CustomerResponse } from '@/types/customer'
import { useEffect, useState } from "react"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { toast } from "sonner"

export default function CustomerPage() {
  const [data, setData] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      console.log('Fetching customers...')
      const response: CustomerResponse = await apiRequest<CustomerResponse>(
        'GET',
        '/api/customers'
      )
      console.log('Raw API Response:', response)
      console.log('Response data:', response.data)
      setData(response.data || [])
      setError(null)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Gagal mengambil data customer"
      setError(errorMessage)
      console.error("Error fetching customers:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const handleDelete = async (customer: Customer) => {
    if (!confirm("Apakah Anda yakin ingin menghapus customer ini?")) return

    try {
      await apiRequest('DELETE', `/api/customers/${customer.id}`)
      toast.success("Customer berhasil dihapus")
      fetchCustomers()
    } catch (err) {
      toast.error("Gagal menghapus customer")
      console.error("Error deleting customer:", err)
    }
  }

  if (loading) return <div className="container mx-auto p-4">Loading...</div>
  if (error) return <div className="container mx-auto p-4 text-red-600">{error}</div>

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Customers</h1>
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