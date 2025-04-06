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
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { apiRequest } from "@/lib/api"
import { FAQ } from "@/types/faqs"

const faqSchema = z.object({
  question: z.string().min(1, "Pertanyaan harus diisi"),
  answer: z.string().min(1, "Jawaban harus diisi"),
  category: z.string().min(1, "Kategori harus dipilih"),
  display_order: z.string()
    .min(1, "Urutan tampilan harus diisi")
    .refine((val) => !isNaN(Number(val)), {
      message: "Urutan tampilan harus berupa angka"
    })
    .refine((val) => {
      const num = Number(val);
      return num >= 1 && num <= 6;
    }, {
      message: "Urutan tampilan harus antara 1-6"
    }),
  status: z.enum(["Aktif", "Non Aktif"]),
})

export default function CreateFAQPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Daftar kategori yang tersedia
  const categories = [
    "Umum",
    "Pembayaran",
    "Pemesanan",
    "Pembatalan",
    "Lainnya"
  ]

  const defaultValues: z.infer<typeof faqSchema> = {
    question: "",
    answer: "",
    category: "",
    display_order: "",
    status: "Aktif",
  }

  const form = useForm<z.infer<typeof faqSchema>>({
    resolver: zodResolver(faqSchema),
    defaultValues
  })

  const onSubmit = async (values: z.infer<typeof faqSchema>) => {
    try {
      setIsSubmitting(true)
      
      const response = await apiRequest<FAQ>(
        'POST',
        '/api/faqs',
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

      toast.success("FAQ berhasil dibuat")
      router.push("/dashboard/faqs")
      router.refresh()
    } catch (error: unknown) {
      console.error('Error detail:', error)
      toast.error("Gagal membuat FAQ")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tambah FAQ Baru</h1>
          <p className="text-gray-500 mt-2">Isi informasi FAQ dengan lengkap</p>
        </div>

        <div className="mx-auto bg-white rounded-xl shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-8">
              <div className="space-y-8">
                {/* Informasi Dasar */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Informasi Dasar</h2>
                  <div className="grid grid-cols-1 gap-8">
                    <FormField
                      control={form.control}
                      name="question"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pertanyaan</FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan pertanyaan" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="answer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jawaban</FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan jawaban" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kategori</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih kategori" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="display_order"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Urutan Tampilan (1-6)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              min="1"
                              max="6"
                              placeholder="Masukkan urutan tampilan (1-6)"
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    onClick={() => router.push("/dashboard/faqs")}
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
