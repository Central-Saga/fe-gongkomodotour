"use client";

import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import bgAuth from "../../../../public/img/auth/bg-auth.jpg";
import logo from "../../../../public/img/logo.png";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  status: string;
}

// Define the form schema using Zod
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." }),
  rememberMe: z.boolean().default(false),
});

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Initialize the form with react-hook-form and zod
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      const response = await apiRequest<LoginResponse>('POST', '/api/login', {
        email: values.email,
        password: values.password,
      }, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      console.log('Login response:', response);
      
      // Simpan token ke cookies
      if (response.access_token) {
        document.cookie = `access_token=${response.access_token}; path=/`;
        document.cookie = `token_type=${response.token_type}; path=/`;
        
        // Simpan data user ke localStorage
        localStorage.setItem('user', JSON.stringify({
          name: response.user.name,
          email: response.user.email
        }));
      }
      
      // Jika login berhasil, redirect ke halaman dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      // Di sini Anda bisa menambahkan toast notification atau alert untuk menampilkan error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Section - Login Form */}
      <div className="w-1/2 flex items-center justify-center bg-white p-10">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bold text-gray-800 mb-6 flex items-center">
            <Image
              src={logo}
              alt="Gong Komodo Tour Logo"
              width={400}
              height={100}
              className="mx-auto"
            />
          </h1>
          <h2 className="text-3xl font-semibold text-[#CFB53B] mb-8 text-center">Sign In</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium text-gray-700">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="example@gmail.com"
                        {...field}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium text-gray-700">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Remember Me and Forget Password */}
              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                        />
                      </FormControl>
                      <FormLabel className="text-sm text-gray-700">Remember</FormLabel>
                    </FormItem>
                  )}
                />
                <a href="#" className="text-sm text-blue-600 hover:underline">
                  Forget Password?
                </a>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-[#CFB53B] text-white py-2 px-4 rounded-md hover:bg-[#b6a032] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#CFB53B]"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing In..." : "Sign In"}
              </Button>

              {/* Sign Up Link */}
              <p className="text-center text-sm text-gray-600">
                I&apos;m a new user{' '}
                <a href="#" className="text-blue-600 hover:underline">
                  Sign Up
                </a>
              </p>
            </form>
          </Form>
        </div>
      </div>

      {/* Right Section - Local Image (Unchanged) */}
      <div className="w-1/2 relative">
        <Image
          src={bgAuth}
          alt="Komodo Tour Background"
          fill
          style={{ objectFit: 'cover' }}
          className="absolute inset-0"
        />
      </div>
    </div>
  );
}