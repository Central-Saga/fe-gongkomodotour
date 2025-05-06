"use client"

import { columns } from "./columns"
import { DataTable } from "./data-table"
import { apiRequest } from "@/lib/api"
import { Booking } from "@/types/bookings"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ColumnDef } from "@tanstack/react-table"

interface BookingResponse {
  data: Booking[]
  message?: string
  status?: string
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchBookings = async () => {
    try {
      setIsLoading(true)
      const response = await apiRequest<BookingResponse>(
        'GET',
        '/api/bookings'
      )

      if (response?.data) {
        setBookings(response.data)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error("Gagal mengambil data booking")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (bookingId: number, newStatus: string) => {
    try {
      const response = await apiRequest<BookingResponse>(
        'PATCH',
        `/api/bookings/${bookingId}/status`,
        { status: newStatus }
      )

      if (response?.data) {
        toast.success("Status booking berhasil diperbarui")
        fetchBookings() // Refresh data
      }
    } catch (error) {
      console.error('Error updating booking status:', error)
      toast.error("Gagal memperbarui status booking")
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const columnsWithStatus: ColumnDef<Booking>[] = [
    ...columns(),
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const booking = row.original
        return (
          <Select
            defaultValue={booking.status}
            onValueChange={(value) => handleStatusChange(booking.id, value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Confirmed">Confirmed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        )
      }
    }
  ]

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
          <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-500 mt-1">Manage data dan informasi booking</p>
        </div>
      </div>
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
        <DataTable 
          columns={columnsWithStatus} 
          data={bookings}
          setData={setBookings}
        />
      </div>
    </div>
  )
}
