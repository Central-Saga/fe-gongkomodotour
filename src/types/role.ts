// types/role.ts
export interface Role {
  id: number;
  name: string;
  status: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data: T;
}