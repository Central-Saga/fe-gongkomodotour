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
import { Textarea } from "@/components/ui/textarea"
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
import { Loader2, Plus, Trash } from "lucide-react"
import { toast } from "sonner"
import { apiRequest } from "@/lib/api"
import { FileUpload } from "@/components/ui/file-upload"
import { ApiResponse } from "@/types/role"

const tripSchema = z.object({
  name: z.string().min(1, "Nama trip harus diisi"),
  type: z.enum(["Open Trip", "Private Trip"]),
  status: z.enum(["Aktif", "Non Aktif"]),
  include: z.string().min(1, "Include harus diisi"),
  exclude: z.string().min(1, "Exclude harus diisi"),
  note: z.string().optional(),
  meeting_point: z.string().min(1, "Meeting point harus diisi"),
  start_time: z.string()
    .min(1, "Waktu mulai harus diisi")
    .transform(val => val ? `${val}` : val),
  end_time: z.string()
    .min(1, "Waktu selesai harus diisi")
    .transform(val => val ? `${val}` : val),
  itineraries: z.array(z.object({
    day_number: z.number().min(1, "Hari harus diisi"),
    activities: z.string().min(1, "Aktivitas harus diisi")
  })),
  flight_schedules: z.array(z.object({
    route: z.string().min(1, "Rute harus diisi"),
    etd_time: z.string()
      .min(1, "ETD harus diisi")
      .transform(val => val ? `${val}` : val),
    eta_time: z.string()
      .min(1, "ETA harus diisi")
      .transform(val => val ? `${val}` : val),
    etd_text: z.string().min(1, "ETD text harus diisi"),
    eta_text: z.string().min(1, "ETA text harus diisi")
  })),
  trip_durations: z.array(z.object({
    duration_label: z.string().min(1, "Label durasi harus diisi"),
    duration_days: z.number().min(1, "Jumlah hari harus diisi"),
    duration_nights: z.number().min(0, "Jumlah malam harus diisi"),
    status: z.enum(["Aktif", "Non Aktif"]),
    prices: z.array(z.object({
      pax_min: z.number().min(1, "Minimal pax harus diisi"),
      pax_max: z.number().min(1, "Maksimal pax harus diisi"),
      price_per_pax: z.string().min(1, "Harga per pax harus diisi"),
      status: z.enum(["Aktif", "Non Aktif"])
    }))
  })),
  additional_fees: z.array(z.object({
    fee_category: z.string().min(1, "Kategori fee harus diisi"),
    price: z.number().min(0, "Harga harus diisi"),
    region: z.enum(["Domestic", "Overseas", "Domestic & Overseas"]),
    unit: z.enum(["per_pax", "per_5pax", "per_day", "per_day_guide"]),
    pax_min: z.number().min(1, "Minimal pax harus diisi"),
    pax_max: z.number().min(1, "Maksimal pax harus diisi"),
    day_type: z.enum(["Weekday", "Weekend"]).nullable(),
    is_required: z.boolean(),
    status: z.enum(["Aktif", "Non Aktif"])
  })),
  surcharges: z.array(z.object({
    season: z.string().min(1, "Nama musim harus diisi"),
    start_date: z.string().min(1, "Tanggal mulai harus diisi"),
    end_date: z.string().min(1, "Tanggal selesai harus diisi"),
    surcharge_price: z.number().min(0, "Harga surcharge harus diisi"),
    status: z.enum(["Aktif", "Non Aktif"])
  }))
})

export default function CreateTripPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [fileTitles, setFileTitles] = useState<string[]>([])
  const [fileDescriptions, setFileDescriptions] = useState<string[]>([])

  const defaultValues: z.infer<typeof tripSchema> = {
    name: "",
    type: "Open Trip",
    status: "Aktif",
    include: "",
    exclude: "",
    note: "",
    meeting_point: "",
    start_time: "",
    end_time: "",
    itineraries: [{ day_number: 1, activities: "" }],
    flight_schedules: [{ 
      route: "", 
      etd_time: "", 
      eta_time: "", 
      etd_text: "",
      eta_text: "" 
    }],
    trip_durations: [{
      duration_label: "",
      duration_days: 1,
      duration_nights: 0,
      status: "Aktif",
      prices: [{
        pax_min: 1,
        pax_max: 1,
        price_per_pax: "",
        status: "Aktif"
      }]
    }],
    additional_fees: [{
      fee_category: "",
      price: 0,
      region: "Domestic",
      unit: "per_day",
      pax_min: 1,
      pax_max: 1,
      day_type: "Weekday",
      is_required: false,
      status: "Aktif"
    }],
    surcharges: [{
      season: "",
      start_date: "",
      end_date: "",
      surcharge_price: 0,
      status: "Aktif"
    }]
  }

  const form = useForm<z.infer<typeof tripSchema>>({
    resolver: zodResolver(tripSchema),
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

  const onSubmit = async (values: z.infer<typeof tripSchema>) => {
    try {
      setIsSubmitting(true)
      
      // 1. Create trip dulu untuk mendapatkan trip_id
      const response = await apiRequest(
        'POST',
        '/api/trips',
        values
      )

      if (response) {
        const tripId = (response as ApiResponse<{ id: number }>).data.id

        // 2. Upload files jika ada
        if (files.length > 0) {
          const formData = new FormData()
          formData.append('model_type', 'trip')
          formData.append('model_id', tripId.toString())
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

        toast.success("Trip berhasil dibuat")
        router.push("/dashboard/trips")
        router.refresh()
      }
    } catch (error) {
      toast.error("Gagal membuat trip")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tambah Trip Baru</h1>
          <p className="text-gray-500 mt-2">Isi informasi trip dengan lengkap</p>
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
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Trip</FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan nama trip" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipe Trip</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih tipe trip" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Open Trip">Open Trip</SelectItem>
                              <SelectItem value="Private Trip">Private Trip</SelectItem>
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

                    <FormField
                      control={form.control}
                      name="meeting_point"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meeting Point</FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan meeting point" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="start_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Waktu Mulai</FormLabel>
                          <FormControl>
                            <Input 
                              type="time" 
                              step="1"
                              {...field}
                              value={field.value ? field.value.substring(0, 8) : ""}
                              onChange={(e) => {
                                const time = e.target.value;
                                if (time) {
                                  // Pastikan format waktu selalu HH:mm:ss
                                  const [hours, minutes] = time.split(':');
                                  field.onChange(`${hours}:${minutes}:00`);
                                } else {
                                  field.onChange("");
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
                      name="end_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Waktu Selesai</FormLabel>
                          <FormControl>
                            <Input 
                              type="time" 
                              step="1"
                              {...field}
                              value={field.value ? field.value.substring(0, 8) : ""}
                              onChange={(e) => {
                                const time = e.target.value;
                                if (time) {
                                  // Pastikan format waktu selalu HH:mm:ss
                                  const [hours, minutes] = time.split(':');
                                  field.onChange(`${hours}:${minutes}:00`);
                                } else {
                                  field.onChange("");
                                }
                              }}
                            />
                          </FormControl>
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
                      name="include"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Include</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Masukkan fasilitas yang termasuk dalam trip"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="exclude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exclude</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Masukkan fasilitas yang tidak termasuk dalam trip"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="note"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Catatan</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Masukkan catatan tambahan (opsional)"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Itinerary */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Itinerary</h2>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentItineraries = form.getValues("itineraries")
                        form.setValue("itineraries", [
                          ...currentItineraries,
                          {
                            day_number: currentItineraries.length + 1,
                            activities: ""
                          }
                        ])
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Hari
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {form.watch("itineraries").map((_, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">Hari {index + 1}</h3>
                          {index > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const currentItineraries = form.getValues("itineraries")
                                form.setValue("itineraries", 
                                  currentItineraries.filter((_, i) => i !== index)
                                )
                              }}
                            >
                              <Trash className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </div>

                        <FormField
                          control={form.control}
                          name={`itineraries.${index}.activities`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Aktivitas</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Masukkan detail aktivitas"
                                  className="min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Flight Schedules */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Jadwal Penerbangan</h2>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentSchedules = form.getValues("flight_schedules")
                        form.setValue("flight_schedules", [
                          ...currentSchedules,
                          {
                            route: "",
                            etd_time: "",
                            eta_time: "",
                            etd_text: "",
                            eta_text: ""
                          }
                        ])
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Jadwal
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {form.watch("flight_schedules").map((_, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">Jadwal {index + 1}</h3>
                          {index > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const currentSchedules = form.getValues("flight_schedules")
                                form.setValue("flight_schedules", 
                                  currentSchedules.filter((_, i) => i !== index)
                                )
                              }}
                            >
                              <Trash className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-5 gap-4">
                          <FormField
                            control={form.control}
                            name={`flight_schedules.${index}.route`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Rute</FormLabel>
                                <FormControl>
                                  <Input placeholder="CGK - DPS" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`flight_schedules.${index}.etd_time`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ETD</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="time" 
                                    {...field}
                                    value={field.value ? field.value.substring(0, 5) : ""}
                                    onChange={(e) => {
                                      const time = e.target.value;
                                      if (time) {
                                        field.onChange(`${time}:00`);
                                      } else {
                                        field.onChange("");
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
                            name={`flight_schedules.${index}.eta_time`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ETA</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="time" 
                                    {...field}
                                    value={field.value ? field.value.substring(0, 5) : ""}
                                    onChange={(e) => {
                                      const time = e.target.value;
                                      if (time) {
                                        field.onChange(`${time}:00`);
                                      } else {
                                        field.onChange("");
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
                            name={`flight_schedules.${index}.etd_text`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ETD Text</FormLabel>
                                <FormControl>
                                  <Input placeholder="Terminal 3" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`flight_schedules.${index}.eta_text`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ETA Text</FormLabel>
                                <FormControl>
                                  <Input placeholder="Terminal Domestik" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trip Durations & Prices */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Durasi & Harga</h2>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentDurations = form.getValues("trip_durations")
                        form.setValue("trip_durations", [
                          ...currentDurations,
                          {
                            duration_label: "",
                            duration_days: 1,
                            duration_nights: 0,
                            status: "Aktif",
                            prices: [{
                              pax_min: 1,
                              pax_max: 2,
                              price_per_pax: "",
                              status: "Aktif"
                            }]
                          }
                        ])
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Durasi
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {form.watch("trip_durations").map((duration, dIndex) => (
                      <div key={dIndex} className="p-4 bg-gray-50 rounded-lg space-y-6">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">Durasi {dIndex + 1}</h3>
                          {dIndex > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const currentDurations = form.getValues("trip_durations")
                                form.setValue("trip_durations", 
                                  currentDurations.filter((_, i) => i !== dIndex)
                                )
                              }}
                            >
                              <Trash className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                          <FormField
                            control={form.control}
                            name={`trip_durations.${dIndex}.duration_label`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Label Durasi</FormLabel>
                                <FormControl>
                                  <Input placeholder="Contoh: 3D2N" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`trip_durations.${dIndex}.duration_days`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Jumlah Hari</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min="1"
                                    {...field}
                                    onChange={e => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`trip_durations.${dIndex}.duration_nights`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Jumlah Malam</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number"
                                    min="0"
                                    {...field}
                                    onChange={e => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`trip_durations.${dIndex}.status`}
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

                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium">Harga per Pax</h4>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const currentPrices = form.getValues(`trip_durations.${dIndex}.prices`)
                                form.setValue(`trip_durations.${dIndex}.prices`, [
                                  ...currentPrices,
                                  {
                                    pax_min: currentPrices.length > 0 ? currentPrices[currentPrices.length - 1].pax_max + 1 : 1,
                                    pax_max: currentPrices.length > 0 ? currentPrices[currentPrices.length - 1].pax_max + 2 : 2,
                                    price_per_pax: "",
                                    status: "Aktif"
                                  }
                                ])
                              }}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Tambah Range Harga
                            </Button>
                          </div>

                          <div className="space-y-4">
                            {duration.prices.map((_, pIndex) => (
                              <div key={pIndex} className="grid grid-cols-5 gap-4 p-4 bg-white rounded-lg items-end">
                                <FormField
                                  control={form.control}
                                  name={`trip_durations.${dIndex}.prices.${pIndex}.pax_min`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Minimal Pax</FormLabel>
                                      <FormControl>
                                        <Input 
                                          type="number"
                                          min="1"
                                          {...field}
                                          onChange={e => field.onChange(parseInt(e.target.value))}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`trip_durations.${dIndex}.prices.${pIndex}.pax_max`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Maksimal Pax</FormLabel>
                                      <FormControl>
                                        <Input 
                                          type="number"
                                          min="1"
                                          {...field}
                                          onChange={e => field.onChange(parseInt(e.target.value))}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`trip_durations.${dIndex}.prices.${pIndex}.price_per_pax`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Harga per Pax</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Contoh: 1000000" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`trip_durations.${dIndex}.prices.${pIndex}.status`}
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

                                {pIndex > 0 && (
                                  <FormItem className="flex flex-col justify-center">
                                    <FormLabel className="invisible">Action</FormLabel>
                                    <div className="flex justify-center">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-10"
                                        onClick={() => {
                                          const currentPrices = form.getValues(`trip_durations.${dIndex}.prices`)
                                          form.setValue(
                                            `trip_durations.${dIndex}.prices`,
                                            currentPrices.filter((_, i) => i !== pIndex)
                                          )
                                        }}
                                      >
                                        <Trash className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </div>
                                  </FormItem>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Fees */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Additional Fees</h2>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentFees = form.getValues("additional_fees")
                        form.setValue("additional_fees", [
                          ...currentFees,
                          {
                            fee_category: "",
                            price: 0,
                            region: "Domestic",
                            unit: "per_day",
                            pax_min: 1,
                            pax_max: 1,
                            day_type: "Weekday",
                            is_required: false,
                            status: "Aktif"
                          }
                        ])
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Fee
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {form.watch("additional_fees").map((fee, fIndex) => (
                      <div key={fIndex} className="p-4 bg-gray-50 rounded-lg space-y-6">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">Fee {fIndex + 1}</h3>
                          {fIndex > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const currentFees = form.getValues("additional_fees")
                                form.setValue("additional_fees", 
                                  currentFees.filter((_, i) => i !== fIndex)
                                )
                              }}
                            >
                              <Trash className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-4 gap-4 mb-4">
                          <FormField
                            control={form.control}
                            name={`additional_fees.${fIndex}.fee_category`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Kategori Biaya</FormLabel>
                                <FormControl>
                                  <Input placeholder="Contoh: Parkir" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`additional_fees.${fIndex}.price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Harga</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number"
                                    min="0"
                                    placeholder="Contoh: 100000"
                                    {...field}
                                    onChange={(e) => {
                                      const value = e.target.value === '' ? 0 : Number(e.target.value);
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
                            name={`additional_fees.${fIndex}.region`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Wilayah</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Pilih wilayah" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Domestic">Domestik</SelectItem>
                                    <SelectItem value="Overseas">Luar Negeri</SelectItem>
                                    <SelectItem value="Domestic & Overseas">Domestik & Luar Negeri</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`additional_fees.${fIndex}.unit`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Satuan</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Pilih satuan" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="per_pax">Per Orang</SelectItem>
                                    <SelectItem value="per_5pax">Per 5 Orang</SelectItem>
                                    <SelectItem value="per_day">Per Hari</SelectItem>
                                    <SelectItem value="per_day_guide">Per Hari Guide</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <FormField
                            control={form.control}
                            name={`additional_fees.${fIndex}.pax_min`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Minimal Orang</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number"
                                    min="1"
                                    {...field}
                                    onChange={(e) => {
                                      const value = e.target.value === '' ? 1 : Number(e.target.value);
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
                            name={`additional_fees.${fIndex}.pax_max`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Maksimal Orang</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number"
                                    min="1"
                                    {...field}
                                    onChange={(e) => {
                                      const value = e.target.value === '' ? 1 : Number(e.target.value);
                                      field.onChange(value);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name={`additional_fees.${fIndex}.day_type`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tipe Hari</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  value={field.value || undefined}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Pilih tipe hari" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Weekday">Hari Kerja</SelectItem>
                                    <SelectItem value="Weekend">Akhir Pekan</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`additional_fees.${fIndex}.is_required`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Wajib</FormLabel>
                                <Select 
                                  onValueChange={(value) => field.onChange(value === "true")} 
                                  value={field.value ? "true" : "false"}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Pilih status" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="true">Ya</SelectItem>
                                    <SelectItem value="false">Tidak</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`additional_fees.${fIndex}.status`}
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
                    ))}
                  </div>
                </div>

                {/* Surcharges */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Surcharges</h2>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentSurcharges = form.getValues("surcharges")
                        form.setValue("surcharges", [
                          ...currentSurcharges,
                          {
                            season: "",
                            start_date: "",
                            end_date: "",
                            surcharge_price: 0,
                            status: "Aktif"
                          }
                        ])
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Surcharge
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {form.watch("surcharges").map((surcharge, sIndex) => (
                      <div key={sIndex} className="p-4 bg-gray-50 rounded-lg space-y-6">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">Surcharge {sIndex + 1}</h3>
                          {sIndex > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const currentSurcharges = form.getValues("surcharges")
                                form.setValue("surcharges", 
                                  currentSurcharges.filter((_, i) => i !== sIndex)
                                )
                              }}
                            >
                              <Trash className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                          <FormField
                            control={form.control}
                            name={`surcharges.${sIndex}.season`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Season</FormLabel>
                                <FormControl>
                                  <Input placeholder="Contoh: Musim Panas" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`surcharges.${sIndex}.start_date`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Start Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`surcharges.${sIndex}.end_date`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>End Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`surcharges.${sIndex}.surcharge_price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Surcharge Price</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number"
                                    min="0"
                                    {...field}
                                    onChange={e => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div>
                          <FormField
                            control={form.control}
                            name={`surcharges.${sIndex}.status`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Status</FormLabel>
                                <FormControl>
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
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* File Upload Section */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Gambar Trip</h2>
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
                    onClick={() => router.push("/dashboard/trips")}
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
