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
      console.log('Starting to fetch transactions...')
      
      const response = await apiRequest<TransactionResponse>(
        'GET',
        '/api/transactions'
      )

      console.log('API Response for transactions:', response)
      console.log('Response type:', typeof response)
      console.log('Response keys:', Object.keys(response || {}))
      
      if (response?.data) {
        console.log('Transactions data:', response.data)
        console.log('Number of transactions:', response.data.length)
        
        // Log each transaction's payment_proof
        response.data.forEach((transaction, index) => {
          console.log(`Transaction ${index + 1}:`, {
            id: transaction.id,
            payment_proof: transaction.payment_proof,
            payment_status: transaction.payment_status,
            customer_name: transaction.booking?.customer_name,
            has_payment_proof: !!transaction.payment_proof,
            payment_proof_length: transaction.payment_proof?.length || 0
          })
        })
        setTransactions(response.data)
      } else {
        console.warn('No data in response:', response)
        setTransactions([])
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      toast.error("Gagal mengambil data transaksi")
      setTransactions([])
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
          onStatusUpdate={(transactionId, newStatus) => {
            console.log(`Status updated for transaction ${transactionId} to ${newStatus}`)
            // Additional logic can be added here if needed
          }}
        />
      </div>
    </div>
  )
}
