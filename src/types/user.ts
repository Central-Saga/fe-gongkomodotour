export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  password: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

