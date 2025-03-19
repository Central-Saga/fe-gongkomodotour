import Image from "next/image";

export default function WhyChooseUs() {
  const reasons = [
    {
      title: "Penyedia Layanan Tour Terbaik",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      titleColor: "text-blue-500",
    },
    {
      title: "Layanan Pemandu Berpengalaman",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      titleColor: "text-pink-500",
    },
    {
      title: "Perjalanan Dengan Harga Terjangkau",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      titleColor: "text-red-500",
    },
    {
      title: "Pengalaman Destinasi Terbaik",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      titleColor: "text-purple-500",
    },
    {
      title: "Melakukan Liburan Tanpa Beban",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      titleColor: "text-yellow-500",
    },
    {
      title: "Melakukan Liburan Tanpa Beban",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      titleColor: "text-orange-500",
    },
  ];

  return (
    <section className="py-0 bg-white m-0 w-full">
      <div className="flex flex-col md:flex-row">
        {/* Kolom Kiri: 6 Kartu dalam Grid 2x3 */}
        <div className="flex-1 max-w-[1280px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6 p-10 md:mr-6">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="bg-white p-6 shadow-md rounded-lg border border-gray-100 flex flex-col items-start"
            >
              {/* Placeholder untuk Ikon */}
              <div className="w-8 h-8 bg-gray-200 rounded-full mb-3"></div>
              <h3
                className={`text-lg font-semibold ${reason.titleColor} mb-2`}
              >
                {reason.title}
              </h3>
              <p className="text-gray-600 text-sm">{reason.description}</p>
            </div>
          ))}
        </div>

        {/* Kolom Kanan: Gambar dengan Overlay */}
        <div className="relative w-full md:w-1/3 h-auto m-0 p-0">
          <Image
            src="/img/whychooseus.png" // Pastikan path ini sesuai
            alt="Why Choose Us Image"
            layout="fill" // Mengisi kontainer penuh
            objectFit="cover" // Menjaga rasio aspek
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-start rounded-l-lg rounded-r-none">
            <h2 className="text-8xl font-bold text-white text-left tracking-wide max-w-sm ml-8 leading-32">
              WHY CHOOSE US?
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}