import React from "react";
import Gallery from "@/components/ui-gallery/Gallery";

const galleryData = [
  { image: "/img/gallery4.jpg", title: "Lunch On Boat" },
  { image: "/img/gallery2.jpg", title: "Padar Island" },
  { image: "/img/gallery6.jpg", title: "Wairing Hill" },
  { image: "/img/gallery4.jpg", title: "Video Paket apa" },
  { image: "/img/gallery5.jpg", title: "Komodo Island" },
  { image: "/img/gallery6.jpg", title: "Long Pink Beach" },
  { image: "/img/gallery7.jpg", title: "Padar Island" },
  { image: "/img/gallery8.jpg", title: "Video Paket apa" },
  { image: "/img/gallery9.jpg", title: "Komodo Island" },
  { image: "/img/gallery4.jpg", title: "Long Pink Beach" },
  { image: "/img/gallery2.jpg", title: "Video Paket apa" },
  { image: "/img/gallery6.jpg", title: "Kalong Island" },
  { image: "/img/gallery4.jpg", title: "Padar Island" },
  { image: "/img/gallery2.jpg", title: "Video Paket apa" },
  { image: "/img/gallery6.jpg", title: "Kalong Island" },
  { image: "/img/gallery4.jpg", title: "Padar Island" },
];

export default function GalleryPage() {
  return (
    <main className="gallery-page bg-gray-100">
      <section className="text-center py-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          All About Our Gallery Foto & Video Gong Komodo Tour
        </h1>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Bayangkan diri Anda berdiri di puncak gunung dengan udara segar
          mengelilingi, atau berjalan di tepi pantai dengan ombak yang
          berkejaran. Setiap foto dan video yang kami ambil selama tour bulan
          ini adalah jendela menuju momen-momen menakjubkan yang bikin kamu
          ingin langsung packing dan ikut merasakannya! Dari sudut pandang yang
          tak terduga hingga detail-detail kecil yang bikin terpana, yuk intip
          cerita seru di balik setiap frame perjalanan kami. Siapa tahu, ini
          bisa jadi inspirasi untuk petualanganmu berikutnya! 🌟
        </p>
      </section>

      {/* Panggil Komponen Gallery */}
      <Gallery data={galleryData} />
    </main>
  );
}