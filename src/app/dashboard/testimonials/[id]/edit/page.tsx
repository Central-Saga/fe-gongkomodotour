"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { apiRequest } from "@/lib/api"
import { Testimonial } from "@/types/testimonials"
import { ApiResponse } from "@/types/role"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Star } from "lucide-react"

const testimonialSchema = z.object({
  is_approved: z.boolean(),
  is_highlight: z.boolean(),
})

export default function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [review, setReview] = useState("")
  const [rating, setRating] = useState(0)

  const form = useForm<z.infer<typeof testimonialSchema>>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      is_approved: false,
      is_highlight: false,
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
        
        setCustomerName(response.data.customer.user.name)
        setReview(response.data.review)
        setRating(response.data.rating)
        form.reset({
          is_approved: response.data.is_approved,
          is_highlight: response.data.is_highlight,
        })
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
      await apiRequest(
        'PUT',
        `/api/testimonials/${id}`,
        values
      )

      toast.success("Testimonial berhasil diupdate")
      router.push("/dashboard/testimonials")
      router.refresh()
    } catch (error) {
      console.error("Error updating testimonial:", error)
      toast.error(error instanceof Error ? error.message : "Gagal mengupdate testimonial")
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
          <p className="text-gray-500 mt-2">Edit testimonial dari {customerName}</p>
        </div>

        <div className="mx-auto bg-white rounded-xl shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-8">
              <div className="space-y-8">
                {/* Review */}
                <div className="space-y-2">
                  <FormLabel>Review</FormLabel>
                  <Textarea
                    value={review}
                    readOnly
                    className="min-h-[100px] bg-gray-50"
                  />
                </div>

                {/* Rating */}
                <div className="space-y-2">
                  <FormLabel>Rating</FormLabel>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-8 w-8 ${
                          star <= rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="grid grid-cols-2 gap-8">
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
