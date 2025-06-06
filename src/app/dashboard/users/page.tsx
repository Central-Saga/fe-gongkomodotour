"use client";

import { apiRequest } from '@/lib/api';
import { User, ApiResponse } from '@/types/user';
import { useEffect, useState } from "react";
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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response: ApiResponse<User[]> = await apiRequest<ApiResponse<User[]>>(
        'GET',
        '/api/users'
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
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = () => {
    setSelectedUser(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleDelete = async (user: User) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await apiRequest('DELETE', `/api/users/${user.id}`);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (err) {
      toast.error("Failed to delete user");
      console.error("Error deleting user:", err);
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
          columns={columns({ onEdit: handleEdit, onDelete: handleDelete })} 
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