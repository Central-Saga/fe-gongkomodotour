"use client"

import { columns } from "./columns"
import { DataTable } from "./data-table"
import { apiRequest } from "@/lib/api"
import { Transaction } from "@/types/transactions"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface TransactionResponse {
  data: Transaction[]
  message?: string
  status?: string
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchTransactions = async () => {
    try {
      setIsLoading(true)
      const response = await apiRequest<TransactionResponse>(
        'GET',
        '/api/transactions'
      )

      if (response?.data) {
        setTransactions(response.data)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error("Gagal mengambil data transaksi")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transaction Management</h1>
          <p className="text-gray-500 mt-1">Manage data dan informasi transaksi</p>
        </div>
      </div>
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
        <DataTable 
          columns={columns()} 
          data={transactions}
          setData={setTransactions}
        />
      </div>
    </div>
  )
}
