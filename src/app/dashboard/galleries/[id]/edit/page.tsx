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
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { apiRequest } from "@/lib/api"
import { apiCache } from "@/lib/browserCache"
import { FileUpload } from "@/components/ui/file-upload"
import { ApiResponse } from "@/types/role"
import { TipTapEditor } from "@/components/ui/tiptap-editor"
import { Gallery, GalleryAsset } from "@/types/galleries"
import { use } from "react"
import { optimizeImages } from "@/lib/imageOptimization"

const gallerySchema = z.object({
  title: z.string().min(1, "Judul harus diisi"),
  description: z.string().min(1, "Deskripsi harus diisi"),
  category: z.string().min(1, "Kategori harus diisi"),
  status: z.enum(["Aktif", "Non Aktif"])
})

interface EditGalleryPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditGalleryPage({ params }: EditGalleryPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [fileTitles, setFileTitles] = useState<string[]>([])
  const [fileDescriptions, setFileDescriptions] = useState<string[]>([])
  const [existingAssets, setExistingAssets] = useState<GalleryAsset[]>([])
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

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setIsLoading(true)
        const response = await apiRequest<ApiResponse<Gallery>>(
          'GET',
          `/api/galleries/${resolvedParams.id}`
        )

        if (!response || !response.data) {
          throw new Error('Data gallery tidak ditemukan')
        }

        const gallery = response.data
        
        // Set form values
        form.reset({
          title: gallery.title,
          description: gallery.description,
          category: gallery.category,
          status: gallery.status
        })

        // Set existing assets
        setExistingAssets(gallery.assets || [])

      } catch (error) {
        console.error('Error fetching gallery:', error)
        toast.error("Gagal mengambil data gallery")
        router.push("/dashboard/galleries")
      } finally {
        setIsLoading(false)
      }
    }

    fetchGallery()
  }, [resolvedParams.id, form, router])

  const handleFileDelete = async (fileUrl: string) => {
    try {
      console.log('handleFileDelete called with fileUrl:', fileUrl)
      console.log('Current existingAssets:', existingAssets.map(a => ({ id: a.id, title: a.title, file_url: a.file_url })))
      
      // Cari asset berdasarkan file_url
      const asset = existingAssets.find(a => a.file_url === fileUrl)
      if (!asset) {
        console.error('Asset not found for fileUrl:', fileUrl)
        throw new Error("Asset tidak ditemukan")
      }

      console.log('Found asset to delete:', { 
        fileUrl, 
        assetId: asset.id, 
        assetTitle: asset.title
      })
      
      // Hapus asset menggunakan ID yang benar
      await apiRequest(
        'DELETE',
        `/api/assets/${asset.id}`
      )
      toast.success("File berhasil dihapus")
      
      // Update existing assets
      setExistingAssets(prev => prev.filter(a => a.file_url !== fileUrl))
    } catch (error) {
      console.error("Error deleting file:", error)
      toast.error("Gagal menghapus file")
    }
  }

  const onSubmit = async (values: z.infer<typeof gallerySchema>) => {
    try {
      setIsSubmitting(true)
      console.log('Updating gallery with ID:', resolvedParams.id)
      console.log('Form values:', values)
      console.log('New files to upload:', files.length)
      console.log('Existing files count:', existingAssets.length)
      
      // Update gallery data (seperti trips - tanpa headers Content-Type)
      const galleryData = {
        title: values.title,
        description: values.description,
        category: values.category,
        status: values.status
      }

      console.log('Sending PUT request to API with payload:', galleryData)
      
      await apiRequest(
        'PUT',
        `/api/galleries/${resolvedParams.id}`,
        galleryData
      )

      console.log('Gallery data updated successfully')

      // Upload new files if any (dengan optimasi seperti boats)
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
        formData.append('model_id', resolvedParams.id)
        formData.append('is_external', '0')
        
        setUploadProgress({
          current: 0,
          total: optimizedFiles.length,
          message: 'Mengupload gambar...',
          stage: 'uploading'
        })
        
        optimizedFiles.forEach((file: File, index: number) => {
          // Log file info untuk debugging
          const originalFile = files[index]
          console.log(`Uploading optimized file ${index + 1}:`, {
            name: file.name,
            type: file.type,
            size: file.size,
            originalSize: originalFile.size,
            compressionRatio: ((1 - file.size / originalFile.size) * 100).toFixed(1) + '%'
          })
          
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

      // Clear semua cache galleries sebelum redirect untuk memastikan data fresh
      apiCache.clearByPattern('galleries')
      toast.success("Gallery berhasil diperbarui")
      
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
      console.error("Error updating gallery:", error)
      setUploadProgress(null) // Tutup progress indicator saat error
      
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response: { data?: { message?: string }, statusText?: string } }
        console.error("API Error Response:", apiError.response.data)
        toast.error(`Gagal mengupdate gallery: ${apiError.response.data?.message || apiError.response.statusText}`)
      } else if (error && typeof error === 'object' && 'request' in error) {
        console.error("Network Error:", error)
        toast.error("Gagal mengupdate gallery: Tidak dapat terhubung ke server")
      } else {
        console.error("Other Error:", error)
        toast.error("Gagal mengupdate gallery: Terjadi kesalahan yang tidak diketahui")
      }
    } finally {
      setIsSubmitting(false)
      setUploadProgress(null) // Pastikan progress indicator ditutup
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
          <h1 className="text-3xl font-bold text-gray-900">Edit Gallery</h1>
          <p className="text-gray-500 mt-2">Perbarui informasi gallery</p>
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
                    existingFiles={existingAssets}
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
