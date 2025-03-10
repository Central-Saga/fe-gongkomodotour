// app/dashboard/page.tsx
import { apiRequest } from '@/lib/api';
import { Role, ApiResponse } from '@/types/role';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function Dashboard() {
  const response: ApiResponse<Role> = await apiRequest<ApiResponse<Role>>(
    'get',
    '/api/roles/3'
  );
  const role: Role = response.data;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard - Role Details</h1>
      <Card>
        <CardHeader>
          <CardTitle>{role.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>ID:</strong> {role.id}</p>
          <p><strong>Status:</strong> {role.status}</p>
          <p><strong>Permissions:</strong></p>
          <ul className="list-disc pl-5">
            {role.permissions.map((permission, index) => (
              <li key={index}>{permission}</li>
            ))}
          </ul>
          <p><strong>Created At:</strong> {new Date(role.created_at).toLocaleString()}</p>
          <p><strong>Updated At:</strong> {new Date(role.updated_at).toLocaleString()}</p>
        </CardContent>
      </Card>
    </div>
  );
}