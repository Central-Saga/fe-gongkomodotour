// components/ui/AboutUs.tsx
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
            <p className="text-gray-600 mb-6 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Impedit enim sint veniam
              ipsa. Dolor possimus dolores optio sed? Est beatae quam sapiente itaque voluptatem
              repudiandae accusamus eum ex quidem ratione?
              <br />
              <br />
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Impedit enim sint veniam
              ipsa. Dolor possimus dolores optio sed? Est beatae quam sapiente itaque voluptatem
              repudiandae accusamus eum ex quidem ratione?
            </p>
            <Link href="/about">
              <button className="bg-yellow-500 text-white px-6 py-2 rounded-full hover:bg-yellow-600 transition-colors">
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
                left: "18rem", // Atur posisi horizontal gambar pertama
                top: "0rem",  // Atur posisi vertikal gambar pertama
              }}
            >
              <Image
                src="/img/hero-slide1.png"
                alt="About Us Image 1"
                width={250}
                height={167}
                className="h-auto object-cover rounded-lg shadow-lg"
                style={{ width: "300px", height: "267px" }} // Ukuran tetap
              />
            </div>
            {/* Gambar Depan (Overlap) */}
            <div
              style={{
                position: "absolute",
                left: "7rem", // Atur posisi horizontal gambar kedua
                top: "3rem",  // Atur posisi vertikal gambar kedua

                
              }}
            >
              <Image
                src="/img/hero-slide2.png"
                alt="About Us Image 2"
                width={250}
                height={167}
                className="h-auto object-cover rounded-lg shadow-lg"
                style={{ width: "300px", height: "267px" }} // Ukuran tetap
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}