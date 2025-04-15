"use client";

import { apiRequest } from '@/lib/api';
import { Role, ApiResponse } from '@/types/role';
import { useEffect, useState } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { RoleDialog } from "./role-dialog";
import { toast } from "sonner";
import * as z from "zod";
import { formSchema } from "./role-form";

export default function RolePages() {
  const [data, setData] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response: ApiResponse<Role[]> = await apiRequest<ApiResponse<Role[]>>(
        'GET',
        '/api/roles'
      );
      setData(response.data || []);
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch roles";
      setError(errorMessage);
      console.error("Error fetching roles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCreate = () => {
    setSelectedRole(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setDialogOpen(true);
  };

  const handleDelete = async (role: Role) => {
    if (!confirm("Are you sure you want to delete this role?")) return;

    try {
      await apiRequest('DELETE', `/api/roles/${role.id}`);
      toast.success("Role deleted successfully");
      fetchRoles();
    } catch (err) {
      toast.error("Failed to delete role");
      console.error("Error deleting role:", err);
    }
  };

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      if (selectedRole) {
        await apiRequest('PUT', `/api/roles/${selectedRole.id}`, data);
        toast.success("Role updated successfully");
      } else {
        await apiRequest('POST', '/api/roles', data);
        toast.success("Role created successfully");
      }
      setDialogOpen(false);
      fetchRoles();
    } catch (err) {
      toast.error(selectedRole ? "Failed to update role" : "Failed to create role");
      console.error("Error submitting role:", err);
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
          <h1 className="text-3xl font-bold text-gray-900">Roles Management</h1>
          <p className="text-gray-500 mt-1">Manage user roles and permissions</p>
        </div>
      </div>
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
        <DataTable 
          columns={columns({ onEdit: handleEdit, onDelete: handleDelete })} 
          data={data}
          onCreate={handleCreate}
        />
      </div>
      <RoleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={selectedRole}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
}