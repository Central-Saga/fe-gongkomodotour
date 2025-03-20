import { ReactNode } from "react";
import LandingHeader from "@/components/LandingHeader";
import Image from "next/image";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa"; // Menggunakan ikon dari react-icons

interface LandingLayoutProps {
  children: ReactNode;
}

export default function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100 overflow-x-hidden">
      <LandingHeader />
      <main>{children}</main>
      <footer className="bg-gray-600 text-white py-8 border-t border-b-2 border-gray-600">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Kolom 1: Logo dan Ikon Media Sosial */}
          <div className="flex flex-col items-center md:items-start ">
            <Image
              src="/img/logo.png"
              alt="Gong Komodo Tour Logo"
              width={180}
              height={100}
              className="h-19 w-auto mb-4"
            />
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-800"
              >
                <FaFacebookF className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/gongkomodo/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-800"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-800"
              >
                <FaTwitter className="w-5 h-5" />
              </a>
            </div>
          </div>
          {/* Kolom 2: Company */}
          <div>
            <h3 className="font-semibold mb-2 uppercase">Company</h3>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="hover:underline">
                  About
                </a>
              </li>
            </ul>
          </div>
          {/* Kolom 3: Service */}
          <div>
            <h3 className="font-semibold mb-2 uppercase">Service</h3>
            <ul className="space-y-2">
              <li>
                <a href="/open-trip" className="hover:underline">
                  Open Trip
                </a>
              </li>
              <li>
                <a href="/private-trip" className="hover:underline">
                  Private Trip
                </a>
              </li>
              <li>
                <a href="/blog" className="hover:underline">
                  Blog
                </a>
              </li>
              <li>
                <a href="/faqs" className="hover:underline">
                  FAQs
                </a>
              </li>
            </ul>
          </div>
          {/* Kolom 4: Legal */}
          <div>
            <h3 className="font-semibold mb-2 uppercase">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="/terms" className="hover:underline">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="/privacy" className="hover:underline">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-25 border-t border-gray-100"></div>
        <p className="text-left mt-4 text-white pl-4">
          Copy Right © Central Saga
        </p>
      </footer>
    </div>
  );
}