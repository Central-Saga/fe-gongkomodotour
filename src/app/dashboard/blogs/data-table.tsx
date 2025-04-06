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
import { Badge } from "@/components/ui/badge"
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
import { ChevronDown, FileDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus, MoreHorizontal, Pencil, Trash, X } from 'lucide-react'
import { useState } from "react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { Blog, BlogAsset } from "@/types/blog"
import { useRouter } from "next/navigation"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { apiRequest } from "@/lib/api"
import Image from "next/image"

interface DataTableProps<TData> {
  columns: ColumnDef<TData, string>[]
  data: TData[]
  setData: (data: TData[]) => void
}

const exportToPDF = (data: Blog[]) => {
  const doc = new jsPDF()
  
  // Add company info
  doc.setFontSize(16)
  doc.text('PT. Gong Komodo Tour', 14, 15)
  doc.setFontSize(12)
  doc.text('Jl. Soekarno Hatta No. 1', 14, 22)
  doc.text('Labuan Bajo, Manggarai Barat, NTT', 14, 29)
  
  // Add report title
  doc.setFontSize(14)
  doc.text('Laporan Blog', 14, 40)
  
  // Add date
  const date = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  doc.setFontSize(10)
  doc.text(`Tanggal: ${date}`, 14, 47)
  
  // Add table
  const tableData = data.map(item => [
    item.title,
    item.author.name,
    item.status === "published" ? "Published" : "Draft",
    new Date(item.created_at).toLocaleDateString('id-ID')
  ])
  
  autoTable(doc, {
    head: [['Judul', 'Penulis', 'Status', 'Tanggal Dibuat']],
    body: tableData,
    startY: 55,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontSize: 9,
      fontStyle: 'bold',
    },
  })
  
  doc.save('laporan-blog.pdf')
}

const getImageUrl = (fileUrl: string) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const cleanFileUrl = fileUrl.startsWith('/storage/') ? fileUrl.substring(8) : fileUrl
  return `${API_URL}/storage/${cleanFileUrl}`
}

export function DataTable({
  columns,
  data,
  setData,
}: DataTableProps<Blog>) {
  const router = useRouter()
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
  const [selectedImage, setSelectedImage] = useState<BlogAsset | null>(null)

  const handleDelete = async (blog: Blog) => {
    try {
      setIsDeleting(true)
      await apiRequest('DELETE', `/api/blogs/${blog.id}`)
      toast.success("Blog berhasil dihapus")
      // Refresh data dengan memanggil ulang API
      const response = await apiRequest<{ data: Blog[] }>('GET', '/api/blogs')
      setData(response.data || [])
    } catch (error) {
      console.error("Error deleting blog:", error)
      toast.error("Gagal menghapus blog")
    } finally {
      setIsDeleting(false)
    }
  }

  const DeleteConfirmationDialog = ({ blog, children }: { blog: Blog, children: React.ReactNode }) => {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          {children}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus blog {blog.title}? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDelete(blog)}
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
          const blog = row.original
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
                  <DropdownMenuItem onClick={() => router.push(`/dashboard/blogs/${blog.id}/edit`)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DeleteConfirmationDialog blog={blog}>
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
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      expanded,
      pagination,
    },
    onExpandedChange: setExpanded,
    getExpandedRowModel: getExpandedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const renderSubComponent = ({ row }: { row: Row<Blog> }) => {
    const blog = row.original
    return (
      <div className="p-4 bg-muted/50 rounded-lg">
        <div className="space-y-4 max-w-5xl mx-auto">
          {/* Konten Blog */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">Konten Blog</h4>
            <div className="bg-gray-50 p-3 rounded-md">
              <div 
                className="prose prose-sm max-w-none"
                style={{ 
                  maxWidth: '100%',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </div>
          </div>

          {/* Assets Blog */}
          {blog.assets && blog.assets.length > 0 && (
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">Gambar Blog</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {blog.assets.map((asset, index) => {
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
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Informasi Penulis */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">Informasi Penulis</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nama</p>
                <p className="font-medium">{blog.author.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{blog.author.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="font-medium">{blog.author.role}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-medium">
                  <Badge className={`${blog.author.status === "Aktif" ? "bg-emerald-500" : "bg-red-500"} text-white`}>
                    {blog.author.status}
                  </Badge>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Filter judul..."
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("title")?.setFilterValue(event.target.value)
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
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
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
                onClick={() => {
                  const selectedIds = table.getSelectedRowModel().rows.map((row) => (row.original as Blog).id)
                  setData(data.filter(item => !selectedIds.includes(item.id)))
                }}
              >
                Hapus Terpilih ({table.getSelectedRowModel().rows.length})
              </Button>
              <Button 
                variant="outline"
                onClick={() => exportToPDF(table.getSelectedRowModel().rows.map(row => row.original as Blog))}
              >
                <FileDown className="mr-2 h-4 w-4" />
                Export Terpilih ({table.getSelectedRowModel().rows.length})
              </Button>
            </>
          )}
          <Button 
            onClick={() => router.push('/dashboard/blogs/create')}
            className="bg-yellow-500 hover:bg-yellow-600 text-white transition-colors duration-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Blog
          </Button>
          <Button 
            className="bg-red-500 hover:bg-red-600 text-white transition-colors duration-200"
            variant="outline"
            onClick={() => exportToPDF(table.getFilteredRowModel().rows.map(row => row.original as Blog))}
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
                    <TableRow>
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
      <div className="flex items-center justify-between px-2 py-4 bg-gray-50 rounded-b-md border-t">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center gap-x-6">
          <div className="flex items-center gap-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
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

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-4xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{selectedImage.title || 'Gambar Blog'}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative aspect-video">
              <Image
                src={getImageUrl(selectedImage.file_url)}
                alt={selectedImage.title || 'Gambar Blog'}
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 