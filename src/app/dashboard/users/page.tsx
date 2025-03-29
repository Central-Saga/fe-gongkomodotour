"use client";

import { apiRequest } from '@/lib/api';
import { User, ApiResponse } from '@/types/user';
import { useEffect, useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { formSchema } from "./user-form";
import { columns } from './columns';
import { UserDialog } from './user-dialog';
import { DataTable } from './data-table';

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

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
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

  if (loading) return <div className="container mx-auto p-4">Loading...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Users</h1>
      </div>
      <DataTable<User, string>
        columns={columns({ onEdit: handleEdit, onDelete: handleDelete })} 
        data={data}
        onCreate={handleCreate}
      />
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