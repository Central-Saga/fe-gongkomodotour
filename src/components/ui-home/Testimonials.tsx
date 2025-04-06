"use client";

import Image from "next/image";
import { Star } from "lucide-react"; // Menggunakan ikon bintang dari Lucide (kompatibel dengan Shadcn UI)
import { useRef, useState } from "react";

export default function Testimoni() {
  const daftarTestimoni = [
    {
      judul: "Sunset Trip",
      nama: "Ambuja",
      tanggal: "10 Januari 2025",
      komentar:
        "Aku senang melakukan perjalanan ini aku harap aku dapat melaksanakan trip ini kembali di tahun ini",
      gambar: "/img/pic-testi.jpg",
      rating: 5,
    },
    {
      judul: "Open Trip",
      nama: "Ambuja",
      tanggal: "10 Feb 2025",
      komentar:
        "Aku senang melakukan perjalanan ini aku harap aku dapat melaksanakan trip ini kembali di tahun ini",
      gambar: "/img/pic-testi.jpg",
      rating: 5,
    },
    {
      judul: "Expllore Waerebo",
      nama: "Ambuja",
      tanggal: "10 Maret 2025",
      komentar:
        "Aku senang melakukan perjalanan ini aku harap aku dapat melaksanakan trip ini kembali di tahun ini",
      gambar: "/img/pic-testi.jpg",
      rating: 4,
    },
    {
      judul: "Private Trip",
      nama: "Ambuja",
      tanggal: "10 Feb 2025",
      komentar:
        "Aku senang melakukan perjalanan ini aku harap aku dapat melaksanakan trip ini kembali di tahun ini",
      gambar: "/img/pic-testi.jpg",
      rating: 5,
    },
    {
      judul: "Open Trip",
      nama: "Ambuja",
      tanggal: "10 Feb 2025",
      komentar:
        "Aku senang melakukan perjalanan ini aku harap aku dapat melaksanakan trip ini kembali di tahun ini",
      gambar: "/img/pic-testi.jpg",
      rating: 5,
    },
    {
      judul: "Expllore Waerebo",
      nama: "Ambuja",
      tanggal: "10 Maret 2025",
      komentar:
        "Aku senang melakukan perjalanan ini aku harap aku dapat melaksanakan trip ini kembali di tahun ini",
      gambar: "/img/pic-testi.jpg",
      rating: 4,
    },
  ];

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Fungsi untuk menangani drag dengan klik kiri
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    if (e.button !== 0) return; // Hanya klik kiri yang memicu drag
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    scrollContainerRef.current.style.cursor = "grabbing";
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = "grab";
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = "grab";
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Mengatur kecepatan drag
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  // Fungsi untuk mencegah drag pada elemen gambar
  const handleImageDragStart = (e: React.DragEvent<HTMLImageElement>) => {
    e.preventDefault();
  };

  return (
    <section
      className="py-30  bg-cover bg-center  w-full" // Mengatur section menjadi full-width
      style={{ backgroundImage: "url('/img/bgtestimonial.jpg')" }}
    >
      <div className="pl-10 pr-0 pt-30">
        {" "}
        {/* Padding hanya di sisi kiri */}
        <h2 className="text-2xl font-semibold  text-[#f5f5f5] mb-2">
          New Latest
        </h2>
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto space-x-4 py-3 scrollbar-hide select-none" // Reduced spacing
          style={{ scrollBehavior: "smooth", cursor: "grab" }}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {daftarTestimoni.map((testimoni, indeks) => (
            <div
              key={indeks}
              className="min-w-[250px] bg-white p-4 rounded-md shadow-md flex-shrink-0" // Reduced width, padding, and border radius
            >
              <div className="flex items-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < testimoni.rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`} // Reduced star size
                  />
                ))}
              </div>
              <h3 className="text-sm font-semibold text-gray-800 max-w-[200px] truncate">
                {" "}
                {/* Reduced font size */}
                {testimoni.judul}
              </h3>
              <p className="text-gray-600 mt-1 text-xs break-words max-w-[400px]">
                {" "}
                {/* Reduced font size */}
                {testimoni.komentar}
              </p>
              <div className="flex items-center mt-3">
                <Image
                  src={testimoni.gambar}
                  alt={testimoni.nama}
                  width={30} // Reduced size
                  height={30}
                  className="w-8 h-8 rounded-full mr-2"
                  onDragStart={handleImageDragStart} // Mencegah drag default pada gambar
                />
                <div>
                  <p className="text-xs font-medium text-gray-800">
                    {" "}
                    {/* Reduced font size */}
                    {testimoni.nama}
                  </p>
                  <p className="text-xs text-gray-500">
                    {" "}
                    {/* Reduced font size */}
                    {testimoni.tanggal}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
