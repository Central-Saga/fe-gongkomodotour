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
import { ChevronDown, FileDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal, Trash } from 'lucide-react'
import { useState } from "react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { Transaction, TransactionAsset } from "@/types/transactions"
import { toast } from "sonner"
import { apiRequest } from "@/lib/api"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import Image from "next/image"
import { ImageModal } from "@/components/ui/image-modal"
import { columns as createColumns } from "./columns"

interface DataTableProps<TData> {
  columns: ColumnDef<TData, string>[]
  data: TData[]
  setData: React.Dispatch<React.SetStateAction<TData[]>>
  onStatusUpdate?: (transactionId: string, newStatus: string) => void
}

interface TransactionResponse {
  data: Transaction[]
  message?: string
  status?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.gongkomodotour.com'

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

const exportToPDF = (data: Transaction[]) => {
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
  const reportTitle = "Transaction Report"
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
    "Nama Customer",
    "Bank",
    "Total Pembayaran",
    "Status",
    "Created At",
    "Updated At"
  ]
  
  // Map the data to match the columns
  const tableRows = data.map((item, index) => [
    index + 1,
    item.booking.customer_name,
    item.bank_type,
    `Rp ${parseFloat(item.total_amount).toLocaleString('id-ID')}`,
    item.payment_status,
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
      1: { halign: 'left' },   // Nama Customer
      2: { halign: 'center' }, // Bank
      3: { halign: 'right' },  // Total Pembayaran
      4: { halign: 'center' }, // Status
      5: { halign: 'center' }, // Created At
      6: { halign: 'center' }, // Updated At
    },
  })

  // Save the PDF
  doc.save("transaction-report.pdf")
}

export function DataTable({
  columns,
  data,
  setData,
  onStatusUpdate,
}: DataTableProps<Transaction>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedImage, setSelectedImage] = useState<TransactionAsset | null>(null)
  const [updateKey, setUpdateKey] = useState(0)

  const handleDelete = async (transaction: Transaction) => {
    try {
      setIsDeleting(true)
      await apiRequest('DELETE', `/api/transactions/${transaction.id}`)
      toast.success("Transaksi berhasil dihapus")
      // Refresh data dengan memanggil ulang API
      const response = await apiRequest<TransactionResponse>('GET', '/api/transactions')
      setData(response.data || [])
    } catch (error) {
      console.error("Error deleting transaction:", error)
      toast.error("Gagal menghapus transaksi")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleStatusUpdate = async (transactionId: string, newStatus: string) => {
    try {
      console.log(`Updating transaction ${transactionId} to status: ${newStatus}`)
      
      // Find the transaction to get all required fields
      const transaction = data.find(t => t.id === transactionId)
      if (!transaction) {
        throw new Error('Transaction not found')
      }
      
      console.log('Transaction data:', {
        id: transaction.id,
        booking_id: transaction.booking_id,
        bank_type: transaction.bank_type,
        total_amount: transaction.total_amount,
        payment_proof: transaction.payment_proof,
        payment_status: newStatus
      })
      
      // Update status via backend API with all required fields
      const response = await apiRequest('PUT', `/api/transactions/${transactionId}`, {
        booking_id: transaction.booking_id,
        bank_type: transaction.bank_type,
        total_amount: transaction.total_amount,
        payment_proof: transaction.payment_proof,
        payment_status: newStatus
      })
      
      console.log('API response:', response)
      
      // Update local data
      setData((prevData: Transaction[]) => {
        const updatedData = prevData.map((transaction: Transaction) => 
          transaction.id === transactionId 
            ? { ...transaction, payment_status: newStatus }
            : transaction
        )
        console.log('Updated data for transaction:', updatedData.find(t => t.id === transactionId))
        return updatedData
      })
      
      // Show success notification
      toast.success(`Status pembayaran berhasil diubah menjadi "${newStatus}"`)
      
      // Force re-render
      setUpdateKey(prev => prev + 1)
      
      // Call parent callback if provided
      if (onStatusUpdate) {
        onStatusUpdate(transactionId, newStatus)
      }
    } catch (error) {
      console.error("Error updating transaction status:", error)
      toast.error("Gagal mengubah status pembayaran")
    }
  }

  const DeleteConfirmationDialog = ({ transaction, children }: { transaction: Transaction, children: React.ReactNode }) => {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          {children}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus transaksi {transaction.booking.customer_name}? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDelete(transaction)}
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
      ...createColumns(handleStatusUpdate, updateKey).filter((col: ColumnDef<Transaction, string>) => col.id !== "actions"),
      {
        id: "actions",
        header: () => null,
        cell: ({ row }) => {
          const transaction = row.original
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
                  <DeleteConfirmationDialog transaction={transaction}>
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

  const renderSubComponent = ({ row }: { row: Row<Transaction> }) => {
    const transaction = row.original
    
    console.log('Transaction data for rendering:', {
      id: transaction.id,
      payment_proof: transaction.payment_proof,
      payment_status: transaction.payment_status,
      booking: transaction.booking,
      assetsCount: transaction.assets?.length || 0,
      assets: transaction.assets?.map((a: TransactionAsset) => ({ id: a.id, title: a.title, file_url: a.file_url })) || []
    })
    
    return (
      <div className="p-4 bg-muted/50 rounded-lg">
        <div className="space-y-4 max-w-5xl mx-auto">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">Detail Transaksi</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-600 font-medium mb-1">ID Transaksi:</p>
                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                  <p className="text-gray-800">{transaction.id}</p>
                </div>
              </div>
              <div>
                <p className="text-gray-600 font-medium mb-1">Bank:</p>
                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                  <p className="text-gray-800">{transaction.bank_type}</p>
                </div>
              </div>
              <div>
                <p className="text-gray-600 font-medium mb-1">Total Pembayaran:</p>
                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                  <p className="text-gray-800">Rp {parseFloat(transaction.total_amount).toLocaleString('id-ID')}</p>
                </div>
              </div>
              <div>
                <p className="text-gray-600 font-medium mb-1">Status:</p>
                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    transaction.payment_status === "Lunas" ? "bg-green-100 text-green-800" :
                    transaction.payment_status === "Pembayaran Berhasil" ? "bg-green-100 text-green-800" :
                    transaction.payment_status === "Menunggu Pembayaran" ? "bg-yellow-100 text-yellow-800" :
                    transaction.payment_status === "Ditolak" ? "bg-red-100 text-red-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {transaction.payment_status}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-gray-600 font-medium mb-1">Tanggal Dibuat:</p>
                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                  <p className="text-gray-800">{new Date(transaction.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <p className="text-gray-600 font-medium mb-1">Tanggal Diperbarui:</p>
                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                  <p className="text-gray-800">{new Date(transaction.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bukti Pembayaran - Assets */}
          {(transaction.assets && transaction.assets.length > 0) && (
            <div className="bg-white p-6 rounded-lg shadow-sm w-full overflow-hidden">
              <h4 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">Bukti Pembayaran</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
                {transaction.assets.map((asset: TransactionAsset, index: number) => {
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
                          alt={asset.title || `Bukti Pembayaran ${index + 1}`}
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
                              transactionId: transaction.id
                            })
                            const target = e.target as HTMLImageElement
                            // Gunakan data URL untuk placeholder yang valid
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4='
                          }}
                          onLoad={() => {
                            console.log(`Image loaded successfully for asset ${asset.id || index}: ${asset.title || `Bukti Pembayaran ${index + 1}`}`)
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

          {/* Fallback untuk payment_proof lama jika assets tidak ada */}
          {(!transaction.assets || transaction.assets.length === 0) && transaction.payment_proof && (
            <div className="bg-white p-6 rounded-lg shadow-sm w-full overflow-hidden">
              <h4 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">Bukti Pembayaran</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                <div 
                  className="space-y-2 cursor-pointer group w-full"
                  onClick={() => {
                    // Buat objek asset sementara untuk kompatibilitas
                    const tempAsset: TransactionAsset = {
                      id: 0,
                      title: "Bukti Pembayaran",
                      description: "Bukti pembayaran transaksi",
                      file_url: transaction.payment_proof,
                      original_file_url: transaction.payment_proof,
                      is_external: false,
                      file_path: "",
                      created_at: transaction.created_at,
                      updated_at: transaction.updated_at
                    }
                    setSelectedImage(tempAsset)
                  }}
                >
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 w-full">
                    <Image
                      src={getImageUrl(transaction.payment_proof)}
                      alt="Bukti Pembayaran"
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-200 group-hover:scale-105"
                      unoptimized={true}
                      onError={(e) => {
                        console.error(`Error loading payment proof image:`, {
                          paymentProof: transaction.payment_proof,
                          transactionId: transaction.id,
                          error: e
                        })
                        const target = e.target as HTMLImageElement
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4='
                      }}
                      onLoad={() => {
                        console.log(`Payment proof image loaded successfully for transaction ${transaction.id}`)
                      }}
                      priority={true}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                  </div>
                  <p className="text-sm text-gray-600 text-center truncate" title="Bukti Pembayaran">
                    Bukti Pembayaran
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Detail Booking */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">Detail Booking</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-600 font-medium mb-1">ID Booking:</p>
                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                  <p className="text-gray-800">{transaction.booking.id}</p>
                </div>
              </div>
              <div>
                <p className="text-gray-600 font-medium mb-1">Nama Customer:</p>
                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                  <p className="text-gray-800">{transaction.booking.customer_name}</p>
                </div>
              </div>
              <div>
                <p className="text-gray-600 font-medium mb-1">Email:</p>
                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                  <p className="text-gray-800">{transaction.booking.customer_email}</p>
                </div>
              </div>
              <div>
                <p className="text-gray-600 font-medium mb-1">Telepon:</p>
                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                  <p className="text-gray-800">{transaction.booking.customer_phone}</p>
                </div>
              </div>
              <div>
                <p className="text-gray-600 font-medium mb-1">Alamat:</p>
                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                  <p className="text-gray-800">{transaction.booking.customer_address}</p>
                </div>
              </div>
              <div>
                <p className="text-gray-600 font-medium mb-1">Negara:</p>
                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                  <p className="text-gray-800">{transaction.booking.customer_country}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Trip */}
          {transaction.booking.trip && (
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">Detail Trip</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-600 font-medium mb-1">Nama Trip:</p>
                  <div className="bg-gray-50 p-2 rounded border border-gray-100">
                    <p className="text-gray-800">{transaction.booking.trip.name}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 font-medium mb-1">Tipe:</p>
                  <div className="bg-gray-50 p-2 rounded border border-gray-100">
                    <p className="text-gray-800">{transaction.booking.trip.type}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 font-medium mb-1">Status:</p>
                  <div className="bg-gray-50 p-2 rounded border border-gray-100">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.booking.trip.status === "Aktif" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {transaction.booking.trip.status}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 font-medium mb-1">Waktu Mulai:</p>
                  <div className="bg-gray-50 p-2 rounded border border-gray-100">
                    <p className="text-gray-800">{transaction.booking.trip.start_time}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 font-medium mb-1">Waktu Selesai:</p>
                  <div className="bg-gray-50 p-2 rounded border border-gray-100">
                    <p className="text-gray-800">{transaction.booking.trip.end_time}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 font-medium mb-1">Titik Kumpul:</p>
                  <div className="bg-gray-50 p-2 rounded border border-gray-100">
                    <p className="text-gray-800">{transaction.booking.trip.meeting_point}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Detail Pembayaran */}
          {transaction.details.length > 0 && (
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">Detail Pembayaran</h4>
              <div className="space-y-4">
                {transaction.details.map((detail, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-gray-600 font-medium mb-1">ID:</p>
                        <div className="bg-white p-2 rounded border border-gray-100">
                          <p className="text-gray-800">{detail.id}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium mb-1">Jumlah:</p>
                        <div className="bg-white p-2 rounded border border-gray-100">
                          <p className="text-gray-800">Rp {parseFloat(detail.amount).toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium mb-1">Deskripsi:</p>
                        <div className="bg-white p-2 rounded border border-gray-100">
                          <p className="text-gray-800">{detail.description}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-600 font-medium mb-1">Tanggal Dibuat:</p>
                        <div className="bg-white p-2 rounded border border-gray-100">
                          <p className="text-gray-800">{new Date(detail.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
              description={selectedImage.description || "Bukti pembayaran transaksi"}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl">
      <style jsx global>{`
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
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Filter berdasarkan nama customer..."
            value={(table.getColumn("customer_name")?.getFilterValue() as string) || ""}
            onChange={(event) =>
              table.getColumn("customer_name")?.setFilterValue(event.target.value)
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
                    customer_name: "Nama Customer",
                    bank_type: "Bank",
                    total_amount: "Total Pembayaran",
                    payment_status: "Status"
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
                    table.getSelectedRowModel().rows.map((row) => (row.original as Transaction).id)
                  )
                }
              >
                Hapus Terpilih ({table.getSelectedRowModel().rows.length})
              </Button>
              <Button 
                variant="outline"
                onClick={() => exportToPDF(table.getSelectedRowModel().rows.map(row => row.original as Transaction))}
              >
                <FileDown className="mr-2 h-4 w-4" />
                Export Terpilih ({table.getSelectedRowModel().rows.length})
              </Button>
            </>
          )}
          <Button 
            className="bg-red-500 hover:bg-red-600 text-white transition-colors duration-200"
            variant="outline"
            onClick={() => exportToPDF(table.getFilteredRowModel().rows.map(row => row.original as Transaction))}
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