"use client";

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";

// Gaya kustom untuk efek shadow Nike
const customStyles = `
  .text-shadow-nike {
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7), 0 0 10px rgba(0, 0, 0, 0.5);
  }
  .custom-card {
    padding: 0 !important; /* Menimpa padding bawaan py-6 pada Card */
  }
`;

export default function TripHighlight() {
  const highlights = [
    { image: "/img/benavillage.png", title: "Pemandangan Pulau", type: "Open Trip" },
    { image: "/img/kelorisland.png", title: "Sunset Trip", type: "Private Trip" },
    { image: "/img/komodoisland.png", title: "Sailing Komodo Tour", type: "Open Trip" },
    { image: "/img/waerebovillage.png", title: "Explore Waerebo", type: "Private Trip" },
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
              <Card
                key={index}
                className="custom-card rounded-tr-sm overflow-hidden"
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
                      isHovered ? "opacity-50 bg-black" : "opacity-0"
                    }`}
                  />
                  <div className="absolute top-5 left-5 bg-yellow-500 text-white text-xs font-semibold px-3 py-2 rounded">
                    {highlight.type}
                  </div>
                  <div
                    className={`absolute left-0 right-0 text-white text-center transition-all duration-800 ${
                      isHovered
                        ? "top-1/2 -translate-y-1/2 opacity-100"
                        : "bottom-0 opacity-0"
                    }`}
                  >
                    <p className="m-0 text-lg font-bold text-shadow-nike">
                      {highlight.title}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="text-center mt-8">
          <Link href="/trip">
          <button className="bg-yellow-500 text-white px-6 py-2 rounded-full hover:bg-yellow-600 transition-colors">
            See more
          </button>
          </Link>
        </div>
      </div>
    </section>
  );
}