import Image from "next/image";

export default function WhyChooseUs() {
  const reasons = [
    {
      title: "Penyedia Layanan Tour Terbaik",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      titleColor: "text-blue-500",
      icon: "/img/tourterbaik.png", // Path to the icon for this reason
    },
    {
      title: "Layanan Pemandu Berpengalaman",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      titleColor: "text-pink-500",
      icon: "/img/guide.png",
    },
    {
      title: "Perjalanan Dengan Harga Terjangkau",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      titleColor: "text-red-500",
      icon: "/img/money.png",
    },
    {
      title: "Pengalaman Destinasi Terbaik",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      titleColor: "text-purple-500",
      icon: "/img/lovepath.png",
    },
    {
      title: "Melakukan Liburan Tanpa Beban",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      titleColor: "text-yellow-500",
      icon: "/img/island.png",
    },
    {
      title: "Melakukan Liburan menyenangkan",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      titleColor: "text-orange-500",
      icon: "/img/gendola.png",
    },
  ];

  return (
    <section className="py-0 bg-white m-0 w-full">
      <div className="flex flex-col md:flex-row">
        {/* Left Column: 6 Cards in a 2x3 Grid */}
        <div className="flex-1 max-w-[1100px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6 p-10 md:mr-20">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="bg-white p-6 shadow-md rounded-lg border border-gray-100 flex flex-col items-center"
            >
              {/* Icon/Image for the Card */}
              <Image
                src={reason.icon}
                alt={`${reason.title} icon`}
                width={90} // Adjust size as needed
                height={90}
                className="mb-3"
              />
              <h3
                className={`text-lg font-semibold ${reason.titleColor} mb-2 text-center`}
              >
                {reason.title}
              </h3>
              <p className="text-gray-600 text-sm text-center">
                {reason.description}
              </p>
            </div>
          ))}
        </div>

        {/* Right Column: Image with Overlay */}
        <div className="relative w-full md:w-1/3 m-0 p-0">
          <div className="relative w-full h-full min-h-[400px]">
            <Image
              src="/img/whychooseus.png"
              alt="Why Choose Us Image"
              layout="fill"
              objectFit="cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-start  rounded-r-none">
              <h2 className="text-8xl font-bold text-white text-left tracking-wide max-w-sm ml-8 leading-tight">
                WHY CHOOSE US?
              </h2>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}