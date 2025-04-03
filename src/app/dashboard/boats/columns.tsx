"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Boat } from "@/types/boats"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ChevronDown, ChevronRight, MoreHorizontal, Pencil, Trash } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

interface ColumnsProps {
  onDelete: (boat: Boat) => void;
}

export const columns = ({ onDelete }: ColumnsProps): ColumnDef<Boat>[] => [
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
    accessorKey: "boat_name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0"
      >
        Nama Kapal
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="min-w-[180px]">{row.getValue("boat_name")}</div>
    ),
  },
  {
    accessorKey: "status",
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
      const status = row.getValue("status") as string
      return (
        <div className="min-w-[100px]">
          <Badge className={`${status === "Aktif" ? "bg-emerald-500" : "bg-red-500"} text-white`}>
            {status}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "cabin",
    header: "Jumlah Kabin",
    cell: ({ row }) => {
      const cabins = row.original.cabin
      return <div className="min-w-[120px]">{cabins.length} kabin</div>
    },
  },
  {
    id: "actions",
    header: () => null,
    cell: ({ row }) => {
      const boat = row.original;
      const router = useRouter();

      const handleEdit = () => {
        router.push(`/dashboard/boats/${boat.id}/edit`);
      };

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
            <DropdownMenuItem onClick={() => onDelete(boat)}>
              <Trash className="mr-2 h-4 w-4" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableHiding: false,
  },
]
