"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Pencil, Trash, MoreHorizontal } from "lucide-react";
import { User } from "@/types/user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import * as React from "react";

interface ColumnsProps {
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  currentUserId?: number;
  currentUserRole?: string;
  isDeleting?: boolean;
}

// Helper function untuk normalisasi role (trim whitespace)
const normalizeRole = (role: string | undefined): string => {
  if (!role) return '';
  return role.trim();
};

// Helper function untuk cek permission delete
const canDeleteUser = (
  currentUserRole: string | undefined,
  currentUserId: number | undefined,
  targetUser: User
): boolean => {
  // Jika tidak ada current user data, tidak bisa delete
  if (!currentUserRole || !currentUserId) {
    return false;
  }

  const normalizedCurrentRole = normalizeRole(currentUserRole);
  const normalizedTargetRole = normalizeRole(targetUser.role);

  // Hanya Super Admin yang bisa delete
  if (normalizedCurrentRole !== 'Super Admin') {
    return false;
  }

  // Super Admin tidak bisa menghapus dirinya sendiri
  if (currentUserId === targetUser.id) {
    return false;
  }

  // Super Admin tidak bisa menghapus Super Admin lain
  if (normalizedTargetRole === 'Super Admin') {
    return false;
  }

  // Super Admin bisa menghapus Admin dan role lainnya (selain Super Admin)
  return true;
};

export const columns = ({ onEdit, onDelete, currentUserId, currentUserRole, isDeleting = false }: ColumnsProps): ColumnDef<User>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
        className="cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(e.target.checked)}
        className="cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "no",
    header: "No",
    cell: ({ row, table }) => {
      const pageSize = table.getState().pagination.pageSize;
      const pageIndex = table.getState().pagination.pageIndex;
      return <div className="font-medium">{pageIndex * pageSize + row.index + 1}</div>;
    },
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0"
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0"
      >
        Email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("email")}</div>,
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
      const status = row.getValue("status") as string;
      return (
        <Badge className={`${status === "Aktif" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"} text-white transition-colors duration-200`}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0"
      >
        Role
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const roleValue = row.getValue("role");
      return <div>{typeof roleValue === 'string' ? roleValue : Array.isArray(roleValue) ? (roleValue as string[]).join(", ") : ''}</div>;
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0"
      >
        Created At
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const value = row.getValue("created_at");
      const date = value ? new Date(value.toString()) : new Date();
      return <div>{date.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: "updated_at",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0"
      >
        Updated At
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const value = row.getValue("updated_at");
      const date = value ? new Date(value.toString()) : new Date();
      return <div>{date.toLocaleString()}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      const canDelete = canDeleteUser(currentUserRole, currentUserId, user);

      const DeleteConfirmationDialog = ({ user, children }: { user: User, children: React.ReactNode }) => {
        return (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              {children}
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus user <strong>{user.name}</strong> ({user.email})? Tindakan ini tidak dapat dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onDelete(user)}
                  disabled={isDeleting}
                  className="bg-red-500 hover:bg-red-600"
                >
                  {isDeleting ? "Menghapus..." : "Hapus"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        );
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full transition-colors duration-200">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white shadow-lg rounded-lg border border-gray-100">
            <DropdownMenuItem 
              onClick={() => onEdit(user)} 
              className="hover:bg-gray-50 cursor-pointer text-gray-700"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            {canDelete ? (
              <DeleteConfirmationDialog user={user}>
                <DropdownMenuItem 
                  onSelect={(e) => e.preventDefault()}
                  className="hover:bg-gray-50 cursor-pointer text-red-600"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DeleteConfirmationDialog>
            ) : (
              <DropdownMenuItem 
                disabled
                className="cursor-not-allowed text-gray-400 opacity-50"
                title={
                  currentUserRole !== 'Super Admin' 
                    ? "Hanya Super Admin yang dapat menghapus user"
                    : currentUserId === user.id
                    ? "Anda tidak dapat menghapus akun sendiri"
                    : user.role === 'Super Admin'
                    ? "Super Admin tidak dapat menghapus Super Admin lain"
                    : "Tidak dapat menghapus user ini"
                }
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];