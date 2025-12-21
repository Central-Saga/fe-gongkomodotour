"use client"

import { columns } from "./columns"
import { DataTable } from "./data-table"
import { apiRequest } from "@/lib/api"
import { apiCache } from "@/lib/browserCache"
import { Transaction } from "@/types/transactions"
import { useEffect, useState, useCallback, Suspense } from "react"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"

interface TransactionResponse {
  data: Transaction[]
  message?: string
  status?: string
}

function TransactionsPageContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true)
      console.log('Fetching transactions...')
      
      // Gunakan cache browser untuk mempercepat loading
      const response = await apiRequest<TransactionResponse>(
        'GET',
        '/api/transactions',
        undefined,
        { useCache: true } // Aktifkan cache browser
      )

      console.log('Raw API Response:', response)
      console.log('Response data:', response.data)
      
      if (response?.data) {
        setTransactions(response.data)
      } else {
        console.warn('No data in response:', response)
        setTransactions([])
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error("Gagal mengambil data transaksi")
      setTransactions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [searchParams, fetchTransactions])

  // Re-fetch ketika window mendapat focus (user kembali ke tab/halaman)
  useEffect(() => {
    const handleFocus = () => {
      // Clear cache dan refresh data saat window mendapat focus
      apiCache.clear('/api/transactions')
      fetchTransactions()
    }

    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [fetchTransactions])

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
          onStatusUpdate={(transactionId, newStatus) => {
            console.log(`Status updated for transaction ${transactionId} to ${newStatus}`)
            // Clear cache setelah update status untuk memastikan data fresh
            apiCache.clear('/api/transactions')
            fetchTransactions()
          }}
        />
      </div>
    </div>
  )
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-10"><div className="flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div></div>}>
      <TransactionsPageContent />
    </Suspense>
  )
}
