"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Boat } from "@/types/boats"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ChevronDown, ChevronRight, MoreHorizontal, Pencil, Trash } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

const ActionsCell = ({ row }: { row: { original: Boat } }) => {
  const router = useRouter()
  const boat = row.original

  const handleEdit = () => {
    // Simpan pagination state sebelum navigate ke edit page
    // Ambil dari table state jika ada, atau dari sessionStorage
    if (typeof window !== 'undefined') {
      // Coba ambil dari URL dulu
      const urlParams = new URLSearchParams(window.location.search)
      const pageParam = urlParams.get('page')
      
      if (pageParam !== null) {
        sessionStorage.setItem('boats_page', pageParam)
      } else {
        // Jika tidak ada di URL, cek sessionStorage
        const savedPage = sessionStorage.getItem('boats_page')
        if (savedPage === null) {
          // Jika tidak ada, simpan page 0 sebagai default
          sessionStorage.setItem('boats_page', '0')
        }
      }
    }
    router.push(`/dashboard/boats/${boat.id}/edit`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Buka menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Trash className="mr-2 h-4 w-4" />
          Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const columns = (): ColumnDef<Boat>[] => [
  {
    id: "expander",
    header: () => null,
    cell: ({ row }) => {
      return (
        <div className="text-center">
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
        </div>
      )
    },
    enableHiding: false,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="w-[30px] text-center">
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
          className="cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="w-[30px] text-center">
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
    header: () => <div className="text-center font-medium w-full">No</div>,
    cell: ({ row }) => {
      return <div className="w-full font-medium text-center">{row.index + 1}</div>
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "boat_name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0 text-left font-medium"
      >
        Nama Kapal
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="min-w-[180px] text-left">{row.getValue("boat_name")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0 text-center font-medium w-full justify-center"
      >
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <div className="w-full text-center">
          <Badge className={`${status === "Aktif" ? "bg-emerald-500" : "bg-red-500"} text-white`}>
            {status}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "cabin",
    header: () => <div className="text-center font-medium w-full">Jumlah Kabin</div>,
    cell: ({ row }) => {
      const cabins = row.original.cabin
      return <div className="w-full text-center">{cabins.length} kabin</div>
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center font-medium w-full">Aksi</div>,
    cell: ({ row }) => {
      return (
        <div className="w-full text-center">
          <ActionsCell row={row} />
        </div>
      );
    },
    enableHiding: false,
  },
]
