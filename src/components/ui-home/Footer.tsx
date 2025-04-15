"use client";

import Image from "next/image";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";

interface FooterProps {
  children?: React.ReactNode;
}

export default function Footer({ children }: FooterProps) {
  return (
    <>
      {children}
      <footer className="bg-[#1A5A85] text-[#f5f5f5] py-8">
        <div className="container max-w-screen-xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo dan Media Sosial */}
            <div className="space-y-4">
              <Image
                src="/img/logo.png"
                alt="Gong Komodo Tour Logo"
                width={180}
                height={220}
                className="mb-4"
              />
              <div className="flex gap-4">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-[#1A5A85] transition-all hover:bg-opacity-90 hover:scale-105"
                >
                  <FaFacebookF className="w-4 h-4" />
                </a>
                <a
                  href="https://www.instagram.com/gongkomodo/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-[#1A5A85] transition-all hover:bg-opacity-90 hover:scale-105"
                >
                  <FaInstagram className="w-4 h-4" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-[#1A5A85] transition-all hover:bg-opacity-90 hover:scale-105"
                >
                  <FaTwitter className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Company */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm uppercase tracking-wider">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/about" className="text-sm hover:text-white transition-colors duration-200 hover:underline">
                    About
                  </a>
                </li>
              </ul>
            </div>

            {/* Service */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm uppercase tracking-wider">Service</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/open-trip" className="text-sm hover:text-white transition-colors duration-200 hover:underline">
                    Open Trip
                  </a>
                </li>
                <li>
                  <a href="/private-trip" className="text-sm hover:text-white transition-colors duration-200 hover:underline">
                    Private Trip
                  </a>
                </li>
                <li>
                  <a href="/blog" className="text-sm hover:text-white transition-colors duration-200 hover:underline">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="/faqs" className="text-sm hover:text-white transition-colors duration-200 hover:underline">
                    FAQs
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm uppercase tracking-wider">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/terms" className="text-sm hover:text-white transition-colors duration-200 hover:underline">
                    Terms &amp; Conditions
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="text-sm hover:text-white transition-colors duration-200 hover:underline">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-sm text-center text-white/80">
              &copy; {new Date().getFullYear()} Central Saga. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
