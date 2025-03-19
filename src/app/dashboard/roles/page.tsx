"use client"

"use client";

import { apiRequest } from '@/lib/api';
import { Role, ApiResponse } from '@/types/role';
import { useEffect, useState } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default function RolePages() {
  const [data, setData] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

    fetchRoles();
  }, []);

  if (loading) return <div className="container mx-auto p-4">Loading...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Roles Dashboard</h1>
      <DataTable columns={columns} data={data} />
    </div>
  );
}