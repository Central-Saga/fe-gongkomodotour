"use client";

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";

// Gaya kustom untuk efek shadow dan transisi
const customStyles = `
  .text-shadow-nike {
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7), 0 0 10px rgba(0, 0, 0, 0.5);
  }
  .custom-card {
    padding: 0 !important; /* Menimpa padding bawaan py-6 pada Card */
    transition: box-shadow 0.3s ease-in-out; /* Transisi untuk shadow */
  }
  .custom-card:hover {
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3); /* Shadow saat hover */
  }
  .hover-text {
    color: white; /* Warna awal */
    transition: color 0.8s ease-in-out 0.4s, top 2s ease-in-out, bottom 2s ease-in-out, opacity 0.8s ease-in-out; /* Transisi terpisah untuk warna dan posisi */
  }
  .hover-text.hovered {
    color: #CFB53B; /* Warna saat hover */
  }
  .hover-text-top {
    margin-bottom: 0; /* Menghilangkan celah berlebih di bawah teks atas */
    line-height: 1; /* Mengurangi jarak baris */
  }
  .hover-text-bottom {
    margin-top: 0; /* Menghilangkan celah berlebih di atas teks bawah */
    line-height: 1; /* Mengurangi jarak baris */
  }
`;

export default function TripHighlight() {
  const highlights = [
    {
      image: "/img/benavillage.png",
      title: "Stunning Flores Overland",
      type: "Open Trip",
      link: "/trip/stunning-flores-overland", // Link spesifik untuk trip ini
    },
    {
      image: "/img/kelorisland.png",
      title: "Full Day Trip by Speed Boar",
      type: "Private Trip",
      link: "/trip/full-day-trip-speed-boar", // Link spesifik untuk trip ini
    },
    {
      image: "/img/komodoisland.png",
      title: "Sailing Komodo Tour",
      type: "Open Trip",
      link: "/trip/sailing-komodo-tour", // Link spesifik untuk trip ini
    },
    {
      image: "/img/waerebovillage.png",
      title: "Explore Waerebo",
      type: "Private Trip",
      link: "/trip/explore-waerebo", // Link spesifik untuk trip ini
    },
  ];

  return (
    <section className="p-4 py-10 bg-gray-50">
      <style>{customStyles}</style>
      <div className="container mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Our Trip Highlights</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
          {highlights.map((highlight, index) => {
            const [isHovered, setIsHovered] = useState(false);

            return (
              <Link key={index} href={highlight.link}>
                <Card
                  className="custom-card rounded-tr-sm overflow-hidden cursor-pointer"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <CardContent className="p-0 relative h-90">
                    <img
                      src={highlight.image}
                      alt={highlight.title}
                      className="w-full h-full object-cover rounded-sm"
                    />
                    <div
                      className={`absolute inset-0 transition-opacity duration-800 ${
                        isHovered ? "opacity-65 bg-black" : "opacity-0"
                      }`}
                    />
                    <div className="absolute top-5 left-5 bg-[#CFB53B] text-white text-xs font-semibold px-3 py-2 rounded">
                      {highlight.type}
                    </div>

                    {/* Teks Bagian Atas (Judul) */}
                    <div
                      className={`absolute left-0 right-0 text-center transition-all duration-800 hover-text hover-text-top ${
                        isHovered ? "hovered top-[45%] -translate-y-1/2 opacity-100" : "top-0 opacity-0"
                      }`}
                    >
                      <p className="m-0 text-lg font-bold text-shadow-nike">
                        {highlight.type}
                      </p>
                    </div>

                    {/* Teks Bagian Bawah */}
                    <div
                      className={`absolute left-0 right-0 text-center transition-all duration-800 hover-text hover-text-bottom ${
                        isHovered ? "hovered bottom-[45%] translate-y-1/2 opacity-100" : "bottom-0 opacity-0"
                      }`}
                    >
                      <p className="m-0 text-lg text-shadow-nike">
                        {highlight.title}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
        <div className="text-center mt-8">
          <Link href="/trip">
            <button className="bg-[#CFB53B] text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-[#7F6D1F] hover:scale-95 transition-all duration-300">
              See more
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}