"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Trip } from "@/types/trips"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ChevronDown, ChevronRight, MoreHorizontal, Trash, Pencil } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ColumnsProps {
  onDelete: (trip: Trip) => void;
  onEdit: (trip: Trip) => void;
}

export const columns = ({ onDelete, onEdit }: ColumnsProps): ColumnDef<Trip>[] => [
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
    cell: ({ row, table }) => {
      const { pageIndex, pageSize } = table.getState().pagination
      const globalIndex = row.index + 1 + pageIndex * pageSize
      return <div className="w-[50px] min-w-[50px] text-center font-medium">{globalIndex}</div>
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0"
      >
        Nama Trip
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const name = row.getValue("name") as string
      return (
        <div 
          className="w-full break-words text-xs px-1 leading-tight"
          style={{
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            whiteSpace: 'normal',
            maxWidth: '100%',
            lineHeight: '1.2'
          }}
        >
          {name}
        </div>
      )
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0"
      >
        Tipe Trip
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      return (
        <div className="w-full flex justify-center px-1">
          <Badge className={`${type === "Open Trip" ? "bg-yellow-500" : "bg-blue-500"} text-white text-xs px-2 py-1`}>
            {type}
          </Badge>
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
        <div className="w-full flex justify-center px-1">
          <Badge className={`${status === "Aktif" ? "bg-emerald-500" : "bg-red-500"} text-white text-xs px-2 py-1`}>
            {status}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "is_highlight",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0"
      >
        Highlight
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const isHighlight = row.getValue("is_highlight") as "Yes" | "No"
      return (
        <div className="w-full flex justify-center px-1">
          <Badge className={`${isHighlight === "Yes" ? "bg-yellow-500" : "bg-gray-500"} text-white text-xs px-2 py-1`}>
            {isHighlight}
          </Badge>
        </div>
      )
    },
  },
  {
    id: "boats",
    header: "Kapal",
    cell: ({ row }) => {
      const trip = row.original as Trip & {
        boats?: Array<{ id: number | string; boat_name?: string; name?: string }> | null
        trip_boats?: Array<{ boat_id: number | string; boat?: { boat_name?: string } }> | null
        boat_ids?: Array<number | string> | null
      }

      // 1) Jika API kirim relasi lengkap dalam trip.boat
      if (trip.boat && trip.boat.boat_name) {
        return (
          <div 
            className="text-xs w-full break-words px-1 leading-tight"
            style={{
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              maxWidth: '100%',
              lineHeight: '1.2'
            }}
          >
            {trip.boat.boat_name}
          </div>
        )
      }

      // 2) Jika API kirim daftar boats
      if (Array.isArray(trip.boats) && trip.boats.length > 0) {
        const names = trip.boats.map(b => b.boat_name || b.name || `ID ${b.id}`)
        return (
          <div 
            className="text-xs w-full break-words px-1 leading-tight"
            style={{
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              maxWidth: '100%',
              lineHeight: '1.2'
            }}
          >
            {names.join(", ")}
          </div>
        )
      }

      // 3) Jika API kirim pivot trip_boats dengan nested boat
      if (Array.isArray(trip.trip_boats) && trip.trip_boats.length > 0) {
        const names = trip.trip_boats.map(tb => tb.boat?.boat_name || `ID ${tb.boat_id}`)
        return (
          <div 
            className="text-xs w-full break-words px-1 leading-tight"
            style={{
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              maxWidth: '100%',
              lineHeight: '1.2'
            }}
          >
            {names.join(", ")}
          </div>
        )
      }

      // 4) Jika hanya ada boat_id/boat_ids tanpa nama
      const maybeBoatId = (trip as unknown as { boat_id?: number | string | null }).boat_id
      if (typeof maybeBoatId !== 'undefined' && maybeBoatId !== null) {
        return (
          <div 
            className="text-xs w-full break-words px-1 leading-tight"
            style={{
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              maxWidth: '100%',
              lineHeight: '1.2'
            }}
          >
            {`Boat ID: ${maybeBoatId}`}
          </div>
        )
      }
      if (Array.isArray(trip.boat_ids) && trip.boat_ids.length > 0) {
        return (
          <div 
            className="text-xs w-full break-words px-1 leading-tight"
            style={{
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              maxWidth: '100%',
              lineHeight: '1.2'
            }}
          >
            {`Boat IDs: ${trip.boat_ids.join(', ')}`}
          </div>
        )
      }

      return <div className="text-xs px-1">Tidak ada</div>
    },
  },
  {
    accessorKey: "operational_days",
    header: "Hari Operasional",
    cell: ({ row }) => {
      const trip = row.original as Trip
      // Ambil dari trip.operational_days untuk memastikan data terambil dengan benar
      const operationalDays = trip.operational_days || (row.getValue("operational_days") as string[] | undefined) || []
      
      const dayLabels: { [key: string]: string } = {
        "Monday": "Sen",
        "Tuesday": "Sel", 
        "Wednesday": "Rab",
        "Thursday": "Kam",
        "Friday": "Jum",
        "Saturday": "Sab",
        "Sunday": "Min"
      }

      // Cek apakah hari operasional hanya weekday, weekend, atau all days
      const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
      const weekend = ["Saturday", "Sunday"];
      
      const isAllDays = Array.isArray(operationalDays) && operationalDays.length > 0 && allDays.every(day => operationalDays.includes(day));
      const isWeekdaysOnly = Array.isArray(operationalDays) && operationalDays.length > 0 && weekdays.every(day => operationalDays.includes(day)) && 
                           !weekend.some(day => operationalDays.includes(day));
      const isWeekendOnly = Array.isArray(operationalDays) && operationalDays.length > 0 && weekend.every(day => operationalDays.includes(day)) && 
                          !weekdays.some(day => operationalDays.includes(day));

      return (
        <div className="text-xs space-y-1 w-full px-1">
          <div 
            className="break-words leading-tight"
            style={{
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              maxWidth: '100%',
              lineHeight: '1.2'
            }}
          >
            {Array.isArray(operationalDays) && operationalDays.length > 0 
              ? operationalDays.map(day => dayLabels[day] || day).join(", ")
              : "Tidak ada"
            }
          </div>
          {Array.isArray(operationalDays) && operationalDays.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {isAllDays ? (
                <Badge className="bg-blue-500 text-white text-xs px-1 py-0.5">Semua Hari</Badge>
              ) : isWeekdaysOnly ? (
                <Badge className="bg-green-500 text-white text-xs px-1 py-0.5">Weekday</Badge>
              ) : isWeekendOnly ? (
                <Badge className="bg-amber-500 text-white text-xs px-1 py-0.5">Weekend</Badge>
              ) : (
                <Badge className="bg-purple-500 text-white text-xs px-1 py-0.5">Custom</Badge>
              )}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "tentation",
    header: "Jadwal Fleksibel",
    cell: ({ row }) => {
      const trip = row.original as Trip
      // Ambil dari trip.tentation untuk memastikan data terambil dengan benar
      const tentation = trip.tentation || (row.getValue("tentation") as "Yes" | "No" | undefined) || "No"
      const isFlexible = tentation === "Yes"
      
      return (
        <div className="w-full flex justify-center px-1">
          <Badge className={`${isFlexible ? "bg-green-500" : "bg-gray-500"} text-white text-xs px-2 py-1`}>
            {isFlexible ? "Ya" : "Tidak"}
          </Badge>
        </div>
      )
    },
  },
  {
    id: "actions",
    header: () => null,
    cell: ({ row }) => {
      const trip = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Buka menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(trip)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(trip)}>
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