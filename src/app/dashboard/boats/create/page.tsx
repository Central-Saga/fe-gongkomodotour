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
import { Loader2, Plus, Trash, ChevronUp, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { apiRequest } from "@/lib/api"
import { FileUpload } from "@/components/ui/file-upload"
import { ApiResponse } from "@/types/role"
import { TipTapEditor } from "@/components/ui/tiptap-editor"
import { optimizeImages } from "@/lib/imageOptimization"

const boatSchema = z.object({
  boat_name: z.string().min(1, "Nama kapal harus diisi"),
  spesification: z.string().min(1, "Spesifikasi harus diisi"),
  cabin_information: z.string().min(1, "Informasi kabin harus diisi"),
  facilities: z.string().min(1, "Fasilitas harus diisi"),
  status: z.enum(["Aktif", "Non Aktif"]),
  cabins: z.array(z.object({
    cabin_name: z.string().min(1, "Nama kabin harus diisi"),
    bed_type: z.string().min(1, "Tipe bed harus diisi"),
    bathroom: z.string().optional(),
    min_pax: z.coerce.number().min(1, "Minimal pax harus diisi"),
    max_pax: z.coerce.number().min(1, "Maksimal pax harus diisi"),
    base_price: z.coerce.number().min(0, "Harga dasar harus diisi"),
    additional_price: z.coerce.number().min(0, "Harga tambahan harus diisi"),
    status: z.enum(["Aktif", "Non Aktif"])
  }))
})

export default function CreateBoatPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [fileTitles, setFileTitles] = useState<string[]>([])
  const [fileDescriptions, setFileDescriptions] = useState<string[]>([])
  const [cabinFiles, setCabinFiles] = useState<Record<number, File[]>>({})
  const [cabinFileTitles, setCabinFileTitles] = useState<Record<number, string[]>>({})
  const [cabinFileDescriptions, setCabinFileDescriptions] = useState<Record<number, string[]>>({})
  const [uploadProgress, setUploadProgress] = useState<{
    current: number
    total: number
    message: string
    stage: 'optimizing' | 'uploading'
  } | null>(null)

  const defaultValues: z.infer<typeof boatSchema> = {
    boat_name: "",
    spesification: "",
    cabin_information: "",
    facilities: "",
    status: "Aktif",
    cabins: [{
      cabin_name: "",
      bed_type: "",
      bathroom: "",
      min_pax: 1,
      max_pax: 1,
      base_price: 0,
      additional_price: 0,
      status: "Aktif"
    }]
  }

  const form = useForm<z.infer<typeof boatSchema>>({
    resolver: zodResolver(boatSchema),
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

  const onSubmit = async (values: z.infer<typeof boatSchema>) => {
    try {
      setIsSubmitting(true)
      
      // Log data yang akan dikirim
      console.log('Data yang akan dikirim:', values)
      
      // 1. Create boat dulu untuk mendapatkan boat_id
      const boatData = {
        boat_name: values.boat_name,
        spesification: values.spesification,
        cabin_information: values.cabin_information,
        facilities: values.facilities,
        status: values.status,
        cabins: values.cabins.map(cabin => ({
          cabin_name: cabin.cabin_name,
          bed_type: cabin.bed_type,
          bathroom: cabin.bathroom,
          min_pax: cabin.min_pax,
          max_pax: cabin.max_pax,
          base_price: cabin.base_price,
          additional_price: cabin.additional_price,
          status: cabin.status
        }))
      }

      console.log('Boat data yang akan dikirim:', boatData)

      const response = await apiRequest<ApiResponse<{ id: number, cabin: Array<{ id: number }> }>>(
        'POST',
        '/api/boats',
        boatData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response || !response.data) {
        throw new Error('Response tidak valid dari server')
      }

      const boatId = response.data.id
      const cabins = response.data.cabin || []

      console.log('Response dari API:', response.data)
      console.log('Cabins yang diterima:', cabins)

      if (!boatId) {
        throw new Error('ID kapal tidak ditemukan dalam response')
      }

      // 2. Upload boat files jika ada (dengan optimasi)
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
        formData.append('model_type', 'boat')
        formData.append('model_id', boatId.toString())
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
          console.log('Boat files uploaded successfully')
          setUploadProgress(null)
        } catch (uploadError: unknown) {
          console.error('Error uploading boat files:', uploadError)
          setUploadProgress(null)
          throw uploadError
        }
      }

      // 3. Upload cabin files jika ada (dengan optimasi)
      for (const [cabinIndex, cabinFilesList] of Object.entries(cabinFiles)) {
        if (cabinFilesList.length > 0) {
          const cabin = cabins[parseInt(cabinIndex)]
          if (!cabin || !cabin.id) {
            console.warn(`Cabin dengan index ${cabinIndex} tidak ditemukan`)
            continue
          }
          
          const cabinId = cabin.id
          console.log(`Mengupload file untuk cabin ${cabinId} dengan index ${cabinIndex}`)
          
          // Optimasi gambar sebelum upload
          setUploadProgress({
            current: 0,
            total: cabinFilesList.length,
            message: `Mengoptimasi gambar kabin ${cabinId}...`,
            stage: 'optimizing'
          })

          const optimizedCabinFiles = await optimizeImages(
            cabinFilesList,
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
                message: `Mengoptimasi gambar kabin ${cabinId} ${current}/${total}...`,
                stage: 'optimizing'
              })
            }
          )
          
          const formData = new FormData()
          formData.append('model_type', 'cabin')
          formData.append('model_id', cabinId.toString())
          formData.append('is_external', '0')
          
          setUploadProgress({
            current: 0,
            total: optimizedCabinFiles.length,
            message: `Mengupload gambar kabin ${cabinId}...`,
            stage: 'uploading'
          })
          
          optimizedCabinFiles.forEach((file: File, index: number) => {
            formData.append('files[]', file, file.name)
            formData.append('file_titles[]', cabinFileTitles[parseInt(cabinIndex)][index] || file.name)
            formData.append('file_descriptions[]', cabinFileDescriptions[parseInt(cabinIndex)][index] || '')
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
            console.log(`Cabin files uploaded successfully for cabin ${cabinId}`)
            setUploadProgress(null)
          } catch (error) {
            console.error(`Error saat mengupload file untuk cabin ${cabinId}:`, error)
            setUploadProgress(null)
            toast.error(`Gagal mengupload file untuk cabin ${cabinId}`)
          }
        }
      }

      setUploadProgress(null) // Tutup progress indicator saat sukses
      
      // Reset semua state file setelah submit berhasil
      setFiles([])
      setFileTitles([])
      setFileDescriptions([])
      setCabinFiles({})
      setCabinFileTitles({})
      setCabinFileDescriptions({})
      
      toast.success("Kapal berhasil dibuat")
      
      // Ambil pagination state dari sessionStorage
      let currentPage = '0'
      if (typeof window !== 'undefined') {
        currentPage = sessionStorage.getItem('boats_page') || '0'
        // Pastikan page index valid (0-based, jadi page 3 = index 2)
        const pageIndex = parseInt(currentPage, 10)
        if (isNaN(pageIndex) || pageIndex < 0) {
          currentPage = '0'
        }
        console.log('Redirecting after create - saved page:', currentPage)
      }
      
      // Redirect dengan URL parameter yang benar
      const redirectUrl = currentPage !== '0' ? `/dashboard/boats?page=${currentPage}` : '/dashboard/boats'
      console.log('Redirecting to:', redirectUrl, 'with page:', currentPage)
      
      // Gunakan window.location untuk memastikan full page reload dan restore pagination
      if (typeof window !== 'undefined') {
        window.location.href = redirectUrl
      } else {
        router.push(redirectUrl)
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
          toast.error(errorMessages.join(', ') || "Gagal membuat kapal")
        } else if (errorData?.message) {
          toast.error(errorData.message)
        } else {
          toast.error("Gagal membuat kapal")
        }
      } else if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as { message: string }).message
        if (errorMessage.includes('timeout')) {
          toast.error("Upload file timeout. Coba lagi dengan file yang lebih kecil atau periksa koneksi internet Anda.")
        } else {
          toast.error(errorMessage || "Gagal membuat kapal")
        }
      } else {
        toast.error("Gagal membuat kapal")
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
          <h1 className="text-3xl font-bold text-gray-900">Tambah Kapal Baru</h1>
          <p className="text-gray-500 mt-2">Isi informasi kapal dengan lengkap</p>
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
                      name="boat_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Kapal</FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan nama kapal" {...field} />
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

                {/* Description */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Deskripsi</h2>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="spesification"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Spesifikasi</FormLabel>
                          <FormControl>
                            <TipTapEditor
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Masukkan spesifikasi kapal"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cabin_information"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Informasi Kabin</FormLabel>
                          <FormControl>
                            <TipTapEditor
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Masukkan informasi kabin"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="facilities"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fasilitas</FormLabel>
                          <FormControl>
                            <TipTapEditor
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Masukkan fasilitas kapal"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Cabins */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Kabin</h2>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentCabins = form.getValues("cabins")
                        form.setValue("cabins", [
                          ...currentCabins,
                          {
                            cabin_name: "",
                            bed_type: "",
                            bathroom: "",
                            min_pax: 1,
                            max_pax: 1,
                            base_price: 0,
                            additional_price: 0,
                            status: "Aktif"
                          }
                        ])
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Kabin
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {form.watch("cabins").map((_, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">Kabin {index + 1}</h3>
                          {index > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const currentCabins = form.getValues("cabins")
                                form.setValue("cabins", 
                                  currentCabins.filter((_, i) => i !== index)
                                )
                              }}
                            >
                              <Trash className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <FormField
                            control={form.control}
                            name={`cabins.${index}.cabin_name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nama Kabin</FormLabel>
                                <FormControl>
                                  <Input placeholder="Masukkan nama kabin" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`cabins.${index}.bed_type`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tipe Bed</FormLabel>
                                <FormControl>
                                  <Input placeholder="Masukkan tipe bed" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`cabins.${index}.bathroom`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bathroom</FormLabel>
                                <FormControl>
                                  <Input placeholder="Masukkan informasi bathroom" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`cabins.${index}.min_pax`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Minimal Pax</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min="1"
                                    step="1"
                                    value={field.value ?? 1}
                                    onChange={e => {
                                      const value = e.target.value;
                                      if (value === '') {
                                        field.onChange(1);
                                      } else {
                                        const numValue = Number(value);
                                        if (!isNaN(numValue) && numValue >= 1) {
                                          field.onChange(numValue);
                                        }
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <FormField
                            control={form.control}
                            name={`cabins.${index}.max_pax`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Maksimal Pax</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min="1"
                                    step="1"
                                    value={field.value ?? 1}
                                    onChange={e => {
                                      const value = e.target.value;
                                      if (value === '') {
                                        field.onChange(1);
                                      } else {
                                        const numValue = Number(value);
                                        if (!isNaN(numValue) && numValue >= 1) {
                                          field.onChange(numValue);
                                        }
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name={`cabins.${index}.base_price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Harga Dasar</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input 
                                      type="number" 
                                      min="0"
                                      step="1"
                                      value={field.value ?? 0}
                                      onChange={e => {
                                        const value = e.target.value;
                                        if (value === '') {
                                          field.onChange(0);
                                        } else {
                                          const numValue = Number(value);
                                          if (!isNaN(numValue) && numValue >= 0) {
                                            field.onChange(numValue);
                                          }
                                        }
                                      }}
                                      onWheel={(e) => e.currentTarget.blur()}
                                      className="pr-8"
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col">
                                      <button
                                        type="button"
                                        onClick={() => field.onChange((field.value ?? 0) + 1)}
                                        className="h-3 w-4 flex items-center justify-center hover:bg-gray-100 rounded-t"
                                        tabIndex={-1}
                                      >
                                        <ChevronUp className="h-3 w-3 text-gray-500" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => field.onChange(Math.max(0, (field.value ?? 0) - 1))}
                                        className="h-3 w-4 flex items-center justify-center hover:bg-gray-100 rounded-b"
                                        tabIndex={-1}
                                      >
                                        <ChevronDown className="h-3 w-3 text-gray-500" />
                                      </button>
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`cabins.${index}.additional_price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Harga Tambahan</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input 
                                      type="number" 
                                      min="0"
                                      step="1"
                                      value={field.value ?? 0}
                                      onChange={e => {
                                        const value = e.target.value;
                                        if (value === '') {
                                          field.onChange(0);
                                        } else {
                                          const numValue = Number(value);
                                          if (!isNaN(numValue) && numValue >= 0) {
                                            field.onChange(numValue);
                                          }
                                        }
                                      }}
                                      onWheel={(e) => e.currentTarget.blur()}
                                      className="pr-8"
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col">
                                      <button
                                        type="button"
                                        onClick={() => field.onChange((field.value ?? 0) + 1)}
                                        className="h-3 w-4 flex items-center justify-center hover:bg-gray-100 rounded-t"
                                        tabIndex={-1}
                                      >
                                        <ChevronUp className="h-3 w-3 text-gray-500" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => field.onChange(Math.max(0, (field.value ?? 0) - 1))}
                                        className="h-3 w-4 flex items-center justify-center hover:bg-gray-100 rounded-b"
                                        tabIndex={-1}
                                      >
                                        <ChevronDown className="h-3 w-3 text-gray-500" />
                                      </button>
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`cabins.${index}.status`}
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

                        {/* Cabin File Upload Section */}
                        <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                          <h3 className="font-medium">Gambar Kabin {index + 1}</h3>
                          <FileUpload
                            onUpload={async (files, titles, descriptions) => {
                              setCabinFiles(prev => ({
                                ...prev,
                                [index]: files
                              }))
                              setCabinFileTitles(prev => ({
                                ...prev,
                                [index]: titles
                              }))
                              setCabinFileDescriptions(prev => ({
                                ...prev,
                                [index]: descriptions
                              }))
                            }}
                            onDelete={handleFileDelete}
                            maxFiles={3}
                            maxSize={10 * 1024 * 1024} // 10MB
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* File Upload Section */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Gambar Kapal</h2>
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
                    onClick={() => router.push("/dashboard/boats")}
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
