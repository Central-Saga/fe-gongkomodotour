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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

// Inisialisasi daftar negara
countries.registerLocale(enLocale);
const countryList = countries.getNames("en", { select: "official" });
const countryOptions = Object.entries(countryList).map(([code, name]) => ({
  value: code,
  label: name,
}));

// Define the form schema using Zod
const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." }),
  password_confirmation: z.string(),
  alamat: z.string().min(1, { message: "Address is required." }),
  no_hp: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits." })
    .regex(/^\d+$/, { message: "Phone number must contain only digits." }),
  nasionality: z.string().min(1, { message: "Please select a nationality." }),
  region: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});

export default function RegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Initialize the form with react-hook-form and zod
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      alamat: "",
      no_hp: "",
      nasionality: "",
      region: "domestic",
    },
  });

  // Watch nationality field to auto-set region
  const selectedNationality = form.watch("nasionality");
  useEffect(() => {
    if (selectedNationality === "ID") {
      form.setValue("region", "domestic");
    } else if (selectedNationality) {
      form.setValue("region", "overseas");
    }
  }, [selectedNationality, form]);

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      const response = await apiRequest("POST", "/api/register", {
        name: values.name,
        email: values.email,
        password: values.password,
        password_confirmation: values.password_confirmation,
        alamat: values.alamat,
        no_hp: values.no_hp,
        nasionality: values.nasionality,
        region: values.region,
      }, {
        headers: {
          "Accept": "application/json",
        },
      });

      console.log("Register response:", response);

      // Redirect to login page or dashboard after successful registration
      router.push("/auth/login");
    } catch (error) {
      console.error("Register error:", error);
      // Tambahkan notifikasi error jika diperlukan
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Section - Image */}
      <div className="w-1/2 relative">
        <Image
          src={bgAuth}
          alt="Komodo Tour Background"
          fill
          style={{ objectFit: "cover" }}
          className="absolute inset-0"
        />
      </div>

      {/* Right Section - Register Form */}
      <div className="w-1/2 flex items-center justify-center bg-white p-6">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center">
            <Image
              src={logo}
              alt="Gong Komodo Tour Logo"
              width={300} // Kurangi ukuran logo
              height={75}
              className="mx-auto"
            />
          </h1>
          <h2 className="text-3xl font-semibold text-[#CFB53B] mb-6 text-center">
            Sign Up
          </h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your name"
                        {...field}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
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
                    <FormLabel className="text-sm font-medium text-gray-700">
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

              {/* Password Confirmation Field */}
              <FormField
                control={form.control}
                name="password_confirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Confirm Password
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

              {/* Address Field */}
              <FormField
                control={form.control}
                name="alamat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your address"
                        {...field}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone Number Field */}
              <FormField
                control={form.control}
                name="no_hp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="081234567890"
                        {...field}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Nationality Field */}
              <FormField
                control={form.control}
                name="nasionality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Nationality
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countryOptions.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Region Field (Who You Are) - Hidden but still in form state */}
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="domestic" id="domestic" />
                          <FormLabel htmlFor="domestic">Domestic</FormLabel>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="overseas" id="overseas" />
                          <FormLabel htmlFor="overseas">Overseas</FormLabel>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-[#CFB53B] text-white py-2 px-4 rounded-md hover:bg-[#b6a032] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#CFB53B]"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing Up..." : "Sign Up"}
              </Button>

              {/* Sign In Link */}
              <p className="text-center text-sm text-gray-600 mt-4">
                I have an account{" "}
                <a href="/auth/login" className="text-blue-600 hover:underline">
                  Sign In
                </a>
              </p>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}