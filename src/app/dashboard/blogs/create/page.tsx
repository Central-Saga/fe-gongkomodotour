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
import { apiCache } from "@/lib/browserCache"
import { FileUpload } from "@/components/ui/file-upload"
import { ApiResponse } from "@/types/role"
import { TipTapEditor } from "@/components/ui/tiptap-editor"
import { optimizeImages } from "@/lib/imageOptimization"

interface UserData {
  id: number
  name: string
  email: string
}

const blogSchema = z.object({
  title: z.string().min(1, "Judul harus diisi"),
  content: z.string().min(1, "Konten harus diisi"),
  status: z.enum(["published", "draft"]),
  category: z.enum(["trips", "travel", "tips"], {
    errorMap: () => ({ message: "Kategori harus dipilih" })
  })
})

export default function CreateBlogPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [fileTitles, setFileTitles] = useState<string[]>([])
  const [fileDescriptions, setFileDescriptions] = useState<string[]>([])
  const [userData, setUserData] = useState<UserData | null>(null)
  const [uploadProgress, setUploadProgress] = useState<{
    current: number
    total: number
    message: string
    stage: 'optimizing' | 'uploading'
  } | null>(null)

  useEffect(() => {
    // Ambil data user dari localStorage saat komponen dimount
    const storedUser = localStorage.getItem('user')
    console.log('Raw user data from localStorage:', storedUser) // Debug log
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        console.log('Parsed user data:', parsedUser) // Debug log
        
        // Cek struktur data user
        if (parsedUser.user && parsedUser.user.id) {
          setUserData(parsedUser.user)
        } else if (parsedUser.id) {
          setUserData(parsedUser)
        } else {
          console.error('Invalid user data structure:', parsedUser)
          toast.error('Data user tidak valid')
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
        toast.error('Gagal memuat data user')
      }
    } else {
      console.error('No user data found in localStorage')
      toast.error('Data user tidak ditemukan')
    }
  }, [])

  const defaultValues: z.infer<typeof blogSchema> = {
    title: "",
    content: "",
    status: "draft",
    category: "trips"
  }

  const form = useForm<z.infer<typeof blogSchema>>({
    resolver: zodResolver(blogSchema),
    defaultValues
  })

  const handleFileDelete = async (fileUrl: string) => {
    try {
      console.log('handleFileDelete called with fileUrl:', fileUrl)
      // Untuk create page, kita tidak perlu menghapus dari existing assets
      // karena file belum di-upload ke server
      toast.success("File berhasil dihapus dari preview")
    } catch (error) {
      console.error("Error deleting file:", error)
      toast.error("Gagal menghapus file")
    }
  }

  const onSubmit = async (values: z.infer<typeof blogSchema>) => {
    try {
      setIsSubmitting(true)
      console.log('Creating new blog')
      console.log('Form values:', values)
      console.log('New files to upload:', files.length)
      console.log('User data at submit:', userData)
      
      if (!userData?.id) {
        console.error('User ID is missing:', userData)
        throw new Error('User ID tidak ditemukan')
      }

      // 1. Create blog dulu untuk mendapatkan blog_id (seperti trips/galleries - tanpa headers)
      const blogData = {
        title: values.title,
        content: values.content,
        status: values.status,
        category: values.category,
        author_id: userData.id
      }

      console.log('Sending POST request to API with payload:', blogData)

      const response = await apiRequest<ApiResponse<{ id: number }>>(
        'POST',
        '/api/blogs',
        blogData
      )

      if (!response || !response.data) {
        throw new Error('Response tidak valid dari server')
      }

      const blogId = response.data.id
      console.log('Blog created with ID:', blogId)

      // 2. Upload blog files jika ada (dengan optimasi seperti boats)
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
        formData.append('model_type', 'blog')
        formData.append('model_id', blogId.toString())
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
          console.log('Blog files uploaded successfully')
          setUploadProgress(null)
        } catch (uploadError: unknown) {
          console.error('Error uploading blog files:', uploadError)
          setUploadProgress(null)
          throw uploadError
        }
      }

      setUploadProgress(null) // Tutup progress indicator saat sukses

      // Clear cache blogs sebelum redirect
      apiCache.clear('/api/blogs')
      toast.success("Blog berhasil dibuat")
      
      // Delay sebentar agar user bisa membaca toast notification sebelum redirect
      await new Promise(resolve => setTimeout(resolve, 1000)) // 1 detik delay
      
      // Redirect setelah delay
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard/blogs'
      } else {
      router.push("/dashboard/blogs")
      router.refresh()
      }
    } catch (error: unknown) {
      console.error("Error creating blog:", error)
      setUploadProgress(null) // Tutup progress indicator saat error
      
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response: { data?: { message?: string }, statusText?: string } }
        console.error("API Error Response:", apiError.response.data)
        toast.error(`Gagal membuat blog: ${apiError.response.data?.message || apiError.response.statusText}`)
      } else if (error && typeof error === 'object' && 'request' in error) {
        console.error("Network Error:", error)
        toast.error("Gagal membuat blog: Tidak dapat terhubung ke server")
      } else {
        console.error("Other Error:", error)
        toast.error("Gagal membuat blog: Terjadi kesalahan yang tidak diketahui")
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
          <h1 className="text-3xl font-bold text-gray-900">Tambah Blog Baru</h1>
          <p className="text-gray-500 mt-2">Isi informasi blog dengan lengkap</p>
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
                            <Input placeholder="Masukkan judul blog" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormItem>
                      <FormLabel>Author</FormLabel>
                      <FormControl>
                        <Input 
                          value={userData?.name || 'Loading...'} 
                          disabled 
                        />
                      </FormControl>
                    </FormItem>

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
                              <SelectItem value="published">Published</SelectItem>
                              <SelectItem value="draft">Draft</SelectItem>
                            </SelectContent>
                          </Select>
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
                              <SelectItem value="trips">Trips</SelectItem>
                              <SelectItem value="travel">Travel</SelectItem>
                              <SelectItem value="tips">Tips</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Konten</h2>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Konten</FormLabel>
                          <FormControl>
                            <TipTapEditor
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Masukkan konten blog"
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
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Gambar Blog</h2>
                  <FileUpload
                    onUpload={async (files, titles, descriptions) => {
                      setFiles(files)
                      setFileTitles(titles)
                      setFileDescriptions(descriptions)
                    }}
                    onDelete={handleFileDelete}
                    maxFiles={5}
                    maxSize={10 * 1024 * 1024} // 10MB
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/blogs")}
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
