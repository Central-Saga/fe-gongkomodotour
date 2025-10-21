"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, Plus, Trash } from "lucide-react"
import { apiRequest } from "@/lib/api"
import { Trip, TripAsset } from "@/types/trips"
import { ApiResponse } from "@/types/role"
import { FileUpload } from "@/components/ui/file-upload"
import { Boat } from "@/types/boats"
import { Hotel } from "@/types/hotels"

interface BoatResponse {
  data: Boat[]
  message?: string
  status?: string
}

interface HotelResponse {
  data: Hotel[]
  message?: string
  status?: string
}

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
import { TipTapEditor } from "@/components/ui/tiptap-editor"
import { Checkbox } from "@/components/ui/checkbox"

interface Itinerary {
  day_number: number;
  activities: string;
}

interface TripDuration {
  duration_label: string;
  duration_days: number;
  duration_nights: number;
  status: "Aktif" | "Non Aktif";
  itineraries: Itinerary[];
  prices: {
    pax_min: number;
    pax_max: number;
    price_per_pax: number;
    status: "Aktif" | "Non Aktif";
    region: "Domestic" | "Overseas" | "Domestic & Overseas";
  }[];
}

interface TripFormType {
  name: string;
  boat_ids: number[];
  hotel_ids: number[];
  type: "Open Trip" | "Private Trip";
  status: "Aktif" | "Non Aktif";
  is_highlight: "Yes" | "No";
  include: string;
  exclude: string;
  note?: string;
  meeting_point: string;
  start_time: string;
  end_time: string;
  has_boat: boolean;
  has_hotel: boolean;
  destination_count: number;
  operational_days: string[];
  tentation: "Yes" | "No";
  trip_durations: TripDuration[];
  flight_schedules?: {
    route: string;
    etd_time: string;
    eta_time: string;
    etd_text?: string;
    eta_text?: string;
  }[];
  additional_fees?: {
    fee_category: string;
    price: number;
    region: "Domestic" | "Overseas" | "Domestic & Overseas";
    unit: "per_pax" | "per_5pax" | "per_day" | "per_day_guide";
    pax_min: number;
    pax_max: number;
    day_type: "Weekday" | "Weekend" | null;
    is_required: boolean;
    status: "Aktif" | "Non Aktif";
  }[];
}

const DAYS_OF_WEEK = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

// Menggunakan schema yang sama dengan create
const tripSchema = z.object({
  name: z.string().min(1, "Nama trip harus diisi"),
  boat_ids: z.array(z.number()).default([]),
  hotel_ids: z.array(z.number()).default([]),
  type: z.enum(["Open Trip", "Private Trip"]),
  status: z.enum(["Aktif", "Non Aktif"]),
  is_highlight: z.enum(["Yes", "No"]),
  include: z.string().min(1, "Include harus diisi"),
  exclude: z.string().min(1, "Exclude harus diisi"),
  note: z.string().optional(),
  meeting_point: z.string().min(1, "Meeting point harus diisi"),
  start_time: z.string().min(1, "Waktu mulai harus diisi"),
  end_time: z.string().min(1, "Waktu selesai harus diisi"),
  has_boat: z.boolean().default(false),
  has_hotel: z.boolean().default(false),
  destination_count: z.coerce.number().min(0, "Jumlah destinasi harus diisi").default(0),
  operational_days: z.array(z.string()).default([]),
  tentation: z.enum(["Yes", "No"]).default("No"),
  trip_durations: z.array(z.object({
    duration_label: z.string().min(1, "Label durasi harus diisi"),
    duration_days: z.coerce.number().min(1, "Jumlah hari harus diisi"),
    duration_nights: z.coerce.number().min(0, "Jumlah malam harus diisi"),
    status: z.enum(["Aktif", "Non Aktif"]),
    itineraries: z.array(z.object({
      day_number: z.coerce.number().min(1, "Hari harus diisi"),
      activities: z.string().min(1, "Aktivitas harus diisi")
    })),
    prices: z.array(z.object({
      pax_min: z.coerce.number().min(1, "Minimal pax harus diisi"),
      pax_max: z.coerce.number().min(1, "Maksimal pax harus diisi"),
      price_per_pax: z.coerce.number().min(0, "Harga per pax harus diisi"),
      status: z.enum(["Aktif", "Non Aktif"]),
      region: z.enum(["Domestic", "Overseas", "Domestic & Overseas"])
    }))
  })),
  flight_schedules: z.array(z.object({
    route: z.string().min(1, "Rute harus diisi"),
    etd_time: z.string().min(1, "ETD harus diisi"),
    eta_time: z.string().min(1, "ETA harus diisi"),
    etd_text: z.string().optional(),
    eta_text: z.string().optional()
  })).optional(),
  additional_fees: z.array(z.object({
    fee_category: z.string().min(1, "Kategori fee harus diisi"),
    price: z.coerce.number().min(0, "Harga harus diisi"),
    region: z.enum(["Domestic", "Overseas", "Domestic & Overseas"]),
    unit: z.enum(["per_pax", "per_5pax", "per_day", "per_day_guide"]),
    pax_min: z.coerce.number().min(1, "Minimal pax harus diisi"),
    pax_max: z.coerce.number().min(1, "Maksimal pax harus diisi"),
    day_type: z.enum(["Weekday", "Weekend"]).nullable(),
    is_required: z.boolean(),
    status: z.enum(["Aktif", "Non Aktif"])
  })).optional()
})

export default function EditTripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [existingFiles, setExistingFiles] = useState<TripAsset[]>([])
  const [filesToDelete, setFilesToDelete] = useState<number[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [fileTitles, setFileTitles] = useState<string[]>([])
  const [fileDescriptions, setFileDescriptions] = useState<string[]>([])
  const [boats, setBoats] = useState<Boat[]>([])
  const [isLoadingBoats, setIsLoadingBoats] = useState(true)
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [isLoadingHotels, setIsLoadingHotels] = useState(true)

  const form = useForm<TripFormType>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      name: "",
      boat_ids: [],
      hotel_ids: [],
      type: "Open Trip",
      status: "Aktif",
      is_highlight: "No",
      include: "",
      exclude: "",
      note: "",
      meeting_point: "",
      start_time: "",
      end_time: "",
      has_boat: false,
      has_hotel: false,
      destination_count: 0,
      operational_days: [],
      tentation: "No",
      trip_durations: [{
        duration_label: "",
        duration_days: 1,
        duration_nights: 0,
        status: "Aktif",
        itineraries: [{ day_number: 1, activities: "" }],
        prices: [{
          pax_min: 1,
          pax_max: 1,
          price_per_pax: 0,
          status: "Aktif",
          region: "Domestic"
        }]
      }],
      flight_schedules: [],
      additional_fees: [],
    }
  })

  // Kondisi tampilan dinamis
  const hasBoat = form.watch("has_boat")
  const hasHotel = form.watch("has_hotel")
  const tentation = form.watch("tentation")
  const watchedBoatIds = form.watch("boat_ids") || []
  const showBoatSection = hasBoat || (Array.isArray(watchedBoatIds) && watchedBoatIds.length > 0)

  // Jika tidak menggunakan boat dan ada pilihan boat, kosongkan (skenario user menonaktifkan)
  useEffect(() => {
    const current = form.getValues("boat_ids") || []
    if (!hasBoat && current.length > 0) {
      form.setValue("boat_ids", [])
    }
  }, [hasBoat, form])

  // Jika tidak menggunakan hotel dan ada pilihan hotel, kosongkan (skenario user menonaktifkan)
  useEffect(() => {
    const current = form.getValues("hotel_ids") || []
    if (!hasHotel && current.length > 0) {
      form.setValue("hotel_ids", [])
    }
  }, [hasHotel, form])

  // Jika jadwal fleksibel (tentation = Yes), kosongkan hari operasional
  useEffect(() => {
    if (tentation === "Yes") {
      form.setValue("operational_days", [])
    }
  }, [tentation, form])

  // Fetch boats data
  useEffect(() => {
    const fetchBoats = async () => {
      try {
        setIsLoadingBoats(true)
        const response = await apiRequest<BoatResponse>('GET', '/api/boats')
        console.log('Boats response:', response)
        if (response && response.data && Array.isArray(response.data)) {
          setBoats(response.data)
        } else if (response && Array.isArray(response)) {
          // Handle case where response is directly an array
          setBoats(response)
        } else {
          console.log('Invalid boats response format:', response)
          setBoats([])
        }
      } catch (error) {
        console.error('Error fetching boats:', error)
        toast.error('Gagal mengambil data kapal')
        setBoats([])
      } finally {
        setIsLoadingBoats(false)
      }
    }

    fetchBoats()
  }, [])

  // Fetch hotels data
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setIsLoadingHotels(true)
        const response = await apiRequest<HotelResponse>('GET', '/api/hotels')
        console.log('Hotels response:', response)
        if (response && response.data && Array.isArray(response.data)) {
          setHotels(response.data)
        } else if (response && Array.isArray(response)) {
          // Handle case where response is directly an array
          setHotels(response)
        } else {
          console.log('Invalid hotels response format:', response)
          setHotels([])
        }
      } catch (error) {
        console.error('Error fetching hotels:', error)
        toast.error('Gagal mengambil data hotel')
        setHotels([])
      } finally {
        setIsLoadingHotels(false)
      }
    }

    fetchHotels()
  }, [])

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

        if (!response.data) {
          throw new Error("Format data tidak valid")
        }
        
        try {
          // Normalisasi boat terkait dari berbagai kemungkinan bentuk response
          type TripBoatPivot = { boat_id: number | string }
          type BoatLite = { id: number | string }
          type TripHotelPivot = { hotel_id: number | string }
          type HotelLite = { id: number | string }
          type BoatIdsLike = {
            boat_ids?: Array<number | string> | null
            boat_id?: number | string | null
            trip_boats?: TripBoatPivot[] | null
            boats?: BoatLite[] | null
            has_boat?: boolean | null
          }
          type HotelIdsLike = {
            hotel_ids?: Array<number | string> | null
            hotel_id?: number | string | null
            trip_hotels?: TripHotelPivot[] | null
            hotels?: HotelLite[] | null
            has_hotel?: boolean | null
          }
          const dataSource = response.data as unknown as BoatIdsLike & HotelIdsLike
          let rawBoatIds: number[] = []
          let rawHotelIds: number[] = []

          if (Array.isArray(dataSource.trip_boats) && dataSource.trip_boats.length > 0) {
            rawBoatIds = dataSource.trip_boats.map((tb) => Number(tb.boat_id)).filter((n) => !Number.isNaN(n))
          } else if (Array.isArray(dataSource.boats) && dataSource.boats.length > 0) {
            rawBoatIds = dataSource.boats.map((b) => Number(b.id)).filter((n) => !Number.isNaN(n))
          } else if (Array.isArray(dataSource.boat_ids) && dataSource.boat_ids.length > 0) {
            rawBoatIds = dataSource.boat_ids.map((b) => Number(b)).filter((n) => !Number.isNaN(n))
          } else if (dataSource.boat_id != null) {
            const single = Number(dataSource.boat_id)
            rawBoatIds = Number.isNaN(single) ? [] : [single]
          }

          // Normalisasi hotel terkait dari berbagai kemungkinan bentuk response
          if (Array.isArray(dataSource.trip_hotels) && dataSource.trip_hotels.length > 0) {
            rawHotelIds = dataSource.trip_hotels.map((th) => Number(th.hotel_id)).filter((n) => !Number.isNaN(n))
          } else if (Array.isArray(dataSource.hotels) && dataSource.hotels.length > 0) {
            rawHotelIds = dataSource.hotels.map((h) => Number(h.id)).filter((n) => !Number.isNaN(n))
          } else if (Array.isArray(dataSource.hotel_ids) && dataSource.hotel_ids.length > 0) {
            rawHotelIds = dataSource.hotel_ids.map((h) => Number(h)).filter((n) => !Number.isNaN(n))
          } else if (dataSource.hotel_id != null) {
            const single = Number(dataSource.hotel_id)
            rawHotelIds = Number.isNaN(single) ? [] : [single]
          }

          const data = {
            ...response.data,
            // Normalisasi boat_ids: dukung field boat_ids[] atau boat_id tunggal
            boat_ids: rawBoatIds,
            // Normalisasi hotel_ids: dukung field hotel_ids[] atau hotel_id tunggal
            hotel_ids: rawHotelIds,
            destination_count: Number(response.data.destination_count) || 0,
            has_boat: Boolean(dataSource.has_boat) || rawBoatIds.length > 0,
            has_hotel: Boolean(dataSource.has_hotel) || rawHotelIds.length > 0,
            operational_days: response.data.operational_days || [],
            tentation: response.data.tentation || "No",
            trip_durations: response.data.trip_durations.map(duration => ({
              ...duration,
              duration_days: Number(duration.duration_days) || 1,
              duration_nights: Number(duration.duration_nights) || 0,
              itineraries: duration.itineraries?.map(itinerary => ({
                ...itinerary,
                day_number: Number(itinerary.day_number) || 1
              })) || [{ day_number: 1, activities: "" }],
              prices: duration.trip_prices?.map(price => ({
                pax_min: Number(price.pax_min),
                pax_max: Number(price.pax_max),
                price_per_pax: Number(price.price_per_pax) || 0,
                status: price.status,
                region: price.region
              })) || [{
                pax_min: 1,
                pax_max: 1,
                price_per_pax: 0,
                status: "Aktif",
                region: "Domestic"
              }]
            })),
            additional_fees: response.data.additional_fees?.map(fee => ({
              ...fee,
              price: Number(fee.price) || 0,
              is_required: Boolean(fee.is_required),
              pax_min: Number(fee.pax_min),
              pax_max: Number(fee.pax_max)
            })) || [],
          }
          
          const validatedData = tripSchema.parse(data)
          console.log('Validated data:', validatedData)
          console.log('Boat ID from API:', response.data.boat_id)
          console.log('Boat IDs in validated data:', validatedData.boat_ids)
          console.log('Converted boat_ids:', data.boat_ids)
          console.log('Assets from API:', response.data.assets)
          form.reset(validatedData)
          
          // Set existing files dengan validasi
          const assets = response.data.assets || []
          console.log('Setting existing files:', {
            count: assets.length,
            assets: assets.map(a => ({ id: a.id, title: a.title, file_url: a.file_url })),
            rawAssets: assets
          })
          setExistingFiles(assets)
          
          // Reset file upload states
          setFiles([])
          setFileTitles([])
          setFileDescriptions([])
          setFilesToDelete([])
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

  const handleFileDelete = async (fileUrl: string) => {
    try {
      console.log('handleFileDelete called with fileUrl:', fileUrl)
      console.log('Current existingFiles:', existingFiles.map(f => ({ id: f.id, title: f.title, file_url: f.file_url })))
      
      // Cari asset berdasarkan file_url
      const asset = existingFiles.find(file => file.file_url === fileUrl)
      if (!asset) {
        console.error('Asset not found for fileUrl:', fileUrl)
        throw new Error("Asset tidak ditemukan")
      }

      console.log('Found asset to delete:', { 
        fileUrl, 
        assetId: asset.id, 
        assetTitle: asset.title,
        currentExistingFiles: existingFiles.length,
        allExistingFiles: existingFiles.map(f => ({ id: f.id, title: f.title, file_url: f.file_url }))
      })

      // Cek apakah file sudah ada di daftar yang akan dihapus
      const isAlreadyMarkedForDeletion = filesToDelete.includes(asset.id)
      if (isAlreadyMarkedForDeletion) {
        console.log('File already marked for deletion, skipping')
        return
      }

      // Tambahkan ke daftar file yang akan dihapus
      setFilesToDelete(prev => {
        const newList = [...prev, asset.id]
        console.log('Files to delete updated:', newList)
        return newList
      })
      
      // Hapus dari tampilan existing files menggunakan ID yang lebih unik
      setExistingFiles(prev => {
        console.log('Filtering existing files, removing asset with ID:', asset.id)
        const filtered = prev.filter(file => {
          const shouldKeep = file.id !== asset.id
          console.log(`File ${file.id} (${file.title}): ${shouldKeep ? 'KEEP' : 'REMOVE'}`)
          return shouldKeep
        })
        console.log('Existing files after deletion:', {
          before: prev.length,
          after: filtered.length,
          removed: prev.length - filtered.length,
          removedFile: { id: asset.id, title: asset.title },
          remainingFiles: filtered.map(f => ({ id: f.id, title: f.title }))
        })
        return filtered
      })
      
      toast.success(`File "${asset.title || 'Untitled'}" akan dihapus setelah menyimpan perubahan`)
    } catch (error) {
      console.error("Error deleting file:", error)
      toast.error("Gagal menghapus file")
    }
  }

  const onSubmit = async (values: TripFormType) => {
    try {
      setIsSubmitting(true)
      console.log('Updating trip with ID:', id)
      console.log('Form values before transform:', values)
      console.log('Boat IDs in form values:', values.boat_ids)
      console.log('Boat IDs type:', typeof values.boat_ids)
      console.log('Boat IDs length:', values.boat_ids?.length)
      console.log('Files to delete:', filesToDelete)
      console.log('New files to upload:', files.length)
      console.log('Existing files count:', existingFiles.length)
      console.log('All form values in submit:', JSON.stringify(values, null, 2))
      
      // Transform data before sending to API
      const transformedValues = {
        ...values,
        destination_count: Number(values.destination_count) || 0,
        has_boat: Boolean(values.has_boat),
        has_hotel: Boolean(values.has_hotel),
        is_highlight: values.is_highlight === "Yes" ? "Yes" : "No",
        tentation: values.tentation === "Yes" ? "Yes" : "No",
        boat_ids: values.boat_ids || [], // Ensure boat_ids is included
        boat_id: values.boat_ids && values.boat_ids.length > 0 ? values.boat_ids[0] : null, // Tambahkan boat_id untuk kompatibilitas
        hotel_ids: values.hotel_ids || [], // Ensure hotel_ids is included
        hotel_id: values.hotel_ids && values.hotel_ids.length > 0 ? values.hotel_ids[0] : null, // Tambahkan hotel_id untuk kompatibilitas
        operational_days: values.operational_days || [],
        additional_fees: values.additional_fees?.map(fee => ({
          ...fee,
          is_required: Boolean(fee.is_required),
          price: Number(fee.price) || 0,
          pax_min: Number(fee.pax_min) || 1,
          pax_max: Number(fee.pax_max) || 1
        })),
        trip_durations: values.trip_durations.map(duration => ({
          ...duration,
          duration_days: Number(duration.duration_days) || 1,
          duration_nights: Number(duration.duration_nights) || 0,
          itineraries: duration.itineraries.map(itinerary => ({
            ...itinerary,
            day_number: Number(itinerary.day_number) || 1
          })),
          prices: duration.prices.map(price => ({
            ...price,
            pax_min: Number(price.pax_min) || 1,
            pax_max: Number(price.pax_max) || 1,
            price_per_pax: Number(price.price_per_pax) || 0
          }))
        }))
      }
      
      console.log('Transformed values:', transformedValues)
      console.log('Boat IDs in transformed values:', transformedValues.boat_ids)

      // 1. Update trip data
      console.log('Sending PUT request to API with payload:', transformedValues)
      
      await apiRequest(
        'PUT',
        `/api/trips/${id}`,
        transformedValues
      )

      // 2. Delete files if any
      if (filesToDelete.length > 0) {
        console.log('Deleting files:', filesToDelete)
        console.log('Files to delete details:', filesToDelete.map(id => {
          const originalAsset = existingFiles.find(f => f.id === id)
          return { id, title: originalAsset?.title, file_url: originalAsset?.file_url }
        }))
        
        try {
          await Promise.all(
            filesToDelete.map(fileId => {
              console.log('Deleting file with ID:', fileId)
              return apiRequest(
                'DELETE',
                `/api/assets/${fileId}`
              )
            })
          )
          console.log('Files deleted successfully')
        } catch (deleteError) {
          console.error('Error deleting files:', deleteError)
          toast.error('Gagal menghapus beberapa file')
          // Jangan throw error, lanjutkan proses
        }
      } else {
        console.log('No files to delete')
      }

      // 3. Upload new files if any
      if (files.length > 0) {
        console.log('Uploading new files:', files.length, 'files')
        const formData = new FormData()
        formData.append('model_type', 'trip')
        formData.append('model_id', id)
        formData.append('is_external', '0')
        
        files.forEach((file, index) => {
          console.log('Adding file to form data:', {
            file: file.name,
            title: fileTitles[index],
            description: fileDescriptions[index]
          })
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
        console.log('New files uploaded successfully')
      }

      toast.success("Trip berhasil diupdate")
      router.push("/dashboard/trips")
      router.refresh()
    } catch (error: unknown) {
      console.error("Error updating trip:", error)
      
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response: { data?: { message?: string }, statusText?: string } }
        console.error("API Error Response:", apiError.response.data)
        toast.error(`Gagal mengupdate trip: ${apiError.response.data?.message || apiError.response.statusText}`)
      } else if (error && typeof error === 'object' && 'request' in error) {
        console.error("Network Error:", error)
        toast.error("Gagal mengupdate trip: Tidak dapat terhubung ke server")
      } else {
        console.error("Other Error:", error)
        toast.error("Gagal mengupdate trip: Terjadi kesalahan yang tidak diketahui")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddItinerary = (durationIndex: number) => {
    const tripDurations = form.getValues("trip_durations") as TripDuration[]
    const currentDuration = tripDurations[durationIndex]
    if (!currentDuration) return

    const newItinerary: Itinerary = {
      day_number: (currentDuration.itineraries?.length || 0) + 1,
      activities: ""
    }

    const updatedDuration: TripDuration = {
      ...currentDuration,
      itineraries: [...(currentDuration.itineraries || []), newItinerary]
    }

    const updatedTripDurations = [...tripDurations]
    updatedTripDurations[durationIndex] = updatedDuration

    form.setValue("trip_durations", updatedTripDurations)
  }

  const handleRemoveItinerary = (durationIndex: number, itineraryIndex: number) => {
    const tripDurations = form.getValues("trip_durations") as TripDuration[]
    const currentDuration = tripDurations[durationIndex]
    if (!currentDuration) return

    const updatedItineraries = (currentDuration.itineraries || [])
      .filter((_, index) => index !== itineraryIndex)
      .map((itinerary, index) => ({
        ...itinerary,
        day_number: index + 1
      }))

    const updatedDuration: TripDuration = {
      ...currentDuration,
      itineraries: updatedItineraries
    }

    const updatedTripDurations = [...tripDurations]
    updatedTripDurations[durationIndex] = updatedDuration

    form.setValue("trip_durations", updatedTripDurations)
  }

  const handleAddTripDuration = () => {
    const currentDurations = form.getValues("trip_durations") || [];
    form.setValue("trip_durations", [
      ...currentDurations,
      {
        duration_label: "",
        duration_days: 1,
        duration_nights: 0,
        status: "Aktif",
        itineraries: [{
          day_number: 1,
          activities: ""
        }],
        prices: [{
          pax_min: 1,
          pax_max: 1,
          price_per_pax: 0,
          status: "Aktif",
          region: "Domestic"
        }]
      }
    ])
  }

  const handleAddFlightSchedule = () => {
    const currentSchedules = form.getValues("flight_schedules") ?? [];
    form.setValue("flight_schedules", [
      ...currentSchedules,
      {
        route: "",
        etd_time: "00:00:00",
        eta_time: "00:00:00",
        etd_text: "",
        eta_text: ""
      }
    ])
  }

  // Ganti semua penggunaan form.watch() dengan penanganan error
  const tripDurations = form.watch("trip_durations") || []
  const flightSchedules = form.watch("flight_schedules") || []
  const additionalFees = form.watch("additional_fees") || []
  const boatIds = form.watch("boat_ids") || []
  
  // Debug boat selection
  console.log('Current boat_ids in form:', boatIds)
  console.log('Available boats:', boats)
  
  // Debug: Monitor all form values
  const allFormValues = form.watch()
  console.log('All form values in edit:', allFormValues)

  // Debug existing files state changes
  useEffect(() => {
    console.log('Existing files state changed:', {
      count: existingFiles.length,
      files: existingFiles.map(f => ({ id: f.id, title: f.title, file_url: f.file_url }))
    })
  }, [existingFiles])

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
          <p className="text-gray-500 mt-2">Edit informasi trip dengan lengkap</p>
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
                      name="is_highlight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Highlight</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih highlight" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Yes">Yes</SelectItem>
                              <SelectItem value="No">No</SelectItem>
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
                      name="end_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Waktu Selesai</FormLabel>
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
                      name="has_boat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Menggunakan Kapal</FormLabel>
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
                      name="tentation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jadwal Fleksibel</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih status jadwal" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="No">Tidak</SelectItem>
                              <SelectItem value="Yes">Ya</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="has_hotel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Menggunakan Hotel</FormLabel>
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
                      name="destination_count"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jumlah Destinasi</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              min="0"
                              {...field}
                              value={field.value || 0}
                              onChange={e => field.onChange(Number(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Boat Selection */}
                {showBoatSection && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Pilih Kapal</h2>
                    {isLoadingBoats ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="ml-2">Memuat data kapal...</span>
                      </div>
                    ) : boats.length > 0 ? (
                      <div className="grid grid-cols-3 gap-4">
                        {boats.map((boat) => {
                          const currentBoatIds = form.watch("boat_ids") || [];
                          const isChecked = currentBoatIds.includes(boat.id);
                          
                          return (
                            <div key={boat.id} className="flex flex-row items-start space-x-3 space-y-0">
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  console.log('Boat checkbox changed:', boat.id, checked);
                                  console.log('Current boats before change:', currentBoatIds);
                                  
                                  let newBoats;
                                  if (checked) {
                                    newBoats = [...currentBoatIds, boat.id];
                                    console.log('Adding boat, new array:', newBoats);
                                  } else {
                                    newBoats = currentBoatIds.filter(id => id !== boat.id);
                                    console.log('Removing boat, new array:', newBoats);
                                  }
                                  
                                  form.setValue("boat_ids", newBoats);
                                  
                                  // Force form update and log
                                  setTimeout(() => {
                                    const updatedBoatIds = form.getValues('boat_ids');
                                    console.log('Boat IDs after update:', updatedBoatIds);
                                    console.log('Form state after boat update:', form.getValues());
                                  }, 100);
                                }}
                              />
                              <div className="space-y-1 leading-none">
                                <label className="text-sm font-normal cursor-pointer">
                                  {boat.boat_name}
                                </label>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <p className="text-gray-500 mb-2">Tidak ada data kapal tersedia</p>
                          <p className="text-sm text-gray-400 mb-4">Silakan tambahkan kapal terlebih dahulu di menu Kapal Management</p>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/dashboard/boats")}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Tambah Kapal
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Hotel Selection
                {hasHotel && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Pilih Hotel</h2>
                    {isLoadingHotels ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="ml-2">Memuat data hotel...</span>
                      </div>
                    ) : hotels.length > 0 ? (
                      <div className="grid grid-cols-3 gap-4">
                        {hotels.map((hotel) => {
                          const currentHotelIds = form.watch("hotel_ids") || [];
                          const isChecked = currentHotelIds.includes(hotel.id);
                          
                          return (
                            <div key={hotel.id} className="flex flex-row items-start space-x-3 space-y-0">
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  console.log('Hotel checkbox changed:', hotel.id, checked);
                                  console.log('Current hotels before change:', currentHotelIds);
                                  
                                  let newHotels;
                                  if (checked) {
                                    newHotels = [...currentHotelIds, hotel.id];
                                    console.log('Adding hotel, new array:', newHotels);
                                  } else {
                                    newHotels = currentHotelIds.filter(id => id !== hotel.id);
                                    console.log('Removing hotel, new array:', newHotels);
                                  }
                                  
                                  form.setValue("hotel_ids", newHotels);
                                  
                                  // Force form update and log
                                  setTimeout(() => {
                                    const updatedHotelIds = form.getValues('hotel_ids');
                                    console.log('Hotel IDs after update:', updatedHotelIds);
                                    console.log('Form state after hotel update:', form.getValues());
                                  }, 100);
                                }}
                              />
                              <div className="space-y-1 leading-none">
                                <label className="text-sm font-normal cursor-pointer">
                                  {hotel.hotel_name}
                                </label>
                                <p className="text-xs text-gray-500">
                                  {hotel.hotel_type} • {hotel.occupancy}
                                </p>
                                <p className="text-xs text-gray-600 font-medium">
                                  Rp {hotel.price}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <p className="text-gray-500 mb-2">Tidak ada data hotel tersedia</p>
                          <p className="text-sm text-gray-400 mb-4">Silakan tambahkan hotel terlebih dahulu di menu Hotel Management</p>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/dashboard/hotels")}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Tambah Hotel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )} */}

                {/* Operational Days */}
                {tentation !== "Yes" && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Hari Operasional</h2>
                    
                    {/* Tombol aksi untuk checklist hari operasional */}
                    <div className="flex gap-3 mb-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          form.setValue("operational_days", ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]);
                        }}
                      >
                        Semua Hari
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          form.setValue("operational_days", ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
                        }}
                      >
                        Weekday
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          form.setValue("operational_days", ["Saturday", "Sunday"]);
                        }}
                      >
                        Weekend
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          form.setValue("operational_days", []);
                        }}
                      >
                        Hapus Semua
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-4">
                      {DAYS_OF_WEEK.map((day) => (
                        <FormField
                          key={day}
                          control={form.control}
                          name="operational_days"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(day)}
                                  onCheckedChange={(checked) => {
                                    const currentDays = field.value || [];
                                    if (checked) {
                                      field.onChange([...currentDays, day]);
                                    } else {
                                      field.onChange(currentDays.filter(d => d !== day));
                                    }
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-normal">
                                  {day === "Monday" && "Senin"}
                                  {day === "Tuesday" && "Selasa"}
                                  {day === "Wednesday" && "Rabu"}
                                  {day === "Thursday" && "Kamis"}
                                  {day === "Friday" && "Jumat"}
                                  {day === "Saturday" && "Sabtu"}
                                  {day === "Sunday" && "Minggu"}
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                )}

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
                            <TipTapEditor
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Masukkan fasilitas yang termasuk dalam trip"
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
                            <TipTapEditor
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Masukkan fasilitas yang tidak termasuk dalam trip"
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
                            <TipTapEditor
                              value={field.value || ""}
                              onChange={field.onChange}
                              placeholder="Masukkan catatan tambahan (opsional)"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                      onClick={handleAddTripDuration}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Durasi
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {tripDurations.map((duration, dIndex) => (
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

                        {/* Itinerary Section */}
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium">Itinerary</h4>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddItinerary(dIndex)}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Tambah Hari
                            </Button>
                          </div>

                          <div className="space-y-4">
                            {duration.itineraries.map((_, iIndex) => (
                              <div key={iIndex} className="p-4 bg-white rounded-lg space-y-4">
                                <div className="flex justify-between items-center">
                                  <h5 className="font-medium">Hari {iIndex + 1}</h5>
                                  {iIndex > 0 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveItinerary(dIndex, iIndex)}
                                    >
                                      <Trash className="w-4 h-4 text-red-500" />
                                    </Button>
                                  )}
                                </div>

                                <FormField
                                  control={form.control}
                                  name={`trip_durations.${dIndex}.itineraries.${iIndex}.activities`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Aktivitas</FormLabel>
                                      <FormControl>
                                        <TipTapEditor
                                          value={field.value}
                                          onChange={field.onChange}
                                          placeholder="Masukkan detail aktivitas untuk hari ini"
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

                        {/* Prices Section */}
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
                                    price_per_pax: 0,
                                    status: "Aktif",
                                    region: "Domestic"
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
                              <div key={pIndex} className="grid grid-cols-6 gap-4 p-4 bg-white rounded-lg items-end">
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
                                <FormField
                                  control={form.control}
                                  name={`trip_durations.${dIndex}.prices.${pIndex}.price_per_pax`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Harga per Pax</FormLabel>
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
                                <FormField
                                  control={form.control}
                                  name={`trip_durations.${dIndex}.prices.${pIndex}.region`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Region</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Pilih region" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="Domestic">Domestic</SelectItem>
                                          <SelectItem value="Overseas">Overseas</SelectItem>
                                          <SelectItem value="Domestic & Overseas">Domestic & Overseas</SelectItem>
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

                {/* Flight Schedules */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Jadwal Penerbangan</h2>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddFlightSchedule}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Jadwal
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {flightSchedules.map((_, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">Jadwal {index + 1}</h3>
                          {index > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const currentSchedules = form.getValues("flight_schedules") || [];
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
                                    value={field.value ? field.value.substring(0, 5) : "00:00"}
                                    onChange={(e) => {
                                      const time = e.target.value;
                                      if (time) {
                                        field.onChange(`${time}:00`);
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
                                    value={field.value ? field.value.substring(0, 5) : "00:00"}
                                    onChange={(e) => {
                                      const time = e.target.value;
                                      if (time) {
                                        field.onChange(`${time}:00`);
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
                                  <Input 
                                    placeholder="Terminal 3" 
                                    {...field}
                                    value={field.value || ""}
                                    onChange={(e) => {
                                      const text = e.target.value;
                                      field.onChange(text);
                                    }}
                                  />
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
                                  <Input 
                                    placeholder="Terminal Domestik" 
                                    {...field}
                                    value={field.value || ""}
                                    onChange={(e) => {
                                      const text = e.target.value;
                                      field.onChange(text);
                                    }}
                                  />
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

                {/* Additional Fees */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Additional Fees</h2>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentFees = form.getValues("additional_fees") || [];
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
                    {additionalFees.map((fee, fIndex) => (
                      <div key={fIndex} className="p-4 bg-gray-50 rounded-lg space-y-6">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">Fee {fIndex + 1}</h3>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const currentFees = form.getValues("additional_fees") || [];
                              form.setValue("additional_fees", 
                                currentFees.filter((_, i) => i !== fIndex)
                              )
                            }}
                          >
                            <Trash className="w-4 h-4 text-red-500" />
                          </Button>
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
                                    value={field.value || 0}
                                    onChange={(e) => {
                                      const value = Number(e.target.value) || 0;
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
                                    value={field.value || 1}
                                    onChange={(e) => {
                                      const value = Number(e.target.value) || 1;
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
                                    value={field.value || 1}
                                    onChange={(e) => {
                                      const value = Number(e.target.value) || 1;
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

                {/* File Upload Section */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Gambar Trip</h2>
                  <FileUpload
                    onUpload={async (files, titles, descriptions) => {
                      console.log('FileUpload onUpload called:', {
                        filesCount: files.length,
                        titlesCount: titles.length,
                        descriptionsCount: descriptions.length
                      })
                      setFiles(files)
                      setFileTitles(titles)
                      setFileDescriptions(descriptions)
                    }}
                    onDelete={handleFileDelete}
                    existingFiles={existingFiles}
                    maxFiles={5}
                    maxSize={10 * 1024 * 1024} // 10MB
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