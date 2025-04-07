import Head from "next/head";
import Image from "next/image";

export default function WhyChooseUs() {
  const reasons = [
    {
      title: "Best Tour Service Provider",
      description:
        "We are a trusted tour service provider with over 10 years of experience in Bali's tourism industry.",
      icon: "/img/world-travel.gif",
    },
    {
      title: "Experienced Tour Guides",
      description:
        "Our team consists of professional and experienced tour guides who will make your journey more meaningful.",
      icon: "/img/tour-guide.gif",
    },
    {
      title: "Affordable Travel Packages",
      description:
        "Enjoy quality vacation experiences with competitive and transparent pricing without hidden costs.",
      icon: "/img/money-bag.gif",
    },
    {
      title: "Best Destination Experience",
      description:
        "We present the best tourist destinations in Bali with unforgettable experiences for every guest.",
      icon: "/img/destination.gif",
    },
    {
      title: "Hassle-Free Vacation",
      description:
        "We take care of all your travel needs so you can enjoy your vacation without worries.",
      icon: "/img/island-vacation.gif",
    },
    {
      title: "Enjoyable Vacation Experience",
      description:
        "Every journey is designed to provide a fun and memorable vacation experience.",
      icon: "/img/boat-travel.gif",
    },
  ];

  return (
    <>
      <Head>
        <title>Why Choose Us - Gong Komodo Tour</title>
        <meta
          name="description"
          content="Discover why Gong Komodo Tour is the best choice for your Bali vacation. Professional tour services, experienced guides, and affordable prices."
        />
      </Head>
      <section className="py-0 bg-white m-0 w-full" aria-label="Reasons to choose Gong Komodo Tour">
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 max-w-[1100px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6 p-10 md:mr-20">
            {reasons.map((reason, index) => (
              <article
                key={index}
                className="bg-white p-6 shadow-md rounded-lg border border-gray-100 flex flex-col items-center hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-24 h-24 relative mb-4">
                  <Image
                    src={reason.icon}
                    alt={`${reason.title} animation`}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <h3
                  className="text-lg font-semibold text-[#FFB000] mb-2 text-center"
                >
                  {reason.title}
                </h3>
                <p className="text-gray-600 text-sm text-center">
                  {reason.description}
                </p>
              </article>
            ))}
          </div>

          <div className="relative w-full md:w-1/3 m-0 p-0">
            <div className="relative w-full h-full min-h-[400px]">
              <Image
                src="/img/whychooseus.png"
                alt="Professional team of Gong Komodo Tour ready to serve your journey"
                layout="fill"
                objectFit="cover"
                quality={100}
                priority
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-start rounded-r-none">
                <h2 className="text-8xl font-bold text-white text-left tracking-wide max-w-sm ml-8 leading-tight">
                  WHY CHOOSE US?
                </h2>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}