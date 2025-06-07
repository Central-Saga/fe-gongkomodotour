"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { User } from "@/types/user"
import { Role, ApiResponse } from "@/types/role"
import { apiRequest } from "@/lib/api"
import { useEffect, useState } from "react"

export const baseSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Invalid email address.",
  }),
  status: z.enum(["Aktif", "Non Aktif"], {
    required_error: "Please select a status.",
  }),
  role: z.string({
    required_error: "Please select a role.",
  }),
})

export const createFormSchema = baseSchema.extend({
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  password_confirmation: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
})

export const editFormSchema = baseSchema.extend({
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }).optional().or(z.literal('')),
  password_confirmation: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }).optional().or(z.literal('')),
}).refine((data: { password?: string; password_confirmation?: string }) => {
  if (data.password && data.password_confirmation) {
    return data.password === data.password_confirmation
  }
  return true
}, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
})

type FormData = z.infer<typeof createFormSchema>
type EditFormData = z.infer<typeof editFormSchema>
type FormDataWithoutPassword = Omit<FormData, 'password' | 'password_confirmation'>

interface UserFormProps {
  initialData?: User
  onSubmit: (data: FormData | FormDataWithoutPassword) => void
  isLoading?: boolean
}

export function UserForm({ initialData, onSubmit, isLoading }: UserFormProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const isEditing = !!initialData;

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response: ApiResponse<Role[]> = await apiRequest<ApiResponse<Role[]>>(
          'GET',
          '/api/roles?status=1'
        );
        setRoles(response.data || []);
      } catch (err) {
        console.error("Error fetching roles:", err);
      }
    };

    fetchRoles();
  }, []);

  const form = useForm<EditFormData>({
    resolver: zodResolver(isEditing ? editFormSchema : createFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      password: "",
      password_confirmation: "",
      role: initialData?.role || "",
      status: (initialData?.status as "Aktif" | "Non Aktif") || "Aktif",
    },
  })

  const handleSubmit = (data: EditFormData) => {
    if (isEditing && !data.password) {
      // Jika dalam mode edit dan password kosong, hapus field password dari data
      const dataWithoutPassword = {
        name: data.name,
        email: data.email,
        status: data.status,
        role: data.role
      };
      onSubmit(dataWithoutPassword as FormDataWithoutPassword);
    } else {
      onSubmit(data as FormData);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter user name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter user email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password {isEditing && "(Optional)"}</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder={isEditing ? "Leave blank to keep current password" : "Enter user password"} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password_confirmation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password {isEditing && "(Optional)"}</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder={isEditing ? "Leave blank to keep current password" : "Confirm user password"} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Non Aktif">Non Aktif</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Saving..." : initialData ? "Update User" : "Create User"}
        </Button>
      </form>
    </Form>
  )
} 