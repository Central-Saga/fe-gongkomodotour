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
import { Loader2, Plus, Trash } from "lucide-react"
import { toast } from "sonner"
import { apiRequest } from "@/lib/api"
import { FileUpload } from "@/components/ui/file-upload"
import { ApiResponse } from "@/types/role"
import { TipTapEditor } from "@/components/ui/tiptap-editor"
import { Boat, BoatAsset } from "@/types/boats"
import { use } from "react"
import { deleteAssetByFileUrl } from "@/lib/assetHelpers"

const boatSchema = z.object({
  boat_name: z.string().min(1, "Nama kapal harus diisi"),
  spesification: z.string().min(1, "Spesifikasi harus diisi"),
  cabin_information: z.string().min(1, "Informasi kabin harus diisi"),
  facilities: z.string().min(1, "Fasilitas harus diisi"),
  status: z.enum(["Aktif", "Non Aktif"]),
  cabins: z.array(z.object({
    id: z.number().optional(), // 🔑 ID cabin (opsional untuk create, required untuk edit)
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

interface EditBoatPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditBoatPage({ params }: EditBoatPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [files, setFiles] = useState<File[]>([])
  const [fileTitles, setFileTitles] = useState<string[]>([])
  const [fileDescriptions, setFileDescriptions] = useState<string[]>([])
  const [cabinFiles, setCabinFiles] = useState<Record<number, File[]>>({})
  const [cabinFileTitles, setCabinFileTitles] = useState<Record<number, string[]>>({})
  const [cabinFileDescriptions, setCabinFileDescriptions] = useState<Record<number, string[]>>({})
  const [existingBoatAssets, setExistingBoatAssets] = useState<BoatAsset[]>([])
  const [existingCabinAssets, setExistingCabinAssets] = useState<Record<number, BoatAsset[]>>({})

  const form = useForm<z.infer<typeof boatSchema>>({
    resolver: zodResolver(boatSchema),
    defaultValues: {
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
  })

  useEffect(() => {
    const fetchBoat = async () => {
      try {
        setIsLoading(true)
        const response = await apiRequest<ApiResponse<Boat>>(
          'GET',
          `/api/boats/${resolvedParams.id}`
        )

        if (!response || !response.data) {
          throw new Error('Data kapal tidak ditemukan')
        }

        const boat = response.data
        
        // Set form values dengan cabin ID yang lengkap
        form.reset({
          boat_name: boat.boat_name,
          spesification: boat.spesification,
          cabin_information: boat.cabin_information,
          facilities: boat.facilities,
          status: boat.status,
          cabins: boat.cabin.map(cabin => ({
            id: cabin.id, // 🔑 INI YANG KURANG!
            cabin_name: cabin.cabin_name,
            bed_type: cabin.bed_type,
            bathroom: cabin.bathroom || "",
            min_pax: cabin.min_pax,
            max_pax: cabin.max_pax,
            base_price: Number(cabin.base_price),
            additional_price: Number(cabin.additional_price),
            status: cabin.status
          }))
        })

        // Set existing assets
        setExistingBoatAssets(boat.assets || [])
        
        // Set existing cabin assets
        const cabinAssets: Record<number, BoatAsset[]> = {}
        boat.cabin.forEach((cabin, index) => {
          if (cabin.assets && cabin.assets.length > 0) {
            cabinAssets[index] = cabin.assets
          }
        })
        setExistingCabinAssets(cabinAssets)

      } catch (error) {
        console.error('Error fetching boat:', error)
        toast.error("Gagal mengambil data kapal")
        router.push("/dashboard/boats")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBoat()
  }, [resolvedParams.id, form, router])



  // PERBAIKAN: Fungsi handleFileDelete yang diperbaiki
  // Sebelumnya: menggunakan encodeURIComponent(fileUrl) yang menyebabkan error route
  // Sekarang: menggunakan helper function yang mencari asset berdasarkan file_url
  const handleFileDelete = async (fileUrl: string) => {
    try {
      // Cari asset berdasarkan file_url di boat assets
      let deletedAsset = await deleteAssetByFileUrl(fileUrl, existingBoatAssets)
      
      // Jika tidak ditemukan di boat assets, cek di cabin assets
      if (!deletedAsset) {
        for (const cabinIndex in existingCabinAssets) {
          const cabinAssets = existingCabinAssets[Number(cabinIndex)]
          deletedAsset = await deleteAssetByFileUrl(fileUrl, cabinAssets)
          if (deletedAsset) break
        }
      }
      
      if (!deletedAsset) {
        toast.error("Asset tidak ditemukan")
        return
      }
      
      toast.success("File berhasil dihapus")
      
      // Update existing assets lists
      setExistingBoatAssets(prev => prev.filter(existingAsset => existingAsset.id !== deletedAsset!.id))
      const updatedCabinAssets = { ...existingCabinAssets }
      Object.keys(updatedCabinAssets).forEach(index => {
        updatedCabinAssets[Number(index)] = updatedCabinAssets[Number(index)].filter(
          existingAsset => existingAsset.id !== deletedAsset!.id
        )
      })
      setExistingCabinAssets(updatedCabinAssets)
    } catch (error) {
      console.error("Error deleting file:", error)
      toast.error("Gagal menghapus file")
    }
  }

  const onSubmit = async (values: z.infer<typeof boatSchema>) => {
    try {
      setIsSubmitting(true)
      
      // Update boat data dengan cabin ID yang lengkap
      const boatData = {
        boat_name: values.boat_name,
        spesification: values.spesification,
        cabin_information: values.cabin_information,
        facilities: values.facilities,
        status: values.status,
        cabins: values.cabins.map(cabin => ({
          id: cabin.id, // 🔑 INI YANG KURANG!
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

      // Debug: Log data yang akan dikirim
      console.log('🚢 Data boat yang akan dikirim:', boatData)
      console.log('🔑 Boat ID:', resolvedParams.id)
      console.log('🏠 Cabins dengan ID:', boatData.cabins.map(c => ({ id: c.id, name: c.cabin_name })))

      const response = await apiRequest<ApiResponse<{ id: number, cabin: Array<{ id: number }> }>>(
        'PUT',
        `/api/boats/${resolvedParams.id}`,
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

      // Upload new boat files if any
      if (files.length > 0) {
        const formData = new FormData()
        formData.append('model_type', 'boat')
        formData.append('model_id', boatId.toString())
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

      // Upload new cabin files if any
      for (const [cabinIndex, cabinFilesList] of Object.entries(cabinFiles)) {
        if (cabinFilesList.length > 0) {
          const cabin = cabins[parseInt(cabinIndex)]
          if (!cabin || !cabin.id) {
            console.warn(`Cabin dengan index ${cabinIndex} tidak ditemukan`)
            continue
          }
          
          const cabinId = cabin.id
          
          const formData = new FormData()
          formData.append('model_type', 'cabin')
          formData.append('model_id', cabinId.toString())
          formData.append('is_external', '0')
          
          cabinFilesList.forEach((file: File, index: number) => {
            formData.append('files[]', file)
            formData.append('file_titles[]', cabinFileTitles[parseInt(cabinIndex)][index])
            formData.append('file_descriptions[]', cabinFileDescriptions[parseInt(cabinIndex)][index] || '')
          })

          try {
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
          } catch (error) {
            console.error(`Error saat mengupload file untuk cabin ${cabinId}:`, error)
          }
        }
      }

      toast.success("Kapal berhasil diperbarui")
      router.push("/dashboard/boats")
      router.refresh()
    } catch (error: unknown) {
      console.error('Error detail:', error)
      toast.error("Gagal memperbarui kapal")
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
          <h1 className="text-3xl font-bold text-gray-900">Edit Kapal</h1>
          <p className="text-gray-500 mt-2">Ubah informasi kapal sesuai kebutuhan</p>
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
                                  />
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
                                  />
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
                            existingFiles={existingCabinAssets[index] || []}
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
                            maxSize={10 * 1024 * 1024} // 2MB
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
                    existingFiles={existingBoatAssets}
                    onUpload={async (files, titles, descriptions) => {
                      setFiles(files)
                      setFileTitles(titles)
                      setFileDescriptions(descriptions)
                    }}
                    onDelete={handleFileDelete}
                    maxFiles={5}
                    maxSize={10 * 1024 * 1024} // 2MB
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
