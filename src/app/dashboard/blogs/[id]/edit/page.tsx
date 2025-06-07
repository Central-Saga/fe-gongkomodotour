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
import { Blog, BlogAsset } from "@/types/blog"
import { use } from "react"

interface UserData {
  id: number
  name: string
  email: string
}

const blogSchema = z.object({
  title: z.string().min(1, "Judul harus diisi"),
  content: z.string().min(1, "Konten harus diisi"),
  status: z.enum(["published", "draft"]),
  category: z.enum(["trips", "travel", "tips"])
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
  const [existingAssets, setExistingAssets] = useState<BlogAsset[]>([])
  const [userData, setUserData] = useState<UserData | null>(null)

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

  const onSubmit = async (values: z.infer<typeof blogSchema>) => {
    try {
      setIsSubmitting(true)
      
      if (!userData?.id) {
        throw new Error('User ID tidak ditemukan')
      }

      // Update blog data
      const blogData = {
        title: values.title,
        content: values.content,
        status: values.status,
        category: values.category,
        author_id: userData.id
      }

      const response = await apiRequest<ApiResponse<{ id: number }>>(
        'PUT',
        `/api/blogs/${resolvedParams.id}`,
        blogData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response || !response.data) {
        throw new Error('Response tidak valid dari server')
      }

      // Upload new files if any
      if (files.length > 0) {
        const formData = new FormData()
        formData.append('model_type', 'blog')
        formData.append('model_id', resolvedParams.id)
        formData.append('is_external', '0')
        
        files.forEach((file: File, index: number) => {
          formData.append('files[]', file)
          formData.append('file_titles[]', fileTitles[index])
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

      toast.success("Blog berhasil diperbarui")
      router.push("/dashboard/blogs")
      router.refresh()
    } catch (error: unknown) {
      console.error('Error detail:', error)
      toast.error("Gagal memperbarui blog")
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
                      description: null
                    }))}
                    onUpload={async (files, titles) => {
                      setFiles(files)
                      setFileTitles(titles)
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
