"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, Plus, Trash } from "lucide-react"
import { apiRequest } from "@/lib/api"
import { Trip } from "@/types/trips"
import { ApiResponse } from "@/types/role"

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

// Menggunakan schema yang sama dengan create
const tripSchema = z.object({
  name: z.string().min(1, "Nama trip harus diisi"),
  type: z.enum(["Open Trip", "Private Trip"]),
  status: z.enum(["Aktif", "Non Aktif"]),
  include: z.string().min(1, "Include harus diisi"),
  exclude: z.string().min(1, "Exclude harus diisi"),
  note: z.string().optional(),
  meeting_point: z.string().min(1, "Meeting point harus diisi"),
  start_time: z.string().min(1, "Waktu mulai harus diisi"),
  end_time: z.string().min(1, "Waktu selesai harus diisi"),
  itineraries: z.array(z.object({
    day_number: z.number().min(1, "Hari harus diisi"),
    activities: z.string().min(1, "Aktivitas harus diisi")
  })),
  flight_schedules: z.array(z.object({
    route: z.string().min(1, "Rute harus diisi"),
    etd_time: z.string().min(1, "ETD harus diisi"),
    eta_time: z.string().min(1, "ETA harus diisi"),
    etd_text: z.string().min(1, "ETD text harus diisi"),
    eta_text: z.string().min(1, "ETA text harus diisi")
  })),
  trip_durations: z.array(z.object({
    duration_label: z.string().min(1, "Label durasi harus diisi"),
    duration_days: z.number().min(1, "Jumlah hari harus diisi"),
    duration_nights: z.number().min(0, "Jumlah malam harus diisi"),
    status: z.enum(["Aktif", "Non Aktif"]),
    trip_prices: z.array(z.object({
      pax_min: z.number().min(1, "Minimal pax harus diisi"),
      pax_max: z.number().min(1, "Maksimal pax harus diisi"),
      price_per_pax: z.string().min(1, "Harga per pax harus diisi"),
      status: z.enum(["Aktif", "Non Aktif"])
    }))
  }))
})

export default function EditTripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof tripSchema>>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      type: "Open Trip",
      status: "Aktif",
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
        trip_prices: [{
          pax_min: 1,
          pax_max: 1,
          price_per_pax: "",
          status: "Aktif"
        }]
      }]
    }
  })

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setIsLoading(true)
        console.log('Fetching trip with ID:', id)
        const response = await apiRequest<ApiResponse<Trip>>(
          'GET',
          `/api/trips/${id}`
        )
        
        console.log('Raw API Response:', response)

        if (!response) {
          throw new Error("Data trip tidak ditemukan")
        }

        // Pastikan response memiliki data property
        if (!response.data) {
          throw new Error("Format data tidak valid")
        }
        
        // Validasi data sebelum direset ke form
        try {
          const validatedData = tripSchema.parse(response.data)
          console.log('Validated data:', validatedData)
          form.reset(validatedData)
        } catch (validationError) {
          console.error("Validation error:", validationError)
          throw new Error("Data trip tidak valid")
        }
      } catch (error) {
        console.error("Error fetching trip:", error)
        toast.error(error instanceof Error ? error.message : "Gagal mengambil data trip")
        router.push("/dashboard/trips")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrip()
  }, [id, form, router])

  const onSubmit = async (values: z.infer<typeof tripSchema>) => {
    try {
      setIsSubmitting(true)
      console.log('Updating trip with ID:', id)
      console.log('Update data:', values)
      
      await apiRequest(
        'PUT',
        `/api/trips/${id}`,
        values
      )

      toast.success("Trip berhasil diupdate")
      router.push("/dashboard/trips")
      router.refresh()
    } catch (error) {
      console.error("Error updating trip:", error)
      toast.error(error instanceof Error ? error.message : "Gagal mengupdate trip")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Trip</h1>
          <p className="text-gray-500 mt-2">Edit informasi trip</p>
        </div>

        <div className="mx-auto bg-white rounded-xl shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-8">
              <div className="space-y-8">
                {/* Basic Information */}
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
                            <Input type="time" {...field} />
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
                            <Input type="time" {...field} />
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
                              placeholder="Masukkan catatan tambahan"
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
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Itinerary</h2>
                  <div className="space-y-6">
                    {form.watch("itineraries").map((_, index) => (
                      <div key={index} className="flex gap-4 mb-4">
                        <FormField
                          control={form.control}
                          name={`itineraries.${index}.day_number`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Hari ke-{index + 1}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  placeholder="Masukkan nomor hari"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`itineraries.${index}.activities`}
                          render={({ field }) => (
                            <FormItem className="flex-[3]">
                              <FormLabel>Aktivitas</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Masukkan aktivitas"
                                  className="min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="mt-8"
                          onClick={() => {
                            const current = form.getValues("itineraries")
                            if (current.length > 1) {
                              form.setValue("itineraries", current.filter((_, i) => i !== index))
                            }
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const current = form.getValues("itineraries")
                        form.setValue("itineraries", [
                          ...current,
                          { day_number: current.length + 1, activities: "" }
                        ])
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Itinerary
                    </Button>
                  </div>
                </div>

                {/* Flight Schedules */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Jadwal Penerbangan</h2>
                  <div className="space-y-6">
                    {form.watch("flight_schedules").map((_, index) => (
                      <div key={index} className="grid grid-cols-5 gap-4 mb-4">
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
                                <Input type="time" {...field} />
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
                                <Input type="time" {...field} />
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
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="mb-2"
                            onClick={() => {
                              const current = form.getValues("flight_schedules")
                              if (current.length > 1) {
                                form.setValue("flight_schedules", current.filter((_, i) => i !== index))
                              }
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const current = form.getValues("flight_schedules")
                        form.setValue("flight_schedules", [
                          ...current,
                          { route: "", etd_time: "", eta_time: "", etd_text: "", eta_text: "" }
                        ])
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Jadwal Penerbangan
                    </Button>
                  </div>
                </div>

                {/* Trip Durations */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Durasi & Harga</h2>
                  <div className="space-y-6">
                    {form.watch("trip_durations").map((duration, durationIndex) => (
                      <div key={durationIndex} className="border rounded-lg p-6 mb-6">
                        <div className="grid grid-cols-4 gap-4 mb-4">
                          <FormField
                            control={form.control}
                            name={`trip_durations.${durationIndex}.duration_label`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Label Durasi</FormLabel>
                                <FormControl>
                                  <Input placeholder="Weekend" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`trip_durations.${durationIndex}.duration_days`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Jumlah Hari</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={1}
                                    placeholder="3"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`trip_durations.${durationIndex}.duration_nights`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Jumlah Malam</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={0}
                                    placeholder="2"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`trip_durations.${durationIndex}.status`}
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
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-medium">Harga per Pax</h4>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const current = form.getValues(`trip_durations.${durationIndex}.trip_prices`)
                                form.setValue(`trip_durations.${durationIndex}.trip_prices`, [
                                  ...current,
                                  {
                                    pax_min: current.length > 0 ? current[current.length - 1].pax_max + 1 : 1,
                                    pax_max: current.length > 0 ? current[current.length - 1].pax_max + 2 : 2,
                                    price_per_pax: "",
                                    status: "Aktif"
                                  }
                                ])
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Tambah Range Harga
                            </Button>
                          </div>

                          {form.watch(`trip_durations.${durationIndex}.trip_prices`).map((_, priceIndex) => (
                            <div key={priceIndex} className="grid grid-cols-4 gap-4 mb-4">
                              <FormField
                                control={form.control}
                                name={`trip_durations.${durationIndex}.trip_prices.${priceIndex}.pax_min`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Minimal Pax</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min={1}
                                        placeholder="1"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`trip_durations.${durationIndex}.trip_prices.${priceIndex}.pax_max`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Maksimal Pax</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min={1}
                                        placeholder="2"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`trip_durations.${durationIndex}.trip_prices.${priceIndex}.price_per_pax`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Harga per Pax</FormLabel>
                                    <FormControl>
                                      <Input placeholder="2000000" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`trip_durations.${durationIndex}.trip_prices.${priceIndex}.status`}
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
                          ))}
                        </div>

                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              const current = form.getValues("trip_durations")
                              if (current.length > 1) {
                                form.setValue("trip_durations", current.filter((_, i) => i !== durationIndex))
                              }
                            }}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Hapus Durasi
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const current = form.getValues("trip_durations")
                        form.setValue("trip_durations", [
                          ...current,
                          {
                            duration_label: "",
                            duration_days: 1,
                            duration_nights: 0,
                            status: "Aktif",
                            trip_prices: [{
                              pax_min: 1,
                              pax_max: 2,
                              price_per_pax: "",
                              status: "Aktif"
                            }]
                          }
                        ])
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Durasi Trip
                    </Button>
                  </div>
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
