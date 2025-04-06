// components/ui/AboutUs.tsx
import Image from "next/image";
import Link from "next/link";

export default function AboutUs() {
  return (
    <section className="py-20 bg-[#fffefe]">
      <div className="container max-w-screen-xl px-4">
        {" "}
        {/* Added max-w-screen-xl */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Bagian Kiri: Konten Teks */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">About Us</h2>{" "}
            {/* Reduced font size */}
            <p className="text-[#000000] mb-6 leading-relaxed text-sm">
              {" "}
              {/* Reduced font size */}
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Impedit
              enim sint veniam ipsa. Dolor possimus dolores optio sed? Est
              beatae quam sapiente itaque voluptatem repudiandae accusamus eum
              ex quidem ratione?
              <br />
              <br />
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Impedit
              enim sint veniam ipsa. Dolor possimus dolores optio sed? Est
              beatae quam sapiente itaque voluptatem repudiandae accusamus eum
              ex quidem ratione?
            </p>
            <Link href="/about">
              <button className="bg-[#CFB53B] text-white px-3 py-2 rounded-lg hover:bg-[#7F6D1F] transition-colors text-[12px] ">
                {" "}
                {/* Reduced padding */}
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
                left: "16rem", // Atur posisi horizontal gambar pertama
                top: "1rem", // Atur posisi vertikal gambar pertama
              }}
            >
              <Image
                src="/img/gallery1.jpg"
                alt="About Us Image 1"
                width={300} // Reduced width
                height={240} // Reduced height
                className="h-auto object-cover rounded-lg shadow-lg"
                style={{ width: "300px", height: "240px" }} // Ukuran tetap
              />
            </div>
            {/* Gambar Depan (Overlap) */}
            <div
              style={{
                position: "absolute",
                left: "7rem", // Atur posisi horizontal gambar kedua
                top: "5rem", // Atur posisi vertikal gambar kedua
              }}
            >
              <Image
                src="/img/gallery1.jpg"
                alt="About Us Image 2"
                width={300} // Reduced width
                height={240} // Reduced height
                className="h-auto object-cover rounded-lg shadow-lg"
                style={{ width: "300px", height: "240px" }} // Ukuran tetap
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
