"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { apiRequest } from "@/lib/api"
import { Testimonial } from "@/types/testimonials"
import { ApiResponse } from "@/types/role"

// Helper function to validate trip_id
const validateTripId = (tripId: string | undefined): boolean => {
  if (!tripId || tripId.trim() === '') return false
  const num = Number(tripId.trim())
  return !isNaN(num) && num > 0 && Number.isInteger(num)
}

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const testimonialSchema = z.object({
  customer_name: z.string().min(1, "Nama customer harus diisi"),
  customer_email: z.string().email("Email harus valid"),
  customer_phone: z.string().min(1, "Nomor telepon harus diisi"),
  trip_id: z.string().optional().refine(
    (val) => !val || (!isNaN(Number(val)) && Number(val) > 0),
    "Trip ID harus berupa angka yang valid"
  ),
  rating: z.enum(["1", "2", "3", "4", "5"], {
    required_error: "Rating harus dipilih"
  }),
  review: z.string().min(1, "Review harus diisi"),
  is_approved: z.boolean(),
  is_highlight: z.boolean(),
  source: z.enum(["internal", "external"], {
    required_error: "Source harus dipilih"
  }),
})

export default function EditTestimonialForm({ id }: { id: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof testimonialSchema>>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      trip_id: "",
      rating: "5",
      review: "",
      is_approved: false,
      is_highlight: false,
      source: "internal",
    }
  })

  useEffect(() => {
    const fetchTestimonial = async () => {
      try {
        setIsLoading(true)
        const response = await apiRequest<ApiResponse<Testimonial>>(
          'GET',
          `/api/testimonials/${id}`
        )
        
        if (!response) {
          throw new Error("Data testimonial tidak ditemukan")
        }

        if (!response.data) {
          throw new Error("Format data tidak valid")
        }
        
        const ratingValue = response.data.rating.toString() as "1" | "2" | "3" | "4" | "5"
        console.log('Fetched rating:', response.data.rating, 'Type:', typeof response.data.rating, 'Converted to:', ratingValue)
        console.log('Rating validation:', {
          original: response.data.rating,
          converted: ratingValue,
          isString: typeof ratingValue === 'string',
          isNumber: !isNaN(Number(ratingValue)),
          parsed: parseInt(ratingValue)
        })
        
        const formData = {
          customer_name: response.data.customer_name,
          customer_email: response.data.customer_email,
          customer_phone: response.data.customer_phone,
          trip_id: response.data.trip_id?.toString() || "",
          rating: ratingValue,
          review: response.data.review,
          is_approved: response.data.is_approved,
          is_highlight: response.data.is_highlight,
          source: response.data.source as "internal" | "external",
        }
        
        console.log('Form data to reset:', formData)
        form.reset(formData)
        
        // Log form values after reset
        setTimeout(() => {
          console.log('Form values after reset:', form.getValues())
          console.log('Rating field value after reset:', form.getValues('rating'))
        }, 100)
      } catch (error) {
        console.error("Error fetching testimonial:", error)
        toast.error(error instanceof Error ? error.message : "Gagal mengambil data testimonial")
        router.push("/dashboard/testimonials")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTestimonial()
  }, [id, form, router])

  const onSubmit = async (values: z.infer<typeof testimonialSchema>) => {
    try {
      setIsSubmitting(true)
      
      // Handle trip_id validation - only include if it's a valid number and greater than 0
      const tripId = values.trip_id?.trim()
      const isValidTripId = validateTripId(tripId)
      
      const ratingNumber = parseInt(values.rating)
      console.log('Rating from form:', values.rating, 'Converted to number:', ratingNumber)
      
      const payload: any = {
        customer_name: values.customer_name,
        customer_email: values.customer_email,
        customer_phone: values.customer_phone,
        rating: ratingNumber,
        review: values.review,
        is_approved: values.is_approved,
        is_highlight: values.is_highlight,
        source: values.source
      }
      
      // Only include trip_id if it's valid
      if (isValidTripId && tripId) {
        payload.trip_id = parseInt(tripId)
        console.log('Trip ID included:', payload.trip_id)
      } else {
        console.log('Trip ID not included - invalid or empty:', tripId)
      }
      
      console.log('Edit payload:', payload)
      
      await apiRequest(
        'PUT',
        `/api/testimonials/${id}`,
        payload
      )

      toast.success("Testimonial berhasil diupdate")
      router.push("/dashboard/testimonials")
      router.refresh()
    } catch (error: any) {
      console.error("Error updating testimonial:", error)
      
      // Handle specific validation errors
      if (error?.response?.data?.errors) {
        const errors = error.response.data.errors
        if (errors.trip_id) {
          toast.error("Trip ID tidak valid atau tidak ditemukan")
        } else {
          toast.error("Terdapat kesalahan validasi data")
        }
      } else {
        toast.error(error instanceof Error ? error.message : "Gagal mengupdate testimonial")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Testimonial</h1>
          <p className="text-gray-500 mt-2">Edit testimonial dari {form.watch('customer_name')}</p>
        </div>

        <div className="mx-auto bg-white rounded-xl shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-8">
              <div className="space-y-8">
                {/* Informasi Customer */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Informasi Customer</h2>
                  <div className="grid grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="customer_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Customer</FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan nama customer" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customer_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Customer</FormLabel>
                          <FormControl>
                            <Input 
                              type="email"
                              placeholder="Masukkan email customer" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customer_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nomor Telepon</FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan nomor telepon" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="source"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Source</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih source" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="internal">Internal</SelectItem>
                              <SelectItem value="external">External</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Informasi Trip */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Informasi Trip</h2>
                  <div className="grid grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="trip_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Trip ID (Opsional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="Masukkan ID trip (opsional)" 
                              min="1"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-sm text-gray-500">
                            Kosongkan jika tidak ada trip yang terkait
                          </p>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Informasi Testimonial */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Informasi Testimonial</h2>
                  <div className="grid grid-cols-2 gap-8">
                     <FormField
                       control={form.control}
                       name="rating"
                       render={({ field }) => {
                         console.log('Current rating field value:', field.value)
                         return (
                           <FormItem>
                             <FormLabel>Rating</FormLabel>
                           <div className="flex gap-1">
                             {[1, 2, 3, 4, 5].map((star) => {
                               const currentRating = parseInt(field.value || "0")
                               const isSelected = star <= currentRating
                               console.log(`Star ${star}: isSelected=${isSelected}, field.value=${field.value}, currentRating=${currentRating}`)
                               return (
                                 <Star
                                   key={`${star}-${field.value}`}
                                   className={`h-8 w-8 cursor-pointer ${
                                     isSelected
                                       ? "text-yellow-400 fill-yellow-400"
                                       : "text-gray-300"
                                   }`}
                                   onClick={() => {
                                     console.log('Star clicked:', star, 'Setting rating to:', star.toString())
                                     field.onChange(star.toString() as "1" | "2" | "3" | "4" | "5")
                                   }}
                                 />
                               )
                             })}
                           </div>
                             <FormMessage />
                           </FormItem>
                         )
                       }}
                     />

                    <FormField
                      control={form.control}
                      name="is_approved"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Approved</FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="is_highlight"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Highlight</FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="review"
                    render={({ field }) => (
                      <FormItem className="mt-6">
                        <FormLabel>Review</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Masukkan review customer"
                            className="min-h-[150px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/testimonials")}
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