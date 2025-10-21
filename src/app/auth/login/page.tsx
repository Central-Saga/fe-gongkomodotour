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
import api from "@/lib/api";
import { motion } from "framer-motion";
import { toast } from "sonner";

// Helper function to set a cookie
const setCookie = (name: string, value: string, days: number) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "")  + expires + "; path=/";
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
    const token = localStorage.getItem('access_token');
    if (token) {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
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
      
      const response = await api.post('/api/login', {
        email: values.email,
        password: values.password,
      });
      
      console.log('Full response:', response);
      console.log('Response data:', response.data);
      
      const { access_token, token_type, user, roles, permissions, customer } = response.data;
      
      if (access_token) {
        console.log('Token received:', access_token);
        console.log('User data:', user);
        console.log('Roles:', roles);
        
        // Simpan token di localStorage dan cookie
        localStorage.setItem('access_token', access_token);
        setCookie('access_token', access_token, 7); // Simpan cookie selama 7 hari
        localStorage.setItem('token_type', token_type);
        
        // Simpan data user di localStorage
        localStorage.setItem('user', JSON.stringify({ ...user, roles, permissions, customer }));
        
        // Redirect berdasarkan role
        if (roles && (roles.includes('Super Admin') || roles.includes('Admin'))) {
          console.log('Redirecting to dashboard...');
          router.push('/dashboard');
        } else {
          console.log('Redirecting to home...');
          router.push('/');
        }
      } else {
        console.error('No access token in response');
        toast.error('Gagal login: Token tidak ditemukan');
      }

    } catch (error) {
      console.error('Login error:', error);
      // Tampilkan pesan error ke user
      const errorMessage = error instanceof Error ? error.message : 'Gagal login. Silakan coba lagi.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Section - Login Form */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-1/2 flex items-center justify-center bg-white p-8 lg:p-12"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full max-w-md"
        >
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center mb-8"
          >
            <Image
              src={logo}
              alt="Gong Komodo Tour Logo"
              width={350}
              height={90}
              className="mx-auto mb-4"
            />
            <h2 className="text-3xl font-semibold text-[#CFB53B]">
              Sign In
            </h2>
            <p className="text-gray-600 mt-2">Welcome back! Please sign in to your account</p>
          </motion.div>
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
                      <FormLabel className="text-sm text-gray-700">Remember me</FormLabel>
                    </FormItem>
                  )}
                />
                <a href="/auth/register" className="text-sm text-blue-600 hover:underline">
                  Forgot Password?
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

              {/* Navigation Links */}
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  I&apos;m a new user{' '}
                  <a href="/auth/register" className="text-blue-600 hover:underline font-medium">
                    Sign Up
                  </a>
                </p>
                <p className="text-sm text-gray-600">
                  Back to{' '}
                  <a href="/" className="text-[#CFB53B] hover:underline font-medium">
                    Home
                  </a>
                </p>
              </div>
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