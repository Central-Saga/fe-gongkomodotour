"use client";

import Head from "next/head";
import Image from "next/image";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export default function WhyChooseUs() {
  const { t } = useLanguage();
  
  const reasons = [
    {
      title: t('bestService'),
      description: t('bestServiceDesc'),
      icon: "/img/world-travel.gif",
    },
    {
      title: t('experiencedGuides'),
      description: t('experiencedGuidesDesc'),
      icon: "/img/tour-guide.gif",
    },
    {
      title: t('affordablePackages'),
      description: t('affordablePackagesDesc'),
      icon: "/img/money-bag.gif",
    },
    {
      title: t('bestDestination'),
      description: t('bestDestinationDesc'),
      icon: "/img/destination.gif",
    },
    {
      title: t('hassleFree'),
      description: t('hassleFreeDesc'),
      icon: "/img/island-vacation.gif",
    },
    {
      title: t('enjoyableExperience'),
      description: t('enjoyableExperienceDesc'),
      icon: "/img/boat-travel.gif",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <>
      <Head>
        <title>{t('whyChooseTitle')} - Gong Komodo Tour</title>
        <meta
          name="description"
          content="Discover why Gong Komodo Tour is the best choice for your Bali vacation. Professional tour services, experienced guides, and affordable prices."
        />
      </Head>
      <section className="py-0 bg-white m-0 w-full" aria-label="Reasons to choose Gong Komodo Tour">
        <div className="flex flex-col lg:flex-row w-full">
          {/* Gambar "Mengapa Memilih Kami" - Mobile: di atas, Desktop: di kanan */}
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="relative w-full lg:w-1/3 m-0 p-0 order-1 lg:order-2"
          >
            <div className="relative w-full h-full min-h-[300px] lg:min-h-[400px]">
              <Image
                src="/img/whychooseus.jpg"
                alt="Professional team of Gong Komodo Tour ready to serve your journey"
                fill
                className="object-cover"
                quality={85}
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                className="absolute inset-0 bg-black/10 flex items-center justify-start rounded-r-none"
              >
                <motion.h2 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  viewport={{ once: true }}
                  className="text-4xl md:text-6xl lg:text-8xl font-bold text-white text-left tracking-wide max-w-sm ml-4 md:ml-8 leading-tight"
                >
                  {t('whyChooseTitle').toUpperCase()}?
                </motion.h2>
              </motion.div>
            </div>
          </motion.div>

          {/* Fasilitas - Mobile: di bawah, Desktop: di kiri */}
          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex-1 w-full max-w-[1100px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6 p-6 md:p-10 lg:mr-20 order-2 lg:order-1 bg-white"
          >
            {reasons && reasons.length > 0 ? reasons.map((reason, index) => (
              <motion.article
                key={index}
                variants={item}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                className="bg-white p-4 md:p-6 shadow-md rounded-lg border border-gray-100 flex flex-col items-center hover:shadow-xl transition-all duration-300"
              >
                <motion.div 
                  className="w-16 h-16 md:w-24 md:h-24 relative mb-3 md:mb-4"
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Image
                    src={reason.icon}
                    alt={`${reason.title} animation`}
                    fill
                    className="object-contain"
                    quality={85}
                    sizes="(max-width: 768px) 64px, 96px"
                    unoptimized={reason.icon.endsWith('.gif')}
                  />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-base md:text-lg font-semibold text-[#FFB000] mb-2 text-center"
                >
                  {reason.title}
                </motion.h3>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-gray-600 text-xs md:text-sm text-center"
                >
                  {reason.description}
                </motion.p>
              </motion.article>
            )) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">Loading facilities...</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </>
  );
}
