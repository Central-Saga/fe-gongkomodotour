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
import { Blog, BlogAsset } from "@/types/blog"
import { use } from "react"
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

interface EditBlogPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditBlogPage({ params }: EditBlogPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [fileTitles, setFileTitles] = useState<string[]>([])
  const [fileDescriptions, setFileDescriptions] = useState<string[]>([])
  const [existingAssets, setExistingAssets] = useState<BlogAsset[]>([])
  const [userData, setUserData] = useState<UserData | null>(null)
  const [uploadProgress, setUploadProgress] = useState<{
    current: number
    total: number
    message: string
    stage: 'optimizing' | 'uploading'
  } | null>(null)

  useEffect(() => {
    // Ambil data user dari localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        if (parsedUser.user && parsedUser.user.id) {
          setUserData(parsedUser.user)
        } else if (parsedUser.id) {
          setUserData(parsedUser)
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
        toast.error('Gagal memuat data user')
      }
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

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setIsLoading(true)
        const response = await apiRequest<ApiResponse<Blog>>(
          'GET',
          `/api/blogs/${resolvedParams.id}`
        )

        if (!response || !response.data) {
          throw new Error('Data blog tidak ditemukan')
        }

        const blog = response.data
        
        // Set form values
        form.reset({
          title: blog.title,
          content: blog.content,
          status: blog.status as "published" | "draft",
          category: blog.category
        })

        // Set existing assets
        setExistingAssets(blog.assets || [])

      } catch (error) {
        console.error('Error fetching blog:', error)
        toast.error("Gagal mengambil data blog")
        router.push("/dashboard/blogs")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBlog()
  }, [resolvedParams.id, form, router])

  const handleFileDelete = async (fileUrl: string) => {
    try {
      console.log('handleFileDelete called with fileUrl:', fileUrl)
      console.log('Current existingAssets:', existingAssets.map(f => ({ id: f.id, title: f.title, file_url: f.file_url })))
      
      // Cari asset berdasarkan file_url
      const asset = existingAssets.find(file => file.file_url === fileUrl)
      if (!asset) {
        console.error('Asset not found for fileUrl:', fileUrl)
        throw new Error("Asset tidak ditemukan")
      }

      console.log('Found asset to delete:', { 
        fileUrl, 
        assetId: asset.id, 
        assetTitle: asset.title 
      })

      // Gunakan asset ID, bukan file URL
      await apiRequest(
        'DELETE',
        `/api/assets/${asset.id}`
      )
      toast.success("File berhasil dihapus")
      
      // Update existing assets
      setExistingAssets(prev => prev.filter(file => file.id !== asset.id))
    } catch (error) {
      console.error("Error deleting file:", error)
      toast.error("Gagal menghapus file")
    }
  }

  const onSubmit = async (values: z.infer<typeof blogSchema>) => {
    try {
      setIsSubmitting(true)
      console.log('Updating blog with ID:', resolvedParams.id)
      console.log('Form values:', values)
      console.log('New files to upload:', files.length)
      console.log('Existing files count:', existingAssets.length)
      
      if (!userData?.id) {
        throw new Error('User ID tidak ditemukan')
      }

      // Update blog data (seperti trips/galleries - tanpa headers Content-Type)
      const blogData = {
        title: values.title,
        content: values.content,
        status: values.status,
        category: values.category,
        author_id: userData.id
      }

      console.log('Sending PUT request to API with payload:', blogData)
      
      await apiRequest(
        'PUT',
        `/api/blogs/${resolvedParams.id}`,
        blogData
      )

      console.log('Blog data updated successfully')

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
        formData.append('model_type', 'blog')
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
      toast.success("Blog berhasil diperbarui")
      
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
      console.error("Error updating blog:", error)
      setUploadProgress(null) // Tutup progress indicator saat error
      
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response: { data?: { message?: string }, statusText?: string } }
        console.error("API Error Response:", apiError.response.data)
        toast.error(`Gagal mengupdate blog: ${apiError.response.data?.message || apiError.response.statusText}`)
      } else if (error && typeof error === 'object' && 'request' in error) {
        console.error("Network Error:", error)
        toast.error("Gagal mengupdate blog: Tidak dapat terhubung ke server")
      } else {
        console.error("Other Error:", error)
        toast.error("Gagal mengupdate blog: Terjadi kesalahan yang tidak diketahui")
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
          <h1 className="text-3xl font-bold text-gray-900">Edit Blog</h1>
          <p className="text-gray-500 mt-2">Perbarui informasi blog</p>
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
                    existingFiles={existingAssets.map(asset => ({
                      file_url: asset.file_url,
                      title: asset.title || '',
                      description: asset.description || ''
                    }))}
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
