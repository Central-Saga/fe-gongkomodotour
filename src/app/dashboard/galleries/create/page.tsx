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
import { FileUpload } from "@/components/ui/file-upload"
import { ApiResponse } from "@/types/role"
import { TipTapEditor } from "@/components/ui/tiptap-editor"

const gallerySchema = z.object({
  title: z.string().min(1, "Judul harus diisi"),
  description: z.string().min(1, "Deskripsi harus diisi"),
  category: z.string().min(1, "Kategori harus diisi"),
  status: z.enum(["Aktif", "Non Aktif"])
})

export default function CreateGalleryPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [fileTitles, setFileTitles] = useState<string[]>([])
  const [fileDescriptions, setFileDescriptions] = useState<string[]>([])

  const defaultValues: z.infer<typeof gallerySchema> = {
    title: "",
    description: "",
    category: "Lainnya",
    status: "Aktif"
  }

  const form = useForm<z.infer<typeof gallerySchema>>({
    resolver: zodResolver(gallerySchema),
    defaultValues
  })

  const handleFileDelete = async (fileUrl: string) => {
    try {
      await apiRequest(
        'DELETE',
        `/api/assets/${encodeURIComponent(fileUrl)}`
      )
      toast.success("File berhasil dihapus")
    } catch (error) {
      console.error("Error deleting file:", error)
      toast.error("Gagal menghapus file")
    }
  }

  const onSubmit = async (values: z.infer<typeof gallerySchema>) => {
    try {
      setIsSubmitting(true)
      
      // Log data yang akan dikirim
      console.log('Data yang akan dikirim:', values)
      
      // 1. Create gallery dulu untuk mendapatkan gallery_id
      const galleryData = {
        title: values.title,
        description: values.description,
        category: values.category,
        status: values.status
      }

      console.log('Gallery data yang akan dikirim:', galleryData)

      const response = await apiRequest<ApiResponse<{ id: number }>>(
        'POST',
        '/api/galleries',
        galleryData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response || !response.data) {
        throw new Error('Response tidak valid dari server')
      }

      const galleryId = response.data.id

      console.log('Response dari API:', response.data)

      if (!galleryId) {
        throw new Error('ID gallery tidak ditemukan dalam response')
      }

      // 2. Upload gallery files jika ada
      if (files.length > 0) {
        const formData = new FormData()
        formData.append('model_type', 'gallery')
        formData.append('model_id', galleryId.toString())
        formData.append('is_external', '0')
        
        files.forEach((file: File, index: number) => {
          formData.append('files[]', file)
          formData.append('file_titles[]', fileTitles[index])
          formData.append('file_descriptions[]', fileDescriptions[index] || '')
        })

        await apiRequest(
          'POST',
          '/api/assets/multiple',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        )
      }

      toast.success("Gallery berhasil dibuat")
      router.push("/dashboard/galleries")
      router.refresh()
    } catch (error: unknown) {
      console.error('Error detail:', error)
      toast.error("Gagal membuat gallery")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tambah Gallery Baru</h1>
          <p className="text-gray-500 mt-2">Isi informasi gallery dengan lengkap</p>
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
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Judul</FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan judul gallery" {...field} />
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih kategori" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Fasilitas">Fasilitas</SelectItem>
                              <SelectItem value="Kamar">Kamar</SelectItem>
                              <SelectItem value="Penginapan">Penginapan</SelectItem>
                              <SelectItem value="Lainnya">Lainnya</SelectItem>
                            </SelectContent>
                          </Select>
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

                {/* Description */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Deskripsi</h2>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deskripsi</FormLabel>
                          <FormControl>
                            <TipTapEditor
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Masukkan deskripsi gallery"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* File Upload Section */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Gambar Gallery</h2>
                  <FileUpload
                    onUpload={async (files, titles, descriptions) => {
                      setFiles(files)
                      setFileTitles(titles)
                      setFileDescriptions(descriptions)
                    }}
                    onDelete={handleFileDelete}
                    maxFiles={5}
                    maxSize={2 * 1024 * 1024} // 2MB
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/galleries")}
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
