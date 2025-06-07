"use client"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { useEffect, useState, use } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { apiRequest } from "@/lib/api"
import { Booking } from "@/types/bookings"
import { ApiResponse } from "@/types/role"

const bookingSchema = z.object({
  status: z.enum(["Pending", "Confirmed", "Completed", "Cancelled"])
})

interface EditBookingPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditBookingPage({ params }: EditBookingPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      status: "Pending"
    }
  })

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setIsLoading(true)
        const response = await apiRequest<ApiResponse<Booking>>(
          'GET',
          `/api/bookings/${resolvedParams.id}`
        )

        if (!response || !response.data) {
          throw new Error('Data booking tidak ditemukan')
        }

        const booking = response.data
        
        // Set form values
        form.reset({
          status: booking.status
        })

      } catch (error) {
        console.error('Error fetching booking:', error)
        toast.error("Gagal mengambil data booking")
        router.push("/dashboard/bookings")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBooking()
  }, [resolvedParams.id, form, router])

  const onSubmit = async (values: z.infer<typeof bookingSchema>) => {
    try {
      setIsSubmitting(true)
      
      const response = await apiRequest<ApiResponse<Booking>>(
        'PUT',
        `/api/bookings/${resolvedParams.id}`,
        {
          status: values.status
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response || !response.data) {
        throw new Error('Response tidak valid dari server')
      }

      toast.success("Status booking berhasil diperbarui")
      router.push("/dashboard/bookings")
      router.refresh()
    } catch (error: unknown) {
      console.error('Error detail:', error)
      toast.error("Gagal memperbarui status booking")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Status Booking</h1>
          <p className="text-gray-500 mt-2">Ubah status booking sesuai kebutuhan</p>
        </div>

        <div className="mx-auto bg-white rounded-xl shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-8">
              <div className="space-y-8">
                {/* Status */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Status Booking</h2>
                  <div className="grid grid-cols-1 gap-8">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Confirmed">Confirmed</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                              <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/bookings")}
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
