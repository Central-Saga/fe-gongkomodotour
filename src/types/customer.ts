// types/customer.ts
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "Aktif" | "Non Aktif";
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  user_id: number;
  alamat: string;
  no_hp: string;
  nasionality: string;
  region: "domestic" | "overseas";
  status: "Aktif" | "Non Aktif";
  created_at: string;
  updated_at: string;
  user: User;
}

export interface CustomerResponse {
  data: Customer[];
} 