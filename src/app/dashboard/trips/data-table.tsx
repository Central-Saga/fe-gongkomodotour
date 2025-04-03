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
import { Trip, TripAsset } from "@/types/trips"
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
  if (fileUrl.startsWith('http')) {
    return fileUrl
  }
  return `${API_URL}${fileUrl}`
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
  return <div dangerouslySetInnerHTML={{ __html: html }} className="prose max-w-none" />
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
    
    return (
      <div className="p-4 bg-muted/50 rounded-lg">
        {/* Informasi Trip */}
        <div className="space-y-4 max-w-5xl mx-auto">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">Informasi Trip</h4>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 font-medium mb-2">Include:</p>
                  <div className="bg-gray-50 p-3 rounded-md overflow-auto">
                    <div className="prose prose-sm max-w-none">
                      <HtmlContent html={trip.include} />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 font-medium mb-2">Exclude:</p>
                  <div className="bg-gray-50 p-3 rounded-md overflow-auto">
                    <div className="prose prose-sm max-w-none">
                      <HtmlContent html={trip.exclude} />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 font-medium mb-2">Catatan:</p>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-gray-800 whitespace-pre-wrap break-words">{trip.note}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 font-medium mb-2">Meeting Point:</p>
                  <div className="bg-gray-50 p-3 rounded-md">
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 font-medium mb-2">Waktu Mulai:</p>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-gray-800">{trip.start_time}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium mb-2">Waktu Selesai:</p>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-gray-800">{trip.end_time}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Itinerary */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
            <h4 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">Itinerary</h4>
            <div className="space-y-6">
              {trip.itineraries.sort((a, b) => a.day_number - b.day_number).map((itinerary, index) => (
                <div key={index} className="bg-gray-50 p-3 sm:p-4 rounded-md">
                  <div className="flex flex-col">
                    <p className="font-medium text-gray-800 mb-2 text-base inline-flex items-center">
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md mr-2">
                        Hari {itinerary.day_number}
                      </span>
                    </p>
                    <div className="bg-white p-3 rounded-md border border-gray-100">
                      <div className="bg-gray-50 p-3 rounded-md overflow-auto">
                        <div className="prose prose-sm max-w-none prose-headings:mt-2 prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
                          <HtmlContent html={itinerary.activities} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Flight Schedules */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h4 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">Jadwal Penerbangan</h4>
            <div className="grid gap-4 md:grid-cols-2">
              {trip.flight_schedules.map((schedule, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-md">
                  <p className="font-medium text-gray-800 mb-3 text-base break-words">{schedule.route}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div>
                        <p className="text-gray-600 font-medium">ETD Time:</p>
                        <div className="bg-white p-2 rounded border border-gray-100">
                          <p className="text-gray-800">{schedule.etd_time}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">ETD Text:</p>
                        <div className="bg-white p-2 rounded border border-gray-100">
                          <p className="text-gray-800">{schedule.etd_text}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-gray-600 font-medium">ETA Time:</p>
                        <div className="bg-white p-2 rounded border border-gray-100">
                          <p className="text-gray-800">{schedule.eta_time}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium">ETA Text:</p>
                        <div className="bg-white p-2 rounded border border-gray-100">
                          <p className="text-gray-800">{schedule.eta_text}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trip Durations & Prices */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h4 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">Durasi & Harga</h4>
            <div className="space-y-6">
              {trip.trip_durations.map((duration, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-md">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Label Durasi:</p>
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <p className="text-gray-800">{duration.duration_label}</p>
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
                    <div>
                      <p className="font-medium text-gray-800 mb-3">Harga per Pax:</p>
                      <div className="space-y-3">
                        {duration.trip_prices.map((price, priceIndex) => (
                          <div key={priceIndex} className="bg-white p-3 rounded-md border border-gray-100">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                                <p className="font-medium">{price.price_per_pax}</p>
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
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h4 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">Biaya Tambahan</h4>
            <div className="space-y-4">
              {trip.additional_fees.map((fee, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-md">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Kategori:</p>
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <p className="text-gray-800">{fee.fee_category}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Harga:</p>
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <p className="text-gray-800">{fee.price}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Wilayah:</p>
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <p className="text-gray-800">{fee.region}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Satuan:</p>
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <p className="text-gray-800">{fee.unit}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                        <p className="text-gray-800">{fee.day_type}</p>
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

          {/* Surcharges */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h4 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">Surcharge</h4>
            <div className="space-y-4">
              {trip.surcharges.map((surcharge, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-md">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Musim:</p>
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <p className="text-gray-800">{surcharge.season}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Tanggal Mulai:</p>
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <p className="text-gray-800">{surcharge.start_date}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Tanggal Selesai:</p>
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <p className="text-gray-800">{surcharge.end_date}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Harga:</p>
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <p className="text-gray-800">{surcharge.surcharge_price}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium mb-1">Status:</p>
                    <div className="bg-white p-2 rounded border border-gray-100">
                      <Badge className={`${surcharge.status === "Aktif" ? "bg-emerald-500" : "bg-red-500"} text-white`}>
                        {surcharge.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gambar Trip - Dipindahkan ke bawah */}
        {trip.assets && trip.assets.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm mt-6">
            <h4 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">Gambar Trip</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {trip.assets.map((asset, index) => {
                const imageUrl = getImageUrl(asset.file_url)
                return (
                  <div 
                    key={index} 
                    className="space-y-2 cursor-pointer group"
                    onClick={() => setSelectedImage(asset)}
                  >
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-gray-200">
                      <Image
                        src={imageUrl}
                        alt={asset.title || `Gambar ${index + 1}`}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                        className="object-cover transition-transform duration-200 group-hover:scale-105"
                        onError={(e) => {
                          console.error(`Error loading image ${index}:`, e)
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder-image.png'
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
              })}
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
    <div className="container mx-auto max-w-7xl">
      {/* Toolbar */}
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Filter berdasarkan nama..."
            value={(table.getColumn("name")?.getFilterValue() as string) || ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
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
        <div className="flex space-x-2">
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
              >
                Hapus Terpilih ({table.getSelectedRowModel().rows.length})
              </Button>
              <Button 
                variant="outline"
                onClick={() => exportToPDF(table.getSelectedRowModel().rows.map(row => row.original as Trip))}
              >
                <FileDown className="mr-2 h-4 w-4" />
                Export Terpilih ({table.getSelectedRowModel().rows.length})
              </Button>
            </>
          )}
          <Button 
            onClick={() => router.push('/dashboard/trips/create')}
            className="bg-yellow-500 hover:bg-yellow-600 text-white transition-colors duration-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Trip
          </Button>
          <Button 
            className="bg-red-500 hover:bg-red-600 text-white transition-colors duration-200"
            variant="outline"
            onClick={() => exportToPDF(table.getFilteredRowModel().rows.map(row => row.original as Trip))}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export All
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
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
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && (
                    <TableRow key={`${row.id}-expanded`}>
                      <TableCell colSpan={row.getVisibleCells().length}>
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
      <div className="flex items-center justify-between px-2 py-4 bg-gray-50 rounded-b-md">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center gap-x-6">
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