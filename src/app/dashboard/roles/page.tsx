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

  if (loading) return <div className="container mx-auto p-4">Loading...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Roles</h1>
      </div>
      <DataTable 
        columns={columns({ onEdit: handleEdit, onDelete: handleDelete })} 
        data={data}
        onCreate={handleCreate}
      />
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