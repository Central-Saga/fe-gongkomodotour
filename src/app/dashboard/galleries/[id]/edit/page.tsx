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
import { FileUpload } from "@/components/ui/file-upload"
import { ApiResponse } from "@/types/role"
import { TipTapEditor } from "@/components/ui/tiptap-editor"
import { Gallery, GalleryAsset } from "@/types/galleries"
import { use } from "react"

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
      await apiRequest(
        'DELETE',
        `/api/assets/${encodeURIComponent(fileUrl)}`
      )
      toast.success("File berhasil dihapus")
      
      // Update existing assets
      setExistingAssets(prev => prev.filter(asset => asset.file_url !== fileUrl))
    } catch (error) {
      console.error("Error deleting file:", error)
      toast.error("Gagal menghapus file")
    }
  }

  const onSubmit = async (values: z.infer<typeof gallerySchema>) => {
    try {
      setIsSubmitting(true)
      
      // Update gallery data
      const galleryData = {
        title: values.title,
        description: values.description,
        category: values.category,
        status: values.status
      }

      const response = await apiRequest<ApiResponse<{ id: number }>>(
        'PUT',
        `/api/galleries/${resolvedParams.id}`,
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

      // Upload new files if any
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

      toast.success("Gallery berhasil diperbarui")
      router.push("/dashboard/galleries")
      router.refresh()
    } catch (error: unknown) {
      console.error('Error detail:', error)
      toast.error("Gagal memperbarui gallery")
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
                  <FileUpload
                    existingFiles={existingAssets}
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
