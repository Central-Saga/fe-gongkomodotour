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
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronDown, FileDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus, MoreHorizontal, Pencil, Trash } from 'lucide-react'
import { useState } from "react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { Boat, BoatAsset } from "@/types/boats"
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

const exportToPDF = (data: Boat[]) => {
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
  const reportTitle = "Boat Report"
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
    "Nama Kapal",
    "Status",
    "Jumlah Kabin",
    "Created At",
    "Updated At"
  ]
  
  // Map the data to match the columns
  const tableRows = data.map((item, index) => [
    index + 1,
    item.boat_name,
    item.status,
    item.cabin.length,
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
      1: { halign: 'left' },   // Nama Kapal
      2: { halign: 'center' }, // Status
      3: { halign: 'center' }, // Jumlah Kabin
      4: { halign: 'center' }, // Created At
      5: { halign: 'center' }, // Updated At
    },
  })

  // Save the PDF
  doc.save("boat-report.pdf")
}

export function DataTable({
  columns,
  data,
}: DataTableProps<Boat>) {
  const router = useRouter()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [selectedImage, setSelectedImage] = useState<BoatAsset | null>(null)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const handleEdit = (boat: Boat) => {
    router.push(`/dashboard/boats/${boat.id}/edit`)
  }

  const handleDelete = (boat: Boat) => {
    console.log("Delete boat:", boat.id)
  }

  const table = useReactTable({
    data,
    columns: [
      ...columns.filter(col => col.id !== "actions"),
      {
        id: "actions",
        header: () => null,
        cell: ({ row }) => {
          const boat = row.original
          return (
            <div className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Buka menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(boat)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(boat)}>
                    <Trash className="mr-2 h-4 w-4" />
                    Hapus
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
        enableHiding: false,
      }
    ],
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

  const renderSubComponent = ({ row }: { row: Row<Boat> }) => {
    const boat = row.original as Boat
    
    return (
      <div className="p-4 bg-muted/50 rounded-lg">
        {/* Informasi Kapal */}
        <div className="space-y-4 max-w-5xl mx-auto">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">Informasi Kapal</h4>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 font-medium mb-2">Spesifikasi:</p>
                  <div className="bg-gray-50 p-3 rounded-md overflow-auto">
                    <p className="text-gray-800 whitespace-pre-wrap break-words">{boat.spesification}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 font-medium mb-2">Informasi Kabin:</p>
                  <div className="bg-gray-50 p-3 rounded-md overflow-auto">
                    <p className="text-gray-800 whitespace-pre-wrap break-words">{boat.cabin_information}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 font-medium mb-2">Fasilitas:</p>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-gray-800 whitespace-pre-wrap break-words">{boat.facilities}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Kabin */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
            <h4 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">Daftar Kabin</h4>
            <div className="space-y-6">
              {boat.cabin.map((cabin, index) => (
                <div key={index} className="bg-gray-50 p-3 sm:p-4 rounded-md">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Nama Kabin:</p>
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <p className="text-gray-800">{cabin.cabin_name}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Tipe Bed:</p>
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <p className="text-gray-800 capitalize">{cabin.bed_type}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Kapasitas:</p>
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <p className="text-gray-800">{cabin.min_pax} - {cabin.max_pax} orang</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Status:</p>
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <Badge className={`${cabin.status === "Aktif" ? "bg-emerald-500" : "bg-red-500"} text-white`}>
                          {cabin.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Harga Dasar:</p>
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <p className="text-gray-800">Rp {cabin.base_price}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Harga Tambahan:</p>
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <p className="text-gray-800">Rp {cabin.additional_price}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gambar Kapal */}
        {boat.assets && boat.assets.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm mt-6">
            <h4 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">Gambar Kapal</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {boat.assets.map((asset, index) => {
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
            value={(table.getColumn("boat_name")?.getFilterValue() as string) || ""}
            onChange={(event) =>
              table.getColumn("boat_name")?.setFilterValue(event.target.value)
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
                    boat_name: "Nama Kapal",
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
                    table.getSelectedRowModel().rows.map((row) => (row.original as Boat).id)
                  )
                }
              >
                Hapus Terpilih ({table.getSelectedRowModel().rows.length})
              </Button>
              <Button 
                variant="outline"
                onClick={() => exportToPDF(table.getSelectedRowModel().rows.map(row => row.original as Boat))}
              >
                <FileDown className="mr-2 h-4 w-4" />
                Export Terpilih ({table.getSelectedRowModel().rows.length})
              </Button>
            </>
          )}
          <Button 
            onClick={() => router.push('/dashboard/boats/create')}
            className="bg-yellow-500 hover:bg-yellow-600 text-white transition-colors duration-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Kapal
          </Button>
          <Button 
            className="bg-red-500 hover:bg-red-600 text-white transition-colors duration-200"
            variant="outline"
            onClick={() => exportToPDF(table.getFilteredRowModel().rows.map(row => row.original as Boat))}
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
