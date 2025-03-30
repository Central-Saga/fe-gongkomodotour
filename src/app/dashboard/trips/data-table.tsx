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
import { ChevronDown, FileDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useState } from "react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { Trip } from "@/types/trips"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
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

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [expanded, setExpanded] = useState<ExpandedState>({})
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

  const renderSubComponent = ({ row }: { row: Row<TData> }) => {
    const trip = row.original as Trip
    return (
      <div className="p-6 bg-muted/50 rounded-lg">
        {/* Informasi Trip */}
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h4 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">Informasi Trip</h4>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 font-medium mb-2">Include:</p>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-gray-800 whitespace-pre-wrap break-words">{trip.include}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 font-medium mb-2">Exclude:</p>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-gray-800 whitespace-pre-wrap break-words">{trip.exclude}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 font-medium mb-2">Note:</p>
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
                          <p className="text-gray-800 break-words line-clamp-2 cursor-help">{trip.meeting_point}</p>
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
                    <p className="text-gray-600 font-medium mb-2">Start Time:</p>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-gray-800">{trip.start_time}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium mb-2">End Time:</p>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-gray-800">{trip.end_time}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Itinerary */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h4 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">Itinerary</h4>
            <div className="space-y-6">
              {trip.itineraries.map((itinerary, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-md">
                  <div className="flex flex-col">
                    <p className="font-medium text-gray-800 mb-2 text-base inline-flex items-center">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md mr-2">
                        Day {itinerary.day_number}
                      </span>
                    </p>
                    <div className="bg-white p-3 rounded-md border border-gray-100">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed break-words">{itinerary.activities}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Flight Schedules */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h4 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">Flight Schedules</h4>
            <div className="grid gap-4 md:grid-cols-2">
              {trip.flight_schedules.map((schedule, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-md">
                  <p className="font-medium text-gray-800 mb-3 text-base break-words">{schedule.route}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-gray-600 font-medium">ETD:</p>
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-gray-800 break-words line-clamp-2 cursor-help">{schedule.etd_text}</p>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs break-words">{schedule.etd_text}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-600 font-medium">ETA:</p>
                      <div className="bg-white p-2 rounded border border-gray-100">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-gray-800 break-words line-clamp-2 cursor-help">{schedule.eta_text}</p>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs break-words">{schedule.eta_text}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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