// app/(landing)/about-us/page.tsx
import Image from "next/image";
import Link from "next/link";
import { Instagram, Facebook, Youtube, MessageCircle, Music, Home } from "lucide-react";

export default function AboutUsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[900px] w-full">
        <Image
          src="/img/bg-about-us.png"
          alt="Hero Tentang Kami"
          layout="fill"
          objectFit="cover"
          className="brightness-75"
          priority
        />
      </section>

      {/* About Section */}
      <section className="relative -mt-40 px-4 md:px-8 overflow-hidden drop-shadow-lg py-10">
        <div className="max-w-10/12 mx-auto"> {/* Ganti max-w-11/12 dengan max-w-6xl */}
          <div className="bg-white p-6 md:p-8 rounded-lg shadow-md -mx-4 md:-mx-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">About Us</h2>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-1">
                <p className="text-lg text-gray-600 leading-relaxed">
                  Gong Komodo Tour adalah penyedia layanan wisata terpercaya yang
                  berbasis di Indonesia, dengan fokus pada destinasi eksotis seperti
                  Pulau Komodo dan Flores. Kami berkomitmen untuk memberikan
                  pengalaman perjalanan yang tak terlupakan dengan pelayanan terbaik.
                  Tim kami terdiri dari pemandu lokal berpengalaman yang siap
                  menemani Anda menjelajahi keindahan alam dan budaya di destinasi
                  kami.
                </p>
              </div>
              <div className="flex-shrink-0 items-center">
                <Image
                  src="/img/logo.png"
                  alt="Logo Gong Komodo Tour"
                  width={500}
                  height={300}
                  className="max-w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="py-16 px-4 md:px-8 bg-gray-50 relative">
        <div className="w-full mx-auto relative overflow-visible"> {/* Ganti max-w-9/12 dengan w-full */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-8 items-start">
            {/* Left Column: Image */}
            <div className="relative h-[500px]">
              <Image
                src="/img/mantaabout.png"
                alt="Pari Manta"
                width={900}
                height={500}
                className="absolute left-0 top-0 transform -translate-x-1/4 rounded-lg shadow-md object-cover h-auto"
              />
            </div>
            {/* Right Column: Vision & Mission */}
            <div className="space-y-14 flex flex-col items-center -translate-x-1/5
            translate-y-1/5 ">
              <div className="bg-[#fff7f7] p-6 rounded-lg shadow-md w-full max-w-11/12">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Visi Kami</h2>
                <p className="text-gray-600 leading-relaxed">
                  Menjadi penyedia layanan wisata terkemuka di Indonesia yang dikenal karena kualitas, keandalan, dan pengalaman wisata yang luar biasa.
                </p>
              </div>
              <div className="bg-[#fff7f7] p-6 rounded-lg shadow-md w-full max-w-11/12">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Misi Kami</h2>
                <p className="text-gray-600 leading-relaxed">
                  Memberikan pengalaman perjalanan yang aman, menyenangkan, dan berkesan dengan fokus pada pelestarian alam dan budaya lokal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
{/* Contact Us Section */}
<section className="py-16 px-4 md:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
            Contact Us
          </h1>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Jika Anda memiliki pertanyaan atau ingin memesan paket wisata, jangan
            ragu untuk menghubungi kami melalui informasi di bawah ini.
          </p>
          {/* Container untuk Peta dan Informasi Kontak */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Kolom Kiri: Informasi Kontak */}
            <div className="flex flex-col justify-center">
              <div className="max-w-md">
                <div className="flex flex-row items-center gap-4 mb-6">
                  <Home className="w-8 h-8 text-gray-800" />
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Our Office
                  </h2>
                </div>
                <p className="text-gray-600 mb-3">
                  <strong>Email:</strong>{" "}
                  <a
                    href="mailto:admin@perjalanan23.com"
                    className="text-blue-600 hover:underline"
                  >
                    admin@perjalanan23.com
                  </a>
                </p>
                <p className="text-gray-600 mb-3">
                  <strong>Kontak:</strong>{" "}
                  <a
                    href="tel:+22030300409292"
                    className="text-blue-600 hover:underline"
                  >
                    +22 0303004094292
                  </a>
                </p>
                <p className="text-gray-600 mb-6">
                  <strong>Alamat:</strong> Jalan Pinggir Purang No 1
                </p>
              </div>
            </div>
            {/* Kolom Kanan: Peta */}
            <div>
              {/* <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Peta
              </h2> */}
              <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-md">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d986.6146146146146!2d115.236496!3d-8.6744023!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd24058b0ad051d%3A0x3df400f051a54b7a!2sGong%20Komodo%20Tour!5e0!3m2!1sen!2sus!4v1698765432100!5m2!1sen!2sus."
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
          </div>
          {/* Ikon Media Sosial */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 justify-center">
            <Link href="https://instagram.com" target="_blank" className="flex justify-center">
              <Instagram className="w-8 h-8 text-pink-500 hover:text-pink-700 transition-colors" />
            </Link>
            <Link href="https://whatsapp.com" target="_blank" className="flex justify-center">
              <MessageCircle className="w-8 h-8 text-green-500 hover:text-green-700 transition-colors" />
            </Link>
            <Link href="https://facebook.com" target="_blank" className="flex justify-center">
              <Facebook className="w-8 h-8 text-blue-600 hover:text-blue-800 transition-colors" />
            </Link>
            <Link href="https://youtube.com" target="_blank" className="flex justify-center">
              <Youtube className="w-8 h-8 text-red-600 hover:text-red-800 transition-colors" />
            </Link>
            <Link href="https://tiktok.com" target="_blank" className="flex justify-center">
              <Music className="w-8 h-8 text-black hover:text-gray-700 transition-colors" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}