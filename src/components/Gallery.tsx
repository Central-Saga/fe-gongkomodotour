"use client"; // Direktif untuk menjadikan file ini sebagai Client Component

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { Button } from "@/components/ui/button"; // Impor komponen Button dari ShadCN UI

// Komponen Utama Gallery
export default function Gallery() {
  const galleryImages = [
    { src: "/videos/landingvidio.mp4", alt: "Video Galeri", id: "1" },
    { src: "/img/gallery1.jpg", alt: "Gambar Galeri 1", id: "1" },
    { src: "/img/gallery2.jpg", alt: "Gambar Galeri 2", id: "2" },
    { src: "/img/gallery3.jpg", alt: "Gambar Galeri 3", id: "3" },
    { src: "/img/gallery4.jpg", alt: "Gambar Galeri 4", id: "4" },
    { src: "/img/gallery5.jpg", alt: "Gambar Galeri 5", id: "5" },
    { src: "/img/gallery6.jpg", alt: "Gambar Galeri 6", id: "6" },
    { src: "/img/gallery7.jpg", alt: "Gambar Galeri 7", id: "7" }, // Gambar tambahan
    { src: "/img/gallery8.jpg", alt: "Gambar Galeri 8", id: "8" }, // Gambar tambahan
    { src: "/img/gallery9.jpg", alt: "Gambar Galeri 9", id: "9" }, // Gambar tambahan
  ];

  // Menggunakan useRef untuk mengakses elemen video
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fungsi untuk menangani klik pada video
  const handleVideoClick = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  // Fungsi untuk menampilkan kontrol saat hover
  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.setAttribute("controls", "");
    }
  };

  // Fungsi untuk menyembunyikan kontrol saat mouse meninggalkan video
  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.removeAttribute("controls");
    }
  };

  return (
    <section className="py-5 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kolom Kiri: Video Canvas dengan Judul dan Deskripsi */}
          <div className="flex flex-col">
            <div className="mb-4">
              <h2 className="text-4xl font-bold text-gray-900 text-center">Gallery</h2>
              <p className="text-gray-600 mt-2 text-left py-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Impedit enim sint veniam ipsa. Dolor possimus dolores optio sed? Est beatae quam sapiente itaque voluptatem repudiandae accusamus eum ex quidem ratione?
                <br />
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Impedit enim sint veniam ipsa. Dolor possimus dolores optio sed? Est beatae quam sapiente itaque voluptatem repudiandae accusamus eum ex quidem ratione?
              </p>
            </div>
            <div className="w-full rounded-lg overflow-hidden relative">
              {/* Elemen video */}
              <video
                ref={videoRef}
                className="w-full rounded-lg"
                style={{ height: "500px", objectFit: "cover" }}
                onClick={handleVideoClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <source src="/videos/landingvidio.mp4" type="video/mp4" />
                Browser Anda tidak mendukung tag video. Silakan gunakan gambar sebagai fallback:
                <Image
                  src="/img/gallery1.jpg"
                  alt="Fallback Video Galeri"
                  width={600}
                  height={500}
                  className="w-full h-auto object-cover"
                  quality={100}
                  priority={true}
                />
              </video>
            </div>
          </div>
          {/* Kolom Kanan: 9 Gambar Kecil dengan Tombol "See More" di Bawah */}
          <div className="flex flex-col">
            <div className="grid grid-cols-3 gap-4">
              {galleryImages.slice(1).map((image) => (
                <Link key={image.id} href={`/gallery/${image.id}`}>
                  <div className="relative overflow-hidden rounded-lg aspect-square bg-white shadow-md transition-transform duration-300 hover:scale-105 cursor-pointer">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover rounded-lg"
                      quality={100}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
        {/* Tombol "See More" dengan ShadCN UI Button */}
        <div className="flex justify-center mt-8">
          <Link href="/gallery">
          <Button
          className="bg-[#f4d03f] text-white px-6 py-5 rounded-lg font-semibold text-sm hover:bg-[#d4a017] hover:scale-95 transition-all duration-300"
          >See More</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}