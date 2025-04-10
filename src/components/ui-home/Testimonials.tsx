"use client";

import Image from "next/image";
import { Star } from "lucide-react"; // Menggunakan ikon bintang dari Lucide (kompatibel dengan Shadcn UI)
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (scrollContainerRef.current) {
        const nextIndex = (currentIndex + 1) % daftarTestimoni.length;
        const scrollAmount = nextIndex * 358; // 350px card width + 8px gap
        scrollContainerRef.current.scrollTo({
          left: scrollAmount,
          behavior: "smooth"
        });
        setCurrentIndex(nextIndex);
      }
    }, 3000); // Scroll every 3 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentIndex]);

  // Fungsi untuk menangani drag dengan klik kiri
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    if (e.button !== 0) return; // Hanya klik kiri yang memicu drag
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    scrollContainerRef.current.style.cursor = "grabbing";
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
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
    intervalRef.current = setInterval(() => {
      if (scrollContainerRef.current) {
        const nextIndex = (currentIndex + 1) % daftarTestimoni.length;
        const scrollAmount = nextIndex * 358;
        scrollContainerRef.current.scrollTo({
          left: scrollAmount,
          behavior: "smooth"
        });
        setCurrentIndex(nextIndex);
      }
    }, 3000);
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
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="py-20 bg-cover bg-center w-full"
      style={{ backgroundImage: "url('/img/bgtestimonial.jpg')" }}
    >
      <div className="w-full max-w-[1800px] mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-[#f5f5f5] mb-6">
            What Our Clients Say
          </h2>
          <p className="text-lg text-[#f5f5f5] mb-8 max-w-2xl mx-auto">
            Discover the experiences shared by our valued customers who have explored the wonders of Komodo with us.
          </p>
        </motion.div>

        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto space-x-8 py-4 scrollbar-hide select-none px-4"
          style={{ 
            scrollBehavior: "smooth", 
            cursor: "grab",
            scrollSnapType: "x mandatory"
          }}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {daftarTestimoni.map((testimoni, indeks) => (
            <motion.div
              key={indeks}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: indeks * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="min-w-[350px] bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-xl flex-shrink-0"
              style={{ scrollSnapAlign: "center" }}
            >
              <motion.div 
                className="flex items-center mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        i < testimoni.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </motion.div>
                ))}
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {testimoni.judul}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {testimoni.komentar}
              </p>
              <div className="flex items-center mt-4">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="relative"
                >
                  <Image
                    src={testimoni.gambar}
                    alt={testimoni.nama}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full mr-3"
                    onDragStart={handleImageDragStart}
                  />
                </motion.div>
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
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
