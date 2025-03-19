// app/dashboard/roles/data-table.tsx
"use client";

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
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Plus, FileDown } from 'lucide-react';
import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Role } from "@/types/role";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onCreate: () => void;
}

const exportToPDF = (data: Role[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Add logo and header section
  const img = new Image();
  img.src = '/img/logo.png';
  
  // Logo di sisi kiri
  const logoWidth = 30;
  const logoHeight = 30; // Asumsikan logo 30x30, sesuaikan jika berbeda
  const logoX = 14;
  const logoY = 20; // Posisi vertikal awal logo
  doc.addImage(img, 'PNG', logoX, logoY, logoWidth, logoHeight);
  
  // Company name (di samping logo, sejajar vertikal)
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  const companyName = "Gong Komodo Tour";
  const companyNameY = logoY + (logoHeight / 2) + 2; // Tengah vertikal logo, ditambah offset kecil untuk penyesuaian
  doc.text(companyName, logoX + logoWidth + 8, companyNameY); // Jarak 8 setelah logo
  
  // Address and phone (di bawah company name, sisi kiri)
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const address = [
    "Jl. Ciung Wanara I No.42, Renon,",
    "Kec. Denpasar Tim., Kota Denpasar,",
    "Bali 80234",
    "0812-3867-588"
  ];
  
  let yPos = companyNameY + 10; // Jarak setelah teks company
  address.forEach(line => {
    doc.text(line, logoX + logoWidth + 8, yPos); // Sama X dengan company name
    yPos += 6;
  });

  // Add divider line
  doc.setLineWidth(0.5);
  doc.line(14, yPos + 5, pageWidth - 14, yPos + 5);
  
  // Add report title (centered)
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  const reportTitle = "Roles Report";
  const reportTitleWidth = doc.getTextWidth(reportTitle); // Gunakan getTextWidth untuk perhitungan lebih akurat
  const reportTitleX = (pageWidth - reportTitleWidth) / 2; // Posisi X untuk tengah
  doc.text(reportTitle, reportTitleX, yPos + 20);
  
  // Add generated date (right aligned)
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const dateText = `Generated on: ${new Date().toLocaleString()}`;
  doc.text(dateText, pageWidth - 14, yPos + 30, { align: 'right' });
  
  // Define the columns for the table
  const tableColumn = [
    "No",
    "Name",
    "Status",
    "Permissions",
    "Created At",
    "Updated At"
  ];
  
  // Map the data to match the columns
  const tableRows = data.map((item, index) => [
    index + 1,
    item.name,
    item.status,
    (item.permissions as string[]).join(", "),
    new Date(item.created_at).toLocaleString(),
    new Date(item.updated_at).toLocaleString(),
  ]);

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
      1: { halign: 'left' },   // Name
      2: { halign: 'center' }, // Status
      3: { halign: 'left' },   // Permissions
      4: { halign: 'center' }, // Created At
      5: { halign: 'center' }, // Updated At
    },
  });

  // Save the PDF
  doc.save("roles-report.pdf");
};

export function DataTable<TData, TValue>({
  columns,
  data,
  onCreate,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

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
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Filter by name..."
            value={(table.getColumn("name")?.getFilterValue() as string) || ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
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
                    table.getSelectedRowModel().rows.map((row) => (row.original as Role).id)
                  )
                }
              >
                Delete Selected ({table.getSelectedRowModel().rows.length})
              </Button>
              <Button 
                variant="outline"
                onClick={() => exportToPDF(table.getSelectedRowModel().rows.map(row => row.original as Role))}
              >
                <FileDown className="mr-2 h-4 w-4" />
                Export Selected ({table.getSelectedRowModel().rows.length})
              </Button>
            </>
          )}
          <Button onClick={onCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Role
          </Button>
          <Button 
            variant="outline"
            onClick={() => exportToPDF(table.getFilteredRowModel().rows.map(row => row.original as Role))}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export All
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
          <span className="text-sm">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
        </div>
      </div>
    </div>
  );
}