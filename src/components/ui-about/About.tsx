"use client";
import Image from "next/image";
import Link from "next/link";
import { Home, Eye, Target } from "lucide-react";
import { FaInstagram, FaWhatsapp, FaTripadvisor } from "react-icons/fa";
import { motion } from "framer-motion";
import { useState } from 'react';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/api';

const MotionDiv = motion.div;

export default function AboutUsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiRequest('POST', '/api/contact', formData);
      toast.success('Pesan berhasil dikirim!');
      setFormData({
        name: '',
        email: '',
        message: ''
      });
    } catch (error) {
      toast.error('Gagal mengirim pesan. Silakan coba lagi.');
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-[400px] w-full overflow-hidden"
      >
        <motion.div
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <Image
            src="/img/bg-about-us.png"
            alt="About Us Hero"
            fill
            className="object-cover object-center"
            quality={100}
            priority
          />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40 flex items-center justify-center"
        >
          <h1 className="text-5xl font-bold text-white tracking-wide text-center px-4">
            ABOUT US
          </h1>
        </motion.div>
      </motion.section>

      {/* About Section */}
      <section className="relative -mt-[120px] px-4 md:px-8 overflow-hidden drop-shadow-lg py-10">
        <MotionDiv 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <div className="bg-white p-8 md:p-12 rounded-xl shadow-lg flex flex-col md:flex-row items-center gap-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex-1">
              <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center md:text-left">Tentang Kami</h2>
              <div className="h-1 w-20 bg-gold mx-auto md:mx-0 mb-6"></div>
              <p className="text-lg text-gray-600 leading-relaxed text-justify">
                GONG KOMODO TOUR merupakan perusahaan yang bergerak di bidang jasa perjalanan wisata yang telah berdiri sejak tahun 2016. Saat ini kami melayani paket perjalanan wisata untuk Indonesia bagian Timur yang meliputi Flores (Labuan Bajo, Ruteng, Ende, Maumere, Larantuka) & Sumba. Kami berkomitmen untuk memberikan perjalanan wisata yang tak terlupakan dengan pelayanan terbaik. Adapun tagline yang merupakan identitas dari perusahaan kami yaitu &quot;ENDLESS DISCOVERIES TO THE EAST&quot;. Tagline tersebut memberikan arti bahwa, masih sangat banyak permata indah yang tersembunyi dan belum terjamah oleh para wisatawan di daerah Indonesia Timur. Selain memasarkan potensi pariwisata yang terdapat di Indonesia Timur ke mata dunia, perusahaan kami juga bertujuan untuk mensejahterakan masyarakat setempat dengan mengasah kemampuan mereka sebagai pemandu lokal berpengalaman yang siap melayani Anda menjelajahi keindahan alam dan budaya khususnya di daerah Indonesia Timur.
              </p>
            </div>
            <div className="flex-shrink-0">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src="/img/logo.png"
                  alt="Gong Komodo Tour Logo - Trusted Travel Service Provider in Indonesia"
                  width={300}
                  height={200}
                  className="max-w-full h-auto rounded-lg"
                />
              </motion.div>
            </div>
          </div>
        </MotionDiv>
      </section>

      {/* Vision & Mission Section */}
      <section className="py-20 px-4 md:px-8 relative bg-gray-50">
        <div className="w-full mx-auto relative overflow-visible">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Column: Image */}
            <MotionDiv 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative h-[500px] flex items-center justify-center"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gold/20 rounded-xl transform rotate-3"></div>
                <Image
                  src="/img/mantaabout.png"
                  alt="Manta Ray"
                  width={900}
                  height={500}
                  className="rounded-xl shadow-lg object-cover h-auto relative z-10"
                />
              </motion.div>
            </MotionDiv>
            {/* Right Column: Vision & Mission */}
            <MotionDiv 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8 flex flex-col justify-center"
            >
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-white p-8 rounded-xl shadow-lg w-full flex items-center gap-6 border-l-4 border-gold hover:shadow-xl transition-all duration-300"
              >
                <div className="bg-gold/10 p-4 rounded-full">
                  <Eye className="w-12 h-12 text-gold flex-shrink-0" />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">Visi</h2>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    Menjadi perusahaan travel agent terpercaya yang menjadi pilihan pelanggan dengan memberikan kualitas, keandalan dan pengalaman perjalanan yang tak terlupakan.
                  </p>
                </div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-white p-8 rounded-xl shadow-lg w-full flex items-center gap-6 border-l-4 border-gold hover:shadow-xl transition-all duration-300"
              >
                <div className="bg-gold/10 p-4 rounded-full">
                  <Target className="w-12 h-12 text-gold flex-shrink-0" />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">Misi</h2>
                  <ul className="space-y-3 text-gray-600 leading-relaxed text-lg">
                    <li className="flex items-start gap-2">
                      <span className="text-gold font-bold">1.</span>
                      Memberikan pengalaman perjalanan yang tak terlupakan bagi para pelanggan
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gold font-bold">2.</span>
                      Memperkenalkan destinasi wisata baru yang belum terjamah kepada kacamata dunia
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gold font-bold">3.</span>
                      Memastikan bahwa seluruh kegiatan perusahaan mampu menghasilkan nilai tambah, tidak hanya dari aspek pariwisata namun juga kesejahteraan masyarakat lokal di setiap daerahnya
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gold font-bold">4.</span>
                      Mengelola perusahaan berdasarkan prinsip Good Corporate Governance
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gold font-bold">5.</span>
                      Memberikan pelayanan yang prima, professional dan inovatif guna memberikan kepuasan terhadap pelanggan
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gold font-bold">6.</span>
                      Menyediakan berbagai macam pilihan paket perjalanan yang sesuai dengan kebutuhan dan anggaran pelanggan
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gold font-bold">7.</span>
                      Memberikan layanan yang ramah dan profesional untuk memastikan kenyamanan pelanggan selama perjalanan trip
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gold font-bold">8.</span>
                      Memastikan keselamatan dan keamanan para pelanggan selama perjalanan trip
                    </li>
                  </ul>
                </div>
              </motion.div>
            </MotionDiv>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section className="py-20 px-4 md:px-8 bg-gradient-to-b from-white to-gray-50">
        <MotionDiv 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Contact Us
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              If you have any questions or want to book a tour package, please don&apos;t hesitate 
              to contact us through the information below.
            </p>
          </div>

          {/* Contact Info and Map Container */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column: Contact Information and Form */}
            <div className="space-y-8">
              {/* Contact Information Card */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex flex-row items-center gap-4 mb-6">
                  <div className="bg-gold/10 p-3 rounded-lg">
                    <Home className="w-8 h-8 text-gold" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Our Office
                  </h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <a
                      href="mailto:gongkomodo@gmail.com"
                      className="text-gray-600 hover:text-gold transition-colors duration-300"
                    >
                      gongkomodo@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <a
                      href="tel:+628123867588"
                      className="text-gray-600 hover:text-gold transition-colors duration-300"
                    >
                      +62 812-3867-588
                    </a>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-gray-100 p-2 rounded-lg mt-1">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-600">
                      Jl. Ciung Wanara I No.42, Renon, Kec. Denpasar Tim., Kota Denpasar, Bali 80234, Indonesia
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Contact Form Card */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Get in Touch</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-gray-700">Your Name</label>
                    <input 
                      id="name"
                      name="name"
                      type="text" 
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">Your Email</label>
                    <input 
                      id="email"
                      name="email"
                      type="email" 
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-gray-700">Your Message</label>
                    <textarea 
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-300 h-32"
                    />
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    disabled={isLoading}
                    className={`w-full bg-gold text-white py-3 rounded-lg hover:bg-gold-dark transition-colors duration-300 font-medium ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? 'Mengirim...' : 'Send Message'}
                  </motion.button>
                </form>
              </motion.div>
            </div>

            {/* Right Column: Map and Social Media */}
            <div className="space-y-8">
              {/* Map Card */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Our Location</h2>
                <div className="w-full h-[400px] rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d986.6146146146146!2d115.236496!3d-8.6744023!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd24058b0ad051d%3A0x3df400f051a54b7a!2sGong%20Komodo%20Tour!5e0!3m2!1sen!2sus!4v1698765432100!5m2!1sen!2sus."
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </motion.div>

              {/* Social Media Card */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Follow Us</h2>
                <div className="flex justify-center gap-6">
                  <motion.div whileHover={{ scale: 1.1, y: -5 }} whileTap={{ scale: 0.95 }}>
                    <Link href="https://www.instagram.com/gongkomodo/" target="_blank" className="flex flex-col items-center gap-2">
                      <div className="bg-pink-500/10 p-4 rounded-full">
                        <FaInstagram className="w-8 h-8 text-pink-500" />
                      </div>
                      <span className="text-sm text-gray-600">Instagram</span>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.1, y: -5 }} whileTap={{ scale: 0.95 }}>
                    <Link href="https://wa.me/628123867588" target="_blank" className="flex flex-col items-center gap-2">
                      <div className="bg-green-500/10 p-4 rounded-full">
                        <FaWhatsapp className="w-8 h-8 text-green-500" />
                      </div>
                      <span className="text-sm text-gray-600">WhatsApp</span>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.1, y: -5 }} whileTap={{ scale: 0.95 }}>
                    <Link href="https://www.tripadvisor.co.id/Attraction_Review-g297694-d12002581-Reviews-Gong_Komodo_Tour-Denpasar_Bali.html" target="_blank" className="flex flex-col items-center gap-2">
                      <div className="bg-green-600/10 p-4 rounded-full">
                        <FaTripadvisor className="w-8 h-8 text-green-600" />
                      </div>
                      <span className="text-sm text-gray-600">TripAdvisor</span>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </MotionDiv>
      </section>
    </div>
  );
}