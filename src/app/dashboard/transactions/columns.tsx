"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Transaction } from "@/types/transactions"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ChevronDown, ChevronRight, MoreHorizontal, Trash } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const ActionsCell = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Buka menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Trash className="mr-2 h-4 w-4" />
          Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const columns = (onStatusUpdate?: (transactionId: string, newStatus: string) => void, updateKey?: number): ColumnDef<Transaction>[] => [
  {
    id: "expander",
    header: () => null,
    cell: ({ row }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => row.toggleExpanded()}
          className="p-0 w-6 h-6"
        >
          {row.getIsExpanded() ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      )
    },
    enableHiding: false,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="w-[30px]">
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
          className="cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="w-[30px]">
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(e.target.checked)}
          className="cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "no",
    header: "No",
    cell: ({ row }) => {
      return <div className="w-[50px] font-medium">{row.index + 1}</div>
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "customer_name",
    accessorFn: (row) => row.booking.customer_name,
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0"
      >
        Nama Customer
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="min-w-[180px]">{row.original.booking.customer_name}</div>
    ),
  },
  {
    accessorKey: "bank_type",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0"
      >
        Bank
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="min-w-[120px]">{row.getValue("bank_type")}</div>
    ),
  },
  {
    accessorKey: "total_amount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0"
      >
        Total Pembayaran
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total_amount"))
      return (
        <div className="min-w-[150px]">
          Rp {amount.toLocaleString('id-ID')}
        </div>
      )
    },
  },
  {
    accessorKey: "payment_status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0"
      >
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.getValue("payment_status") as string
      const transaction = row.original
      
      console.log(`Rendering status for transaction ${transaction.id}:`, {
        id: transaction.id,
        status: status,
        customer: transaction.booking?.customer_name
      })
      
      const statusOptions = [
        { value: "Menunggu Pembayaran", label: "Menunggu Pembayaran", color: "bg-yellow-100 text-yellow-800" },
        { value: "Lunas", label: "Lunas", color: "bg-green-100 text-green-800" },
        { value: "Pembayaran Berhasil", label: "Pembayaran Berhasil", color: "bg-green-100 text-green-800" },
        { value: "Ditolak", label: "Ditolak", color: "bg-red-100 text-red-800" }
      ]
      
      const currentStatus = statusOptions.find(option => option.value === status) || statusOptions[0]
      
      return (
        <div className="min-w-[150px]">
          <Select
            key={`status-${transaction.id}-${status}-${updateKey || 0}`}
            value={status}
            onValueChange={(newStatus) => {
              if (onStatusUpdate && newStatus !== status) {
                onStatusUpdate(transaction.id, newStatus)
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${currentStatus.color}`}>
                  {currentStatus.label}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${option.color}`}>
                      {option.label}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )
    },
  },
  {
    id: "actions",
    header: () => null,
    cell: () => {
      return <ActionsCell />;
    },
    enableHiding: false,
  },
] 