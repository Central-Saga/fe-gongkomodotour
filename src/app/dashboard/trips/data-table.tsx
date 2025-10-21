"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  getExpandedRowModel,
  Row,
  ExpandedState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronDown, FileDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus } from 'lucide-react'
import { useState } from "react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { Trip, TripAsset, FlightSchedule, TripPrice, AdditionalFee } from "@/types/trips"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { ImageModal } from "@/components/ui/image-modal"

interface DataTableProps<TData> {
  columns: ColumnDef<TData, string>[]
  data: TData[]
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Fungsi untuk mendapatkan URL gambar
const getImageUrl = (fileUrl: string) => {
  console.log('getImageUrl called with:', { fileUrl, type: typeof fileUrl })
  
  if (!fileUrl || fileUrl.trim() === '') {
    console.warn('Empty or invalid file URL provided:', fileUrl)
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4='
  }
  
  // Jika sudah URL lengkap, return langsung
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    console.log('Full URL detected:', fileUrl)
    return fileUrl
  }
  
  // Pastikan fileUrl dimulai dengan slash
  const cleanUrl = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`
  const fullUrl = `${API_URL}${cleanUrl}`
  
  console.log('Image URL constructed:', { 
    original: fileUrl, 
    cleanUrl: cleanUrl,
    apiUrl: API_URL,
    constructed: fullUrl 
  })
  
  return fullUrl
}

const exportToPDF = (data: Trip[]) => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  
  // Add header section (centered)
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  const companyName = "Gong Komodo Tour"
  const companyNameWidth = doc.getTextWidth(companyName)
  const companyNameX = (pageWidth - companyNameWidth) / 2
  const companyNameY = 20
  doc.text(companyName, companyNameX, companyNameY)
  
  // Address and phone (centered below company name)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  const address = [
    "Jl. Ciung Wanara I No.42, Renon,",
    "Kec. Denpasar Tim., Kota Denpasar,",
    "Bali 80234",
    "0812-3867-588"
  ]
  
  let yPos = companyNameY + 10
  address.forEach(line => {
    const lineWidth = doc.getTextWidth(line)
    const lineX = (pageWidth - lineWidth) / 2
    doc.text(line, lineX, yPos)
    yPos += 6
  })

  // Add divider line
  doc.setLineWidth(0.5)
  doc.line(14, yPos + 5, pageWidth - 14, yPos + 5)
  
  // Add report title (centered)
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  const reportTitle = "Trip Report"
  const reportTitleWidth = doc.getTextWidth(reportTitle)
  const reportTitleX = (pageWidth - reportTitleWidth) / 2
  doc.text(reportTitle, reportTitleX, yPos + 20)
  
  // Add generated date (right aligned)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  const dateText = `Generated on: ${new Date().toLocaleString()}`
  doc.text(dateText, pageWidth - 14, yPos + 30, { align: 'right' })
  
  // Define the columns for the table
  const tableColumn = [
    "No",
    "Nama Trip",
    "Tipe Trip",
    "Status",
    "Created At",
    "Updated At"
  ]
  
  // Map the data to match the columns
  const tableRows = data.map((item, index) => [
    index + 1,
    item.name,
    item.type,
    item.status,
    new Date(item.created_at).toLocaleString(),
    new Date(item.updated_at).toLocaleString(),
  ])

  // Generate the table
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: yPos + 40,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontSize: 8,
      fontStyle: "bold",
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center' }, // No
      1: { halign: 'left' },   // Nama Trip
      2: { halign: 'center' }, // Tipe Trip
      3: { halign: 'center' }, // Status
      4: { halign: 'center' }, // Created At
      5: { halign: 'center' }, // Updated At
    },
  })

  // Save the PDF
  doc.save("trip-report.pdf")
}

function HtmlContent({ html }: { html: string }) {
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: html }} 
      className="prose prose-sm max-w-none break-words"
      style={{
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        wordBreak: 'break-word',
        hyphens: 'auto',
        whiteSpace: 'normal',
        maxWidth: '100%'
      }}
    />
  )
}

export function DataTable({
  columns,
  data,
}: DataTableProps<Trip>) {
  const router = useRouter()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [selectedImage, setSelectedImage] = useState<TripAsset | null>(null)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    getExpandedRowModel: getExpandedRowModel(),
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      expanded,
      pagination,
    },
  })

  const renderSubComponent = ({ row }: { row: Row<Trip> }) => {
    const trip = row.original as Trip
    
    console.log('renderSubComponent called for trip:', {
      id: trip.id,
      name: trip.name,
      assetsCount: trip.assets?.length || 0,
      assets: trip.assets?.map(a => ({ id: a.id, title: a.title, file_url: a.file_url })) || []
    })
    
    return (
      <div className="p-4 bg-muted/50 rounded-lg w-full overflow-hidden">
        {/* Informasi Trip */}
        <div className="space-y-4 w-full">
          <div className="bg-white p-4 rounded-lg shadow-sm w-full overflow-hidden">
            <h4 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">Informasi Trip</h4>
            <div className="grid gap-4 lg:grid-cols-2 w-full">
              <div className="space-y-4 min-w-0">
                <div>
                  <p className="text-gray-600 font-medium mb-2">Include:</p>
                  <div className="bg-gray-50 p-3 rounded-md overflow-auto max-w-full">
                    <div className="prose prose-sm max-w-none break-words overflow-wrap-anywhere">
                      <HtmlContent html={trip.include} />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 font-medium mb-2">Exclude:</p>
                  <div className="bg-gray-50 p-3 rounded-md overflow-auto max-w-full">
                    <div className="prose prose-sm max-w-none break-words overflow-wrap-anywhere">
                      <HtmlContent html={trip.exclude} />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 font-medium mb-2">Catatan:</p>
                  <div className="bg-gray-50 p-3 rounded-md max-w-full">
                    <div className="prose prose-sm max-w-none break-words overflow-wrap-anywhere">
                      <HtmlContent html={trip.note || ""} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4 min-w-0">
                <div>
                  <p className="text-gray-600 font-medium mb-2">Meeting Point:</p>
                  <div className="bg-gray-50 p-3 rounded-md max-w-full">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-gray-800 break-words">{trip.meeting_point}</p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs break-words">{trip.meeting_point}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 font-medium mb-2">Waktu Mulai:</p>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-gray-800 break-words">{trip.start_time}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium mb-2">Waktu Selesai:</p>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-gray-800 break-words">{trip.end_time}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Itinerary */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm w-full overflow-hidden">
            <h4 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">Itinerary</h4>
            <div className="space-y-6 w-full">
              {trip.trip_durations.map((duration) => (
                <div key={duration.id} className="space-y-4 w-full">
                  <div className="bg-gray-50 p-3 rounded-md w-full overflow-hidden">
                    <h5 className="font-medium text-gray-800 mb-2 break-words">
                      {duration.duration_label} ({duration.duration_days} Hari {duration.duration_nights} Malam)
                    </h5>
                    <div className="space-y-4 w-full">
                      {duration.itineraries.sort((a, b) => a.day_number - b.day_number).map((itinerary) => (
                        <div key={itinerary.id} className="bg-white p-3 rounded-md border border-gray-100 w-full overflow-hidden">
                          <div className="flex items-start gap-3 w-full">
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md text-sm font-medium flex-shrink-0">
                              Hari {itinerary.day_number}
                            </span>
                            <div className="prose prose-sm max-w-none min-w-0 flex-1 overflow-hidden">
                              <div className="break-words overflow-wrap-anywhere max-w-full">
                                <HtmlContent html={itinerary.activities} />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Flight Schedules */}
          <div className="bg-white p-6 rounded-lg shadow-sm w-full overflow-hidden">
            <h4 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">Jadwal Penerbangan</h4>
            <div className="grid gap-4 md:grid-cols-2 w-full">
              {trip.flight_schedules.map((schedule: FlightSchedule, index: number) => (
                <div key={index} className="bg-gray-50 p-4 rounded-md w-full overflow-hidden">
                  <p className="font-medium text-gray-800 mb-3 text-base break-words">{schedule.route}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    <div className="space-y-2">
                      <div>
                        <p className="text-gray-600 font-medium">ETD Time:</p>
                        <div className="bg-white p-2 rounded border border-gray-100">
                          <p className="text-gray-800 break-words">{schedule.etd_time}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">ETD Text:</p>
                        <div className="bg-white p-2 rounded border border-gray-100">
                          <p className="text-gray-800 break-words">{schedule.etd_text}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-gray-600 font-medium">ETA Time:</p>
                        <div className="bg-white p-2 rounded border border-gray-100">
                          <p className="text-gray-800 break-words">{schedule.eta_time}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">ETA Text:</p>
                        <div className="bg-white p-2 rounded border border-gray-100">
                          <p className="text-gray-800 break-words">{schedule.eta_text}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trip Durations & Prices */}
          <div className="bg-white p-6 rounded-lg shadow-sm w-full overflow-hidden">
            <h4 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">Durasi & Harga</h4>
            <div className="space-y-6 w-full">
              {trip.trip_durations.map((duration) => (
                <div key={duration.id} className="bg-gray-50 p-4 rounded-md w-full overflow-hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 w-full">
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Label Durasi:</p>
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <p className="text-gray-800 break-words">{duration.duration_label}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Jumlah Hari:</p>
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <p className="text-gray-800">{duration.duration_days}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Jumlah Malam:</p>
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <p className="text-gray-800">{duration.duration_nights}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Status:</p>
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <Badge className={`${duration.status === "Aktif" ? "bg-emerald-500" : "bg-red-500"} text-white`}>
                          {duration.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {duration.trip_prices.length > 0 && (
                    <div className="w-full overflow-hidden">
                      <p className="font-medium text-gray-800 mb-3">Harga per Pax:</p>
                      <div className="space-y-3 w-full">
                        {duration.trip_prices.map((price: TripPrice, priceIndex: number) => (
                          <div key={priceIndex} className="bg-white p-3 rounded-md border border-gray-100 w-full overflow-hidden">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
                              <div>
                                <p className="text-gray-600 text-sm">Min Pax:</p>
                                <p className="font-medium">{price.pax_min}</p>
                              </div>
                              <div>
                                <p className="text-gray-600 text-sm">Max Pax:</p>
                                <p className="font-medium">{price.pax_max}</p>
                              </div>
                              <div>
                                <p className="text-gray-600 text-sm">Harga per Pax:</p>
                                <p className="font-medium break-words">
                                  {new Intl.NumberFormat("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                  }).format(Number(price.price_per_pax))}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600 text-sm">Region:</p>
                                <Badge className={`${
                                  price.region === "Domestic" ? "bg-blue-500" : 
                                  price.region === "Overseas" ? "bg-purple-500" : 
                                  "bg-indigo-500"
                                } text-white`}>
                                  {price.region}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-gray-600 text-sm">Status:</p>
                                <Badge className={`${price.status === "Aktif" ? "bg-emerald-500" : "bg-red-500"} text-white`}>
                                  {price.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Additional Fees */}
          <div className="bg-white p-6 rounded-lg shadow-sm w-full overflow-hidden">
            <h4 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">Biaya Tambahan</h4>
            <div className="space-y-4 w-full">
              {trip.additional_fees.map((fee: AdditionalFee, index: number) => (
                <div key={index} className="bg-gray-50 p-4 rounded-md w-full overflow-hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 w-full">
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Kategori:</p>
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <p className="text-gray-800 break-words">{fee.fee_category}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Harga:</p>
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <p className="text-gray-800 break-words">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          }).format(Number(fee.price))}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Wilayah:</p>
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <p className="text-gray-800 break-words">{fee.region}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Satuan:</p>
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <p className="text-gray-800 break-words">{fee.unit}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Min Pax:</p>
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <p className="text-gray-800">{fee.pax_min}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Max Pax:</p>
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <p className="text-gray-800">{fee.pax_max}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Tipe Hari:</p>
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <p className="text-gray-800 break-words">{fee.day_type}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Status:</p>
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <Badge className={`${fee.status === "Aktif" ? "bg-emerald-500" : "bg-red-500"} text-white`}>
                          {fee.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gambar Trip - Dipindahkan ke bawah */}
        {trip.assets && trip.assets.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm mt-6 w-full overflow-hidden">
            <h4 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">Gambar Trip</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
              {trip.assets.map((asset, index) => {
                if (!asset || !asset.file_url) {
                  console.warn(`Invalid asset at index ${index}:`, asset)
                  return null
                }
                
                const imageUrl = getImageUrl(asset.file_url)
                console.log(`Rendering asset ${index}:`, {
                  id: asset.id,
                  title: asset.title,
                  file_url: asset.file_url,
                  imageUrl: imageUrl
                })
                
                return (
                  <div 
                    key={asset.id || `asset-${index}`} 
                    className="space-y-2 cursor-pointer group w-full"
                    onClick={() => setSelectedImage(asset)}
                  >
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 w-full">
                      <Image
                        src={imageUrl}
                        alt={asset.title || `Gambar ${index + 1}`}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                        className="object-cover transition-transform duration-200 group-hover:scale-105"
                        unoptimized={true}
                        onError={(e) => {
                          console.error(`Error loading image for asset ${asset.id || index}:`, {
                            assetId: asset.id,
                            assetTitle: asset.title,
                            fileUrl: asset.file_url,
                            imageUrl: imageUrl,
                            error: e,
                            tripId: trip.id,
                            tripName: trip.name
                          })
                          const target = e.target as HTMLImageElement
                          // Gunakan data URL untuk placeholder yang valid
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4='
                        }}
                        onLoad={() => {
                          console.log(`Image loaded successfully for asset ${asset.id || index}: ${asset.title || `Gambar ${index + 1}`}`)
                        }}
                        priority={index < 5}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                    </div>
                    {asset.title && (
                      <p className="text-sm text-gray-600 text-center truncate" title={asset.title}>
                        {asset.title}
                      </p>
                    )}
                    {asset.description && (
                      <p className="text-xs text-gray-500 text-center truncate" title={asset.description}>
                        {asset.description}
                      </p>
                    )}
                  </div>
                )
              }).filter(Boolean)}
            </div>
          </div>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <ImageModal
            isOpen={!!selectedImage}
            onClose={() => setSelectedImage(null)}
            imageUrl={getImageUrl(selectedImage.file_url)}
            title={selectedImage.title}
            description={selectedImage.description || undefined}
          />
        )}
      </div>
    )
  }

  return (
    <div className="w-full max-w-full overflow-hidden">
      <style jsx global>{`
        .prose * {
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          word-break: break-word !important;
          hyphens: auto !important;
          white-space: normal !important;
          max-width: 100% !important;
        }
        .prose p, .prose div, .prose span, .prose li, .prose td, .prose th, .prose ul, .prose ol {
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          word-break: break-word !important;
          hyphens: auto !important;
          white-space: normal !important;
          max-width: 100% !important;
        }
        .prose table {
          table-layout: fixed !important;
          width: 100% !important;
        }
        .prose table td, .prose table th {
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          word-break: break-word !important;
          hyphens: auto !important;
          white-space: normal !important;
          max-width: 100% !important;
        }
        .prose img {
          max-width: 100% !important;
          height: auto !important;
        }
        .prose pre, .prose code {
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          word-break: break-word !important;
          white-space: pre-wrap !important;
          max-width: 100% !important;
        }
        .prose strong, .prose b {
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          word-break: break-word !important;
          hyphens: auto !important;
          white-space: normal !important;
          max-width: 100% !important;
        }
        .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          word-break: break-word !important;
          hyphens: auto !important;
          white-space: normal !important;
          max-width: 100% !important;
        }
        .prose a {
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          word-break: break-word !important;
          hyphens: auto !important;
          white-space: normal !important;
          max-width: 100% !important;
        }
      `}</style>
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between py-4 gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full lg:w-auto">
          <Input
            placeholder="Filter berdasarkan nama..."
            value={(table.getColumn("name")?.getFilterValue() as string) || ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm w-full sm:w-auto"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                Kolom <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  const columnLabels: Record<string, string> = {
                    name: "Nama Trip",
                    type: "Tipe Trip",
                    status: "Status"
                  }
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {columnLabels[column.id] || column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          {table.getSelectedRowModel().rows.length > 0 && (
            <>
              <Button
                variant="destructive"
                onClick={() =>
                  console.log(
                    "Delete selected rows:",
                    table.getSelectedRowModel().rows.map((row) => (row.original as Trip).id)
                  )
                }
                className="text-xs sm:text-sm"
              >
                Hapus Terpilih ({table.getSelectedRowModel().rows.length})
              </Button>
              <Button 
                variant="outline"
                onClick={() => exportToPDF(table.getSelectedRowModel().rows.map(row => row.original as Trip))}
                className="text-xs sm:text-sm"
              >
                <FileDown className="mr-2 h-4 w-4" />
                Export Terpilih ({table.getSelectedRowModel().rows.length})
              </Button>
            </>
          )}
          <Button 
            onClick={() => router.push('/dashboard/trips/create')}
            className="bg-yellow-500 hover:bg-yellow-600 text-white transition-colors duration-200 text-xs sm:text-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Trip
          </Button>
          <Button 
            className="bg-red-500 hover:bg-red-600 text-white transition-colors duration-200 text-xs sm:text-sm"
            variant="outline"
            onClick={() => exportToPDF(table.getFilteredRowModel().rows.map(row => row.original as Trip))}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export All
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto w-full">
        <Table className="w-full table-fixed" style={{ minWidth: '1200px' }}>
          <colgroup>
            <col style={{ width: '40px' }} />
            <col style={{ width: '40px' }} />
            <col style={{ width: '50px' }} />
            <col style={{ width: '200px' }} />
            <col style={{ width: '100px' }} />
            <col style={{ width: '80px' }} />
            <col style={{ width: '80px' }} />
            <col style={{ width: '150px' }} />
            <col style={{ width: '180px' }} />
            <col style={{ width: '100px' }} />
            <col style={{ width: '60px' }} />
          </colgroup>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan} className="whitespace-nowrap text-center">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="break-words">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && (
                    <TableRow key={`${row.id}-expanded`}>
                      <TableCell colSpan={row.getVisibleCells().length} className="p-0">
                        {renderSubComponent({ row })}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Tidak ada data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-2 py-4 bg-gray-50 rounded-b-md gap-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-x-6">
          <div className="flex items-center gap-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-x-2 lg:gap-x-3">
            <div className="text-sm whitespace-nowrap">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <div className="flex items-center gap-x-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 