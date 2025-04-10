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
      <footer className="bg-[#1A5A85] text-[#f5f5f5] py-6 border-t border-b-2 border-[#1A5A85]">
        {" "}
        {/* Reduced padding */}
        <div className="container max-w-screen-lg px-4 mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          {" "}
          {/* Adjusted container width and gap */}
          {/* Kolom 1: Logo dan Ikon Media Sosial */}
          <div className="flex flex-col items-start ">
            <Image
              src="/img/logo-gong.png"
              alt="Gong Komodo Tour Logo"
              width={200} // Reduced width
              height={250} // Reduced height
              className="mb-4" // Reduced margin
              
            />
            <div className="flex gap-3">
              {" "}
              {/* Reduced gap */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-gray-800" // Reduced size
              >
                <FaFacebookF className="w-4 h-4" /> {/* Reduced icon size */}
              </a>
              <a
                href="https://www.instagram.com/gongkomodo/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-gray-800" // Reduced size
              >
                <FaInstagram className="w-4 h-4" /> {/* Reduced icon size */}
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-gray-800" // Reduced size
              >
                <FaTwitter className="w-4 h-4" /> {/* Reduced icon size */}
              </a>
            </div>
          </div>
          {/* Kolom 2: Company */}
          <div>
            <h3 className="font-semibold mb-1 uppercase text-sm">Company</h3>{" "}
            {/* Reduced font size */}
            <ul className="space-y-1">
              {" "}
              {/* Reduced spacing */}
              <li>
                <a href="/about" className="hover:underline text-xs">
                  About
                </a>{" "}
                {/* Reduced font size */}
              </li>
            </ul>
          </div>
          {/* Kolom 3: Service */}
          <div>
            <h3 className="font-semibold mb-1 uppercase text-sm">Service</h3>{" "}
            {/* Reduced font size */}
            <ul className="space-y-1">
              {" "}
              {/* Reduced spacing */}
              <li>
                <a href="/open-trip" className="hover:underline text-xs">
                  Open Trip
                </a>{" "}
                {/* Reduced font size */}
              </li>
              <li>
                <a href="/private-trip" className="hover:underline text-xs">
                  Private Trip
                </a>{" "}
                {/* Reduced font size */}
              </li>
              <li>
                <a href="/blog" className="hover:underline text-xs">
                  Blog
                </a>{" "}
                {/* Reduced font size */}
              </li>
              <li>
                <a href="/faqs" className="hover:underline text-xs">
                  FAQs
                </a>{" "}
                {/* Reduced font size */}
              </li>
            </ul>
          </div>
          {/* Kolom 4: Legal */}
          <div>
            <h3 className="font-semibold mb-1 uppercase text-sm">Legal</h3>{" "}
            {/* Reduced font size */}
            <ul className="space-y-1">
              {" "}
              {/* Reduced spacing */}
              <li>
                <a href="/terms" className="hover:underline text-xs">
                  Terms &amp; Conditions
                </a>{" "}
                {/* Reduced font size */}
              </li>
              <li>
                <a href="/privacy" className="hover:underline text-xs">
                  Privacy Policy
                </a>{" "}
                {/* Reduced font size */}
              </li>{" "}
              {/* Added missing closing tag */}
            </ul>
          </div>
        </div>
        <div className="mt-6 border-t border-gray-100"></div>{" "}
        {/* Reduced margin */}
        <p className="mt-4 text-white text-start ml-15 text-xs">
          {" "}
          {/* Centered and reduced font size */}
          &copy; {new Date().getFullYear()} Central Saga. All rights reserved.
        </p>
      </footer>
    </>
  );
}
