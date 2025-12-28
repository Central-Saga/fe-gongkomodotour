"use client";

import { apiRequest } from '@/lib/api';
import { apiCache } from '@/lib/browserCache';
import { User, ApiResponse } from '@/types/user';
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { createFormSchema } from "./user-form";
import { columns } from './columns';
import { UserDialog } from './user-dialog';
import { DataTable } from './data-table';

type FormData = z.infer<typeof createFormSchema>
type FormDataWithoutPassword = Omit<FormData, 'password' | 'password_confirmation'>

export default function UserPages() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id?: number; roles?: string[] } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      // Gunakan cache browser untuk mempercepat loading
      const response: ApiResponse<User[]> = await apiRequest<ApiResponse<User[]>>(
        'GET',
        '/api/users',
        undefined,
        { useCache: true } // Aktifkan cache browser
      );
      setData(response.data || []);
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch users";
      setError(errorMessage);
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    
    // Ambil current user dari localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser({
          id: user.id,
          roles: user.roles || []
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, [fetchUsers]);

  // Re-fetch ketika window mendapat focus (user kembali ke tab/halaman)
  useEffect(() => {
    const handleFocus = () => {
      // Clear cache dan refresh data saat window mendapat focus
      apiCache.clear('/api/users')
      fetchUsers()
    }

    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [fetchUsers])

  const handleCreate = () => {
    setSelectedUser(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  // Helper function untuk normalisasi role
  const normalizeRole = (role: string | string[] | undefined): string => {
    if (!role) return '';
    const roleStr = Array.isArray(role) ? role[0] : role;
    return roleStr.trim();
  };

  // Helper function untuk cek permission delete
  const canDeleteUser = (targetUser: User): { canDelete: boolean; reason?: string } => {
    // Jika tidak ada current user data, tidak bisa delete
    if (!currentUser?.id || !currentUser?.roles) {
      return { canDelete: false, reason: "Data user tidak ditemukan" };
    }

    const currentUserRole = normalizeRole(currentUser.roles);
    const targetUserRole = normalizeRole(targetUser.role);

    // Hanya Super Admin yang bisa delete
    if (currentUserRole !== 'Super Admin') {
      return { canDelete: false, reason: "Hanya Super Admin yang dapat menghapus user" };
    }

    // Super Admin tidak bisa menghapus dirinya sendiri
    if (currentUser.id === targetUser.id) {
      return { canDelete: false, reason: "Anda tidak dapat menghapus akun sendiri" };
    }

    // Super Admin tidak bisa menghapus Super Admin lain
    if (targetUserRole === 'Super Admin') {
      return { canDelete: false, reason: "Super Admin tidak dapat menghapus Super Admin lain" };
    }

    // Super Admin bisa menghapus Admin dan role lainnya
    return { canDelete: true };
  };

  const handleDelete = async (user: User) => {
    // Validasi permission
    const permission = canDeleteUser(user);
    if (!permission.canDelete) {
      toast.error(permission.reason || "Tidak memiliki izin untuk menghapus user ini");
      return;
    }

    try {
      setIsDeleting(true);
      await apiRequest('DELETE', `/api/users/${user.id}`);
      toast.success("User berhasil dihapus");
      // Clear cache setelah delete untuk memastikan data fresh
      apiCache.clearByPattern('users')
      fetchUsers();
    } catch (err) {
      toast.error("Gagal menghapus user");
      console.error("Error deleting user:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (data: FormData | FormDataWithoutPassword) => {
    try {
      setIsSubmitting(true);
      if (selectedUser) {
        await apiRequest('PUT', `/api/users/${selectedUser.id}`, data);
        toast.success("User updated successfully");
      } else {
        await apiRequest('POST', '/api/users', data);
        toast.success("User created successfully");
      }
      setDialogOpen(false);
      // Clear cache setelah create/update untuk memastikan data fresh
      apiCache.clearByPattern('users')
      fetchUsers();
    } catch (err) {
      toast.error(selectedUser ? "Failed to update user" : "Failed to create user");
      console.error("Error submitting user:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="container mx-auto p-4 flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  if (error) return (
    <div className="container mx-auto p-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 flex items-center">
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        {error}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-500 mt-1">Manage user accounts and permissions</p>
        </div>
      </div>
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
        <DataTable<User, string>
          columns={columns({ 
            onEdit: handleEdit, 
            onDelete: handleDelete,
            currentUserId: currentUser?.id,
            currentUserRole: normalizeRole(currentUser?.roles),
            isDeleting: isDeleting
          })} 
          data={data}
          onCreate={handleCreate}
        />
      </div>
      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={selectedUser}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
}