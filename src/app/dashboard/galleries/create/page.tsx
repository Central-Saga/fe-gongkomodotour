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
import { apiCache } from "@/lib/browserCache"
import { FileUpload } from "@/components/ui/file-upload"
import { ApiResponse } from "@/types/role"
import { TipTapEditor } from "@/components/ui/tiptap-editor"
import { optimizeImages } from "@/lib/imageOptimization"

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
  const [uploadProgress, setUploadProgress] = useState<{
    current: number
    total: number
    message: string
    stage: 'optimizing' | 'uploading'
  } | null>(null)

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
      // Untuk create page, file yang dihapus adalah file yang baru diupload
      // yang belum disimpan ke database, jadi tidak perlu call API
      console.log('Removing file from upload list:', fileUrl)
      
      // File akan dihapus dari state oleh FileUpload component
      toast.success("File berhasil dihapus dari daftar upload")
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

      // 2. Upload gallery files jika ada (dengan optimasi)
      if (files.length > 0) {
        // Optimasi gambar sebelum upload
        setUploadProgress({
          current: 0,
          total: files.length,
          message: 'Mengoptimasi gambar...',
          stage: 'optimizing'
        })

        const optimizedFiles = await optimizeImages(
          files,
          {
            maxWidth: 1920,
            maxHeight: 1920,
            quality: 0.85,
            maxSizeMB: 2
          },
          (current, total) => {
            setUploadProgress({
              current,
              total,
              message: `Mengoptimasi gambar ${current}/${total}...`,
              stage: 'optimizing'
            })
          }
        )

        const formData = new FormData()
        formData.append('model_type', 'gallery')
        formData.append('model_id', galleryId.toString())
        formData.append('is_external', '0')
        
        setUploadProgress({
          current: 0,
          total: optimizedFiles.length,
          message: 'Mengupload gambar...',
          stage: 'uploading'
        })
        
        optimizedFiles.forEach((file: File, index: number) => {
          formData.append('files[]', file, file.name)
          formData.append('file_titles[]', fileTitles[index] || file.name)
          formData.append('file_descriptions[]', fileDescriptions[index] || '')
        })

        try {
        await apiRequest(
          'POST',
          '/api/assets/multiple',
          formData,
          {
              timeout: 120000, // 2 menit untuk upload file
            }
          )
          console.log('Gallery files uploaded successfully')
          setUploadProgress(null)
        } catch (uploadError: unknown) {
          console.error('Error uploading gallery files:', uploadError)
          setUploadProgress(null)
          throw uploadError
        }
      }

      setUploadProgress(null) // Tutup progress indicator saat sukses

      // Clear cache galleries sebelum redirect
      apiCache.clear('/api/galleries')
      toast.success("Gallery berhasil dibuat")
      
      // Delay sebentar agar user bisa membaca toast notification sebelum redirect
      await new Promise(resolve => setTimeout(resolve, 1000)) // 1 detik delay
      
      // Redirect setelah delay
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard/galleries'
      } else {
      router.push("/dashboard/galleries")
      router.refresh()
      }
    } catch (error: unknown) {
      console.error('Error detail:', error)
      setUploadProgress(null) // Tutup progress indicator saat error
      
      // Handle error response dari backend
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
        const errorData = axiosError.response?.data
        
        if (errorData?.errors) {
          // Tampilkan error validasi dari backend
          const errorMessages: string[] = []
          Object.entries(errorData.errors).forEach(([field, messages]) => {
            messages.forEach(msg => {
              if (field.includes('files')) {
                errorMessages.push(`File: ${msg}`)
              } else {
                errorMessages.push(`${field}: ${msg}`)
              }
            })
          })
          toast.error(errorMessages.join(', ') || "Gagal membuat gallery")
        } else if (errorData?.message) {
          toast.error(errorData.message)
        } else {
          toast.error("Gagal membuat gallery")
        }
      } else if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as { message: string }).message
        if (errorMessage.includes('timeout')) {
          toast.error("Upload file timeout. Coba lagi dengan file yang lebih kecil atau periksa koneksi internet Anda.")
        } else {
          toast.error(errorMessage || "Gagal membuat gallery")
        }
      } else {
      toast.error("Gagal membuat gallery")
      }
    } finally {
      setIsSubmitting(false)
      setUploadProgress(null) // Pastikan progress indicator ditutup
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Indicator */}
      {uploadProgress && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {uploadProgress.stage === 'optimizing' ? 'Mengoptimasi Gambar' : 'Mengupload Gambar'}
                </p>
                <p className="text-sm text-gray-600">{uploadProgress.message}</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {uploadProgress.current} dari {uploadProgress.total} file
            </p>
          </div>
        </div>
      )}

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
                  <p className="text-sm text-gray-600 mb-4">Upload maksimal 1 gambar dengan ukuran maksimal 10MB</p>
                  <FileUpload
                    onUpload={async (files, titles, descriptions) => {
                      setFiles(files)
                      setFileTitles(titles)
                      setFileDescriptions(descriptions)
                    }}
                    onDelete={handleFileDelete}
                    maxFiles={1}
                    maxSize={10 * 1024 * 1024} // 10MB
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
