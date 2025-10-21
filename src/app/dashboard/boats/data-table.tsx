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
import { toast } from "sonner"
import { apiRequest } from "@/lib/api"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface DataTableProps<TData> {
  columns: ColumnDef<TData, string>[]
  data: TData[]
  setData: (data: TData[]) => void
}

interface BoatResponse {
  data: Boat[]
  message?: string
  status?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Fungsi untuk mendapatkan URL gambar dengan fallback
const getImageUrl = (fileUrl: string) => {
  if (!fileUrl) {
    console.warn('Empty URL provided to getImageUrl')
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4='
  }
  
  console.log('Original URL:', fileUrl)
  
  if (fileUrl.startsWith('http')) {
    console.log('Returning absolute URL:', fileUrl)
    return fileUrl
  }
  
  // Pastikan URL dimulai dengan slash
  const cleanUrl = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`
  const fullUrl = `${API_URL}${cleanUrl}`
  console.log('Constructed URL:', fullUrl)
  return fullUrl
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
  setData,
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
  const [isDeleting, setIsDeleting] = useState(false)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const [imageLoading, setImageLoading] = useState<Set<string>>(new Set())

  // Fungsi untuk handle error gambar
  const handleImageError = (imageSrc: string) => {
    console.error("Image failed to load:", imageSrc)
    setImageErrors(prev => new Set(prev).add(imageSrc))
    setImageLoading(prev => {
      const newSet = new Set(prev)
      newSet.delete(imageSrc)
      return newSet
    })
  }

  // Fungsi untuk handle loading gambar
  const handleImageLoad = (imageSrc: string) => {
    setImageLoading(prev => {
      const newSet = new Set(prev)
      newSet.delete(imageSrc)
      return newSet
    })
  }

  // Fungsi untuk mendapatkan safe image source
  const getSafeImageSrc = (imageSrc: string, fallback: string = '/placeholder-image.png') => {
    if (!imageSrc || imageErrors.has(imageSrc)) {
      return fallback
    }
    return imageSrc
  }

  // Fungsi untuk retry loading gambar
  const retryImageLoad = (imageSrc: string) => {
    setImageErrors(prev => {
      const newSet = new Set(prev)
      newSet.delete(imageSrc)
      return newSet
    })
    setImageLoading(prev => new Set(prev).add(imageSrc))
  }

  const handleEdit = (boat: Boat) => {
    router.push(`/dashboard/boats/${boat.id}/edit`)
  }

  const handleDelete = async (boat: Boat) => {
    try {
      setIsDeleting(true)
      await apiRequest('DELETE', `/api/boats/${boat.id}`)
      toast.success("Kapal berhasil dihapus")
      // Refresh data dengan memanggil ulang API
      const response = await apiRequest<BoatResponse>('GET', '/api/boats')
      setData(response.data || [])
    } catch (error) {
      console.error("Error deleting boat:", error)
      toast.error("Gagal menghapus kapal")
    } finally {
      setIsDeleting(false)
    }
  }

  const DeleteConfirmationDialog = ({ boat, children }: { boat: Boat, children: React.ReactNode }) => {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          {children}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus kapal {boat.boat_name}? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDelete(boat)}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
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
                  <DeleteConfirmationDialog boat={boat}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Trash className="mr-2 h-4 w-4" />
                      Hapus
                    </DropdownMenuItem>
                  </DeleteConfirmationDialog>
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
       <div className="p-4 bg-muted/50 rounded-lg w-full overflow-hidden">
         {/* Informasi Kapal */}
         <div className="space-y-4 w-full">
           <div className="bg-white p-4 rounded-lg shadow-sm w-full overflow-hidden">
             <h4 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">Informasi Kapal</h4>
             <div className="space-y-6 w-full">
               <div>
                 <p className="text-gray-600 font-medium mb-2">Spesifikasi:</p>
                 <div className="bg-gray-50 p-3 rounded-md overflow-auto w-full">
                   <div className="prose prose-sm max-w-none break-words overflow-wrap-anywhere">
                     <HtmlContent html={boat.spesification} />
                   </div>
                 </div>
               </div>
               <div>
                 <p className="text-gray-600 font-medium mb-2">Informasi Kabin:</p>
                 <div className="bg-gray-50 p-3 rounded-md overflow-auto w-full">
                   <div className="prose prose-sm max-w-none break-words overflow-wrap-anywhere">
                     <HtmlContent html={boat.cabin_information} />
                   </div>
                 </div>
               </div>
               <div>
                 <p className="text-gray-600 font-medium mb-2">Fasilitas:</p>
                 <div className="bg-gray-50 p-3 rounded-md overflow-auto w-full">
                   <div className="prose prose-sm max-w-none break-words overflow-wrap-anywhere">
                     <HtmlContent html={boat.facilities} />
                   </div>
                 </div>
               </div>
             </div>
           </div>

          {/* Kabin */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm w-full overflow-hidden">
            <h4 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">Daftar Kabin</h4>
            <div className="space-y-6 w-full">
              {boat.cabin.map((cabin, index) => (
                <div key={index} className="bg-gray-50 p-3 sm:p-4 rounded-md w-full overflow-hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Nama Kabin:</p>
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <p className="text-gray-800 break-words">{cabin.cabin_name}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Tipe Bed:</p>
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <p className="text-gray-800 capitalize break-words">{cabin.bed_type}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Bathroom:</p>
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <p className="text-gray-800 break-words">{cabin.bathroom || "Tidak ada informasi"}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Kapasitas:</p>
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <p className="text-gray-800 break-words">{cabin.min_pax} - {cabin.max_pax} orang</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 w-full">
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Status:</p>
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <Badge className={`${cabin.status === "Aktif" ? "bg-emerald-500" : "bg-red-500"} text-white`}>
                          {cabin.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Harga Dasar:</p>
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <p className="text-gray-800 break-words">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          }).format(Number(cabin.base_price))}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Harga Tambahan:</p>
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <p className="text-gray-800 break-words">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          }).format(Number(cabin.additional_price))}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Gambar Kabin */}
                  {cabin.assets && cabin.assets.length > 0 && (
                    <div className="mt-4 w-full overflow-hidden">
                      <p className="text-gray-600 font-medium mb-2">Gambar Kabin:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
                        {cabin.assets.map((asset, assetIndex) => {
                          const imageUrl = getImageUrl(asset.file_url)
                          const isError = imageErrors.has(imageUrl)
                          const isLoading = imageLoading.has(imageUrl)
                          
                          return (
                            <div 
                              key={assetIndex} 
                              className="relative aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 cursor-pointer group"
                              onClick={() => !isError && setSelectedImage(asset)}
                            >
                              {isLoading && (
                                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                </div>
                              )}
                              {isError ? (
                                <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center p-2">
                                  <div className="text-gray-400 mb-2">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      retryImageLoad(imageUrl)
                                    }}
                                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                                  >
                                    Retry
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <Image
                                    src={getSafeImageSrc(imageUrl)}
                                    alt={asset.title || `Gambar Kabin ${assetIndex + 1}`}
                                    fill
                                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw"
                                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                                    onError={() => handleImageError(imageUrl)}
                                    onLoad={() => handleImageLoad(imageUrl)}
                                    unoptimized={true}
                                    priority={assetIndex < 3}
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                                </>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gambar Kapal */}
        {boat.assets && boat.assets.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm mt-6 w-full overflow-hidden">
            <h4 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">Gambar Kapal</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
              {boat.assets.map((asset, index) => {
                const imageUrl = getImageUrl(asset.file_url)
                const isError = imageErrors.has(imageUrl)
                const isLoading = imageLoading.has(imageUrl)
                
                return (
                  <div 
                    key={index} 
                    className="space-y-2 cursor-pointer group w-full"
                    onClick={() => !isError && setSelectedImage(asset)}
                  >
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-gray-200">
                      {isLoading && (
                        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                      )}
                      {isError ? (
                        <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center p-2">
                          <div className="text-gray-400 mb-2">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              retryImageLoad(imageUrl)
                            }}
                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                          >
                            Retry
                          </button>
                        </div>
                      ) : (
                        <>
                          <Image
                            src={getSafeImageSrc(imageUrl)}
                            alt={asset.title || `Gambar ${index + 1}`}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                            className="object-cover transition-transform duration-200 group-hover:scale-105"
                            onError={() => handleImageError(imageUrl)}
                            onLoad={() => handleImageLoad(imageUrl)}
                            unoptimized={true}
                            priority={index < 5}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                        </>
                      )}
                    </div>
                    {asset.title && (
                      <p className="text-sm text-gray-600 text-center break-words" title={asset.title}>
                        {asset.title}
                      </p>
                    )}
                    {asset.description && (
                      <p className="text-xs text-gray-500 text-center break-words" title={asset.description}>
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
            imageUrl={getSafeImageSrc(getImageUrl(selectedImage.file_url))}
            title={selectedImage.title}
            description={selectedImage.description || undefined}
          />
        )}
      </div>
    )
  }

  return (
    <div className="w-full overflow-hidden">
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
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #888 #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #666;
        }
      `}</style>
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between py-4 gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full lg:w-auto">
          <Input
            placeholder="Filter berdasarkan nama..."
            value={(table.getColumn("boat_name")?.getFilterValue() as string) || ""}
            onChange={(event) =>
              table.getColumn("boat_name")?.setFilterValue(event.target.value)
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
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
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
                className="text-xs sm:text-sm"
              >
                Hapus Terpilih ({table.getSelectedRowModel().rows.length})
              </Button>
              <Button 
                variant="outline"
                onClick={() => exportToPDF(table.getSelectedRowModel().rows.map(row => row.original as Boat))}
                className="text-xs sm:text-sm"
              >
                <FileDown className="mr-2 h-4 w-4" />
                Export Terpilih ({table.getSelectedRowModel().rows.length})
              </Button>
            </>
          )}
          <Button 
            onClick={() => router.push('/dashboard/boats/create')}
            className="bg-yellow-500 hover:bg-yellow-600 text-white transition-colors duration-200 text-xs sm:text-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Kapal
          </Button>
          <Button 
            className="bg-red-500 hover:bg-red-600 text-white transition-colors duration-200 text-xs sm:text-sm"
            variant="outline"
            onClick={() => exportToPDF(table.getFilteredRowModel().rows.map(row => row.original as Boat))}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export All
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border w-full">
        <Table className="w-full">
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
