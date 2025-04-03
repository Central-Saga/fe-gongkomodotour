"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Hotel } from "@/types/hotels"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

export const columns = ({ onDelete }: { onDelete: (hotel: Hotel) => void }): ColumnDef<Hotel>[] => [
  {
    accessorKey: "hotel_name",
    header: "Nama Hotel",
  },
  {
    accessorKey: "hotel_type",
    header: "Tipe Hotel",
  },
  {
    accessorKey: "occupancy",
    header: "Tipe Kamar",
  },
  {
    accessorKey: "price",
    header: "Harga",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"))
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(price)
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <span className={`px-2 py-1 rounded-full text-xs ${
          status === "Aktif" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {status}
        </span>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const hotel = row.original
      return (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(hotel)}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )
    },
  },
] 