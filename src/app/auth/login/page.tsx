"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
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
import { motion } from "framer-motion";

interface Customer {
  id: number;
  user_id: number;
  alamat: string;
  no_hp: string;
  nasionality: string;
  region: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
  customer: Customer;
  roles: string[];
  permissions: string[];
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

  // Cek apakah user sudah login dan handle history
  useEffect(() => {
    const token = document.cookie.split('access_token=')[1]?.split(';')[0];
    
    // Bersihkan history browser
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = function() {
      window.history.pushState(null, '', window.location.href);
    };

    if (token) {
      // Ambil data user dari localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        // Redirect berdasarkan roles
        if (user.roles.includes('Super Admin') || user.roles.includes('Admin')) {
          router.replace('/dashboard');
        } else {
          router.replace('/');
        }
      }
    }
  }, [router]);

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
      
      if (response.access_token) {
        // Simpan token ke cookies dengan opsi secure dan httpOnly
        document.cookie = `access_token=${response.access_token}; path=/; secure; samesite=strict`;
        document.cookie = `token_type=${response.token_type}; path=/; secure; samesite=strict`;
        
        // Simpan data user ke localStorage
        localStorage.setItem('user', JSON.stringify({
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role,
          roles: response.roles,
          permissions: response.permissions,
          customer: response.customer
        }));

        // Bersihkan history dan redirect berdasarkan roles
        if (response.roles.includes('Super Admin') || response.roles.includes('Admin')) {
          window.history.pushState(null, '', '/dashboard');
          router.replace('/dashboard');
        } else {
          window.history.pushState(null, '', '/');
          router.replace('/');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Section - Login Form */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-1/2 flex items-center justify-center bg-white p-10"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full max-w-md"
        >
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl font-bold text-gray-800 mb-6 flex items-center"
          >
            <Image
              src={logo}
              alt="Gong Komodo Tour Logo"
              width={400}
              height={100}
              className="mx-auto"
            />
          </motion.h1>
          <motion.h2 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-3xl font-semibold text-[#CFB53B] mb-8 text-center"
          >
            Sign In
          </motion.h2>
          <Form {...form}>
            <motion.form 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              onSubmit={form.handleSubmit(onSubmit)} 
              className="space-y-6"
            >
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
                <a href="/auth/register" className="text-sm text-blue-600 hover:underline">
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
                <a href="/auth/register" className="text-blue-600 hover:underline">
                  Sign Up
                </a>
              </p>
            </motion.form>
          </Form>
        </motion.div>
      </motion.div>

      {/* Right Section - Local Image */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="w-1/2 relative"
      >
        <Image
          src={bgAuth}
          alt="Komodo Tour Background"
          fill
          style={{ objectFit: 'cover' }}
          className="absolute inset-0"
        />
      </motion.div>
    </div>
  );
}