"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Hotel } from "@/types/hotels"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash, ChevronRight, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

interface ColumnsProps {
  onDelete: (hotel: Hotel) => void;
}

const ActionsCell = ({ hotel, onDelete }: { hotel: Hotel, onDelete: (hotel: Hotel) => void }) => {
  const router = useRouter();

  const handleEdit = () => {
    // Simpan pagination state sebelum navigate ke edit page
    if (typeof window !== 'undefined') {
      // Coba ambil dari URL dulu
      const urlParams = new URLSearchParams(window.location.search)
      const pageParam = urlParams.get('page')
      
      if (pageParam !== null) {
        sessionStorage.setItem('hotels_page', pageParam)
      } else {
        // Jika tidak ada di URL, cek sessionStorage
        const savedPage = sessionStorage.getItem('hotels_page')
        if (savedPage === null) {
          // Jika tidak ada, simpan page 0 sebagai default
          sessionStorage.setItem('hotels_page', '0')
        }
      }
    }
    router.push(`/dashboard/hotels/${hotel.id}/edit`);
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
        <DropdownMenuItem onClick={() => onDelete(hotel)}>
          <Trash className="mr-2 h-4 w-4" />
          Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns = ({ onDelete }: ColumnsProps): ColumnDef<Hotel>[] => [
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
    id: "expand",
    header: () => null,
    cell: ({ row }) => {
      const hotel = row.original;
      const hasSurcharges = hotel.surcharges && hotel.surcharges.length > 0;
      
      if (!hasSurcharges) {
        return <div className="w-[30px]"></div>;
      }

      return (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => row.toggleExpanded()}
        >
          {row.getIsExpanded() ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      );
    },
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
    accessorKey: "hotel_name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0"
      >
        Nama Hotel
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="min-w-[180px]">{row.getValue("hotel_name")}</div>
    ),
  },
  {
    accessorKey: "hotel_type",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0"
      >
        Tipe Hotel
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="min-w-[120px]">{row.getValue("hotel_type")}</div>
    ),
  },
  {
    accessorKey: "occupancy",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0"
      >
        Tipe Kamar
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="min-w-[120px]">{row.getValue("occupancy")}</div>
    ),
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0"
      >
        Harga
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"))
      return (
        <div className="min-w-[120px]">
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
          }).format(price)}
        </div>
      )
    },
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
    id: "actions",
    header: () => null,
    cell: ({ row }) => {
      const hotel = row.original;
      return <ActionsCell hotel={hotel} onDelete={onDelete} />;
    },
    enableHiding: false,
  },
] 