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
import { Transaction } from "@/types/transactions"
import { toast } from "sonner"
import { apiRequest } from "@/lib/api"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import Image from "next/image"

interface DataTableProps<TData> {
  columns: ColumnDef<TData, string>[]
  data: TData[]
  setData: (data: TData[]) => void
}

interface TransactionResponse {
  data: Transaction[]
  message?: string
  status?: string
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
      ...columns.filter(col => col.id !== "actions"),
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
                    transaction.payment_status === "Pembayaran Berhasil" ? "bg-green-100 text-green-800" :
                    transaction.payment_status === "Menunggu Pembayaran" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
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

          {/* Bukti Pembayaran */}
          {transaction.payment_proof && (
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">Bukti Pembayaran</h4>
              <div className="flex justify-center">
                <div className="relative w-full max-w-2xl h-[400px]">
                  <Image 
                    src={transaction.payment_proof} 
                    alt="Bukti Pembayaran" 
                    fill
                    className="object-contain rounded-lg shadow-md"
                  />
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