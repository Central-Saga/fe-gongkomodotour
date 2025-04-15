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
import { Input } from "@/components/ui/input"
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
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { apiRequest } from "@/lib/api"
import { Hotel } from "@/types/hotels"
import { use } from "react"

const hotelSchema = z.object({
  hotel_name: z.string().min(1, "Nama hotel harus diisi"),
  hotel_type: z.enum(["Bintang 1", "Bintang 2", "Bintang 3", "Bintang 4", "Bintang 5"], {
    required_error: "Tipe hotel harus dipilih"
  }),
  occupancy: z.enum(["Single Occupancy", "Double Occupancy"], {
    required_error: "Tipe kamar harus dipilih"
  }),
  price: z.string().min(1, "Harga harus diisi").refine((val) => !isNaN(Number(val)), {
    message: "Harga harus berupa angka"
  }),
  status: z.enum(["Aktif", "Non Aktif"]),
})

export default function EditHotelPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hotel, setHotel] = useState<Hotel | null>(null)

  const form = useForm<z.infer<typeof hotelSchema>>({
    resolver: zodResolver(hotelSchema),
    defaultValues: {
      hotel_name: "",
      hotel_type: "Bintang 3",
      occupancy: "Single Occupancy",
      price: "",
      status: "Aktif",
    }
  })

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        console.log('Fetching hotel with ID:', resolvedParams.id)
        const response = await apiRequest<{ data: Hotel }>(
          'GET',
          `/api/hotels/${resolvedParams.id}`
        )

        console.log('API Response:', response)

        if (response && response.data) {
          setHotel(response.data)
          const formValues = {
            hotel_name: response.data.hotel_name,
            hotel_type: response.data.hotel_type,
            occupancy: response.data.occupancy,
            price: String(response.data.price),
            status: response.data.status as "Aktif" | "Non Aktif",
          }
          console.log('Setting form values:', formValues)
          form.reset(formValues)
        }
      } catch (error) {
        console.error('Error fetching hotel:', error)
        toast.error("Gagal memuat data hotel")
      } finally {
        setIsLoading(false)
      }
    }

    fetchHotel()
  }, [resolvedParams.id, form])

  const onSubmit = async (values: z.infer<typeof hotelSchema>) => {
    try {
      setIsSubmitting(true)
      
      const response = await apiRequest<Hotel>(
        'PUT',
        `/api/hotels/${resolvedParams.id}`,
        values,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response) {
        throw new Error('Response tidak valid dari server')
      }

      toast.success("Hotel berhasil diperbarui")
      router.push("/dashboard/hotels")
      router.refresh()
    } catch (error: unknown) {
      console.error('Error detail:', error)
      toast.error("Gagal memperbarui hotel")
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

  if (!hotel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Hotel tidak ditemukan</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Hotel</h1>
          <p className="text-gray-500 mt-2">Perbarui informasi hotel</p>
        </div>

        <div className="mx-auto bg-white rounded-xl shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-8">
              <div className="space-y-8">
                {/* Informasi Dasar */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Informasi Dasar</h2>
                  <div className="grid grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="hotel_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Hotel</FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan nama hotel" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hotel_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipe Hotel</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih tipe hotel" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Bintang 1">Bintang 1</SelectItem>
                              <SelectItem value="Bintang 2">Bintang 2</SelectItem>
                              <SelectItem value="Bintang 3">Bintang 3</SelectItem>
                              <SelectItem value="Bintang 4">Bintang 4</SelectItem>
                              <SelectItem value="Bintang 5">Bintang 5</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="occupancy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipe Kamar</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih tipe kamar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Single Occupancy">Single Occupancy</SelectItem>
                              <SelectItem value="Double Occupancy">Double Occupancy</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Harga</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              min="0"
                              placeholder="Masukkan harga"
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Aktif">Aktif</SelectItem>
                              <SelectItem value="Non Aktif">Non Aktif</SelectItem>
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
                    onClick={() => router.push("/dashboard/hotels")}
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan Perubahan
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
