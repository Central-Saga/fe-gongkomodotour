export interface Permission {
  id: number;
  name: string;
  status: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
} 