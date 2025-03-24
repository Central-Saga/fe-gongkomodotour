"use client";

import { ReactNode } from "react";
import LandingHeader from "@/components/LandingHeader";
import Footer from "@/components/Footer"; // import Footer

interface LandingLayoutProps {
  children: ReactNode;
}

export default function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 overflow-x-hidden">
      <LandingHeader />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}