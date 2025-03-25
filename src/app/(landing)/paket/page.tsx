import Link from 'next/link';
import LandingHeader from '@/components/LandingHeader';
import Image from 'next/image';

export default function PackagesPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <LandingHeader />

      {/* Hero Section */}
      <section className="relative h-96 bg-cover bg-center" style={{ backgroundImage: "url('/img/packages-hero.jpg')" }}>
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <h1 className="text-5xl font-bold text-white">PACKAGES</h1>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4">Our Packages</h2>
          <p className="text-gray-600 mb-6">
            Pilih paket perjalanan yang sesuai dengan kebutuhan Anda. Kami menawarkan Open Trip untuk perjalanan grup terbuka dan Private Trip untuk pengalaman yang lebih eksklusif.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Open Trip Card */}
            <Link href="/paket/open-trip" className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <Image src="/img/open-trip-hero.jpg" alt="Open Trip" width={600} height={400} className="w-full h-48 object-cover" />
                <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded">
                  Open Trip
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">Open Trip</h3>
                <p className="text-gray-600 text-sm">
                  Paket perjalanan grup terbuka untuk umum dengan jadwal tetap dan harga terjangkau.
                </p>
              </div>
            </Link>

            {/* Private Trip Card */}
            <Link href="/paket/private-trip" className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <Image src="/img/private-trip-hero.jpg" alt="Private Trip" width={600} height={400} className="w-full h-48 object-cover" />
                <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded">
                  Private Trip
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">Private Trip</h3>
                <p className="text-gray-600 text-sm">
                  Paket perjalanan eksklusif yang dapat disesuaikan dengan kebutuhan Anda.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-10">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <Image src="/img/logo.png" alt="Gong Komodo Tour Logo" className="h-12 w-auto mb-4" />
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-gray-300">X</a>
              <a href="#" className="text-white hover:text-gray-300">Instagram</a>
              <a href="#" className="text-white hover:text-gray-300">LinkedIn</a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-gray-300">About</a></li>
              <li><a href="#" className="hover:text-gray-300">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Service</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-gray-300">Open Trip</a></li>
              <li><a href="#" className="hover:text-gray-300">Private Trip</a></li>
              <li><a href="#" className="hover:text-gray-300">Blog</a></li>
              <li><a href="#" className="hover:text-gray-300">FAQs</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-gray-300">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-gray-300">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="text-center mt-6 text-gray-400">
          Copy Right © by Central Saga
        </div>
      </footer>
    </div>
  );
}