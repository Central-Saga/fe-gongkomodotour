"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { apiRequest } from "@/lib/api"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function CreateTestimonialPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    customer_id: "",
    rating: "5",
    review: "",
    is_approved: "true",
    is_highlight: "false"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await apiRequest('POST', '/api/testimonials', {
        ...formData,
        customer_id: parseInt(formData.customer_id),
        rating: parseInt(formData.rating),
        is_approved: formData.is_approved === "true",
        is_highlight: formData.is_highlight === "true"
      })
      toast.success("Testimonial berhasil ditambahkan")
      router.push('/dashboard/testimonials')
    } catch (error) {
      console.error("Error creating testimonial:", error)
      toast.error("Gagal menambahkan testimonial")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tambah Testimonial</h1>
          <p className="text-gray-500 mt-1">Tambahkan testimonial baru</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Testimonial</CardTitle>
          <CardDescription>
            Isi form di bawah ini untuk menambahkan testimonial baru
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer_id">Customer ID</Label>
              <Input
                id="customer_id"
                name="customer_id"
                type="number"
                value={formData.customer_id}
                onChange={handleChange}
                placeholder="Masukkan ID pelanggan"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Select
                value={formData.rating}
                onValueChange={(value) => setFormData(prev => ({ ...prev, rating: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Bintang</SelectItem>
                  <SelectItem value="2">2 Bintang</SelectItem>
                  <SelectItem value="3">3 Bintang</SelectItem>
                  <SelectItem value="4">4 Bintang</SelectItem>
                  <SelectItem value="5">5 Bintang</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="review">Review</Label>
              <Textarea
                id="review"
                name="review"
                value={formData.review}
                onChange={handleChange}
                placeholder="Masukkan review"
                required
                className="min-h-[150px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="is_approved">Status</Label>
              <Select
                value={formData.is_approved}
                onValueChange={(value) => setFormData(prev => ({ ...prev, is_approved: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Approved</SelectItem>
                  <SelectItem value="false">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="is_highlight">Highlight</Label>
              <Select
                value={formData.is_highlight}
                onValueChange={(value) => setFormData(prev => ({ ...prev, is_highlight: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih highlight" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Ya</SelectItem>
                  <SelectItem value="false">Tidak</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
