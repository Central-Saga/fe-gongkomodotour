import Image from "next/image";
import Link from "next/link";

export default function AboutUs() {
  return (
    <section className="py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Bagian Kiri: Konten Teks */}
          <div className="p-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">About Us</h2>
            <p className="text-[#000000] mb-6 leading-relaxed text-xl">
              Since 2010, Gong Komodo Tour has been dedicated to providing exceptional travel experiences to Komodo National Park. Our private tours are crafted to showcase the region’s natural beauty and unique wildlife.
              <br />
              <br />
              With private boats, expert guides, and a commitment to customer satisfaction, we ensure your journey is comfortable and unforgettable. Discover the wonders of Komodo with us.
            </p>
            <Link href="/about">
              <button className="bg-[#CFB53B] text-white px-6 py-3 rounded-xl hover:bg-[#7F6D1F] transition-colors">
                Read more
              </button>
            </Link>
          </div>

          {/* Bagian Kanan: Gambar dengan Posisi yang Dapat Digeser */}
          <div className="relative flex justify-end bg-amber-800">
            {/* Gambar Latar Belakang */}
            <div
              style={{
                position: "absolute",
                left: "20rem", // Atur posisi horizontal gambar pertama
                top: "1rem",  // Atur posisi vertikal gambar pertama
              }}
            >
              <Image
                src="/img/about.png"
                alt="About Us Image 1"
                width={370}
                height={300}
                className="h-auto object-cover rounded-lg shadow-lg"
                style={{ width: "370px", height: "300px" }} // Ukuran tetap
              />
            </div>
            {/* Gambar Depan (Overlap) */}
            <div
              style={{
                position: "absolute",
                left: "10rem", // Atur posisi horizontal gambar kedua
                top: "4rem",  // Atur posisi vertikal gambar kedua
              }}
            >
              <Image
                src="/img/about.png"
                alt="About Us Image 2"
                width={370}
                height={300}
                className="h-auto object-cover rounded-lg shadow-lg"
                style={{ width: "370px", height: "300px" }} // Ukuran tetap
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}