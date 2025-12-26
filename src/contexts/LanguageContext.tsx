"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Translation data
const translations = {
  en: {
    // Navigation
    home: "Home",
    packages: "Packages",
    openTrip: "Open Trip",
    privateTrip: "Private Trip",
    gallery: "Gallery",
    blog: "Blog",
    aboutUs: "About Us",
    login: "Login",
    register: "Register",
    logout: "Logout",
    dashboard: "Dashboard",
    myProfile: "My Profile",
    english: "English",
    indonesia: "Indonesia",
    
    // Hero Section
    heroTitle: "Discover the Beauty of Komodo Island",
    heroSubtitle: "Experience unforgettable adventures with the best tour services",
    heroButton: "Book Now",
    
    // Trip Highlight
    tripHighlightTitle: "Popular Trip Packages",
    tripHighlightSubtitle: "Choose the best package for your adventure",
    
    // About Us
    aboutTitle: "About Us",
    aboutSubtitle: "Your trusted travel partner for Komodo adventures",
    aboutDescription: "Come and explore the untouched magic of Eastern Indonesia with Gong Komodo Tour! Since 2016, we've been your friendly local experts for unforgettable adventures across Flores and Sumba. With our spirit of “Endless Discoveries to the East,” we’ll take you beyond the ordinary into hidden beaches, traditional villages, and unforgettable sunsets. And while you’re making memories, you’re also helping support local guides and communities who call these islands home. Our mission goes beyond tourism; we are committed to supporting and empowering local communities by nurturing skilled local guides who are passionate about sharing the beauty and soul of their homeland.",
    aboutUsHeroTitle: "ABOUT US",
    aboutUsDescription: "GONG KOMODO TOUR is a company engaged in travel services that has been established since 2016. Currently, we serve travel packages for Eastern Indonesia covering Flores (Labuan Bajo, Ruteng, Ende, Maumere, Larantuka) & Sumba. We are committed to providing unforgettable travel experiences with the best service. Our company's tagline which is the identity of our company is \"ENDLESS DISCOVERIES TO THE EAST\". This tagline means that there are still many beautiful hidden gems that have not been explored by tourists in Eastern Indonesia. In addition to marketing the tourism potential in Eastern Indonesia to the world, our company also aims to prosper the local community by honing their abilities as experienced local guides who are ready to serve you in exploring the beauty of nature and culture, especially in Eastern Indonesia.",
    vision: "Vision",
    visionDescription: "Our vision is to be the most trusted and preferred travel agency, recognized for our commitment to quality, dependability, and the creation of truly memorable travel experiences.",
    mission: "Mission",
    missionPoint1: "To deliver unforgettable travel experiences for our customers.",
    missionPoint2: "To introduce untouched and undiscovered destinations to the eyes of the world.",
    missionPoint3: "To ensure that all company activities create added value (not only in terms of tourism, but also in improving the welfare of local communities in every region we operate).",
    missionPoint4: "To manage the company in accordance with the principles of Good Corporate Governance.",
    missionPoint5: "To provide excellent, professional, and innovative services that ensure customer satisfaction.",
    missionPoint6: "To offer a wide range of travel packages tailored to meet the needs and budgets of our customers.",
    missionPoint7: "To deliver friendly and professional service, ensuring a comfortable journey throughout the trip.",
    missionPoint8: "To ensure the safety and security of all customers during their travel experience.",
    contactUs: "Contact Us",
    contactUsDescription: "If you have any questions or want to book a tour package, please don't hesitate to contact us through the information below.",
    ourOffice: "Our Office",
    getInTouch: "Get in Touch",
    yourName: "Your Name",
    yourEmail: "Your Email",
    yourMessage: "Your Message",
    sendMessage: "Send Message",
    sending: "Sending...",
    messageSentSuccess: "Message sent successfully!",
    messageSentError: "Failed to send message. Please try again.",
    ourLocation: "Our Location",
    followUs: "Follow Us",
    instagram: "Instagram",
    whatsapp: "WhatsApp",
    tripAdvisor: "TripAdvisor",
    
    // Open Trip & Private Trip
    openTripTitle: "OPEN TRIP",
    privateTripTitle: "PRIVATE TRIP",
    aboutOpenTripTitle: "About Open Trip",
    aboutOpenTripDescription: "Open Trip is a travel package open to the public, where participants can join with other participants who have booked the same trip. Open Trip has a fixed schedule and more affordable prices.",
    aboutPrivateTripTitle: "About Private Trip",
    aboutPrivateTripDescription: "Private Trip is an exclusive travel package specially designed for groups or individuals, where participants can arrange the itinerary according to their needs. This package offers a more personal and flexible experience.",
    findYourTripTitle: "Find Your Trip",
    sortBy: "Sort By",
    duration: "Duration",
    priceHighToLow: "Price: High to Low",
    priceLowToHigh: "Price: Low to High",
    openTripToursTitle: "Open Trip Tours",
    openTripToursDescription: "Discover our selection of group travel packages, perfect for those who want to explore with other adventurers.",
    privateTripToursTitle: "Private Trip Tours",
    privateTripToursDescription: "Discover our selection of exclusive travel packages, perfect for those who want a personalized experience.",
    customDuration: "Custom Duration",
    perPax: "/pax",
    previous: "Previous",
    next: "Next",
    
    // Why Choose Us
    whyChooseTitle: "Why Choose Us",
    whyChooseSubtitle: "The best reasons to travel with us",
    bestService: "Best Tour Service Provider",
    bestServiceDesc: "We are a trusted tour service provider with over 10 years of experience in Bali's tourism industry.",
    experiencedGuides: "Experienced Tour Guides",
    experiencedGuidesDesc: "Our team consists of professional and experienced tour guides who will make your journey more meaningful.",
    affordablePackages: "Affordable Travel Packages",
    affordablePackagesDesc: "Enjoy quality vacation experiences with competitive and transparent pricing without hidden costs.",
    bestDestination: "Best Destination Experience",
    bestDestinationDesc: "We present the best tourist destinations in Bali with unforgettable experiences for every guest.",
    hassleFree: "Hassle-Free Vacation",
    hassleFreeDesc: "We take care of all your travel needs so you can enjoy your vacation without worries.",
    enjoyableExperience: "Enjoyable Vacation Experience",
    enjoyableExperienceDesc: "Every journey is designed to provide a fun and memorable vacation experience.",
    
    // Testimonials
    testimonialsTitle: "What Our Customers Say",
    testimonialsSubtitle: "Discover the experiences shared by our valued customers who have explored the wonders of Komodo with us.",
    
    // FAQ
    faqTitle: "Frequently Asked Questions",
    faqSubtitle: "Find answers to common questions about our services",
    
    // Gallery
    galleryTitle: "Photo Gallery",
    gallerySubtitle: "Explore breathtaking moments from our adventures in Komodo National Park. From stunning underwater landscapes to encounters with ancient dragons, each image tells a unique story of Indonesia's natural beauty.",
    galleryPageTitle: "Our Gallery: Photos & Videos from Gong Komodo Tour",
    galleryPageSubtitle: "Discover the beauty of Komodo through our stunning collection of photos and videos. From breathtaking landscapes to unforgettable moments, each image tells a unique story of adventure and exploration. Let these visuals inspire your next journey to Komodo!",
    noGalleryData: "No gallery data available.",
    noTitle: "No Title",
    noDescription: "No Description",
    uncategorized: "Uncategorized",
    
    // Common
    loading: "Loading...",
    noData: "No data available.",
    readMore: "Read More",
    bookNow: "Book Now",
    viewDetails: "View Details",
    learnMore: "Learn More",
    hide: "Hide"
  },
  id: {
    // Navigation
    home: "Beranda",
    packages: "Paket",
    openTrip: "Open Trip",
    privateTrip: "Private Trip",
    gallery: "Galeri",
    blog: "Blog",
    aboutUs: "Tentang Kami",
    login: "Masuk",
    register: "Daftar",
    logout: "Keluar",
    dashboard: "Dashboard",
    myProfile: "Profil Saya",
    english: "English",
    indonesia: "Indonesia",
    
    // Hero Section
    heroTitle: "Jelajahi Keindahan Pulau Komodo",
    heroSubtitle: "Rasakan petualangan tak terlupakan dengan layanan tur terbaik",
    heroButton: "Pesan Sekarang",
    
    // Trip Highlight
    tripHighlightTitle: "Paket Perjalanan Populer",
    tripHighlightSubtitle: "Pilih paket terbaik untuk petualangan Anda",
    
    // About Us
    aboutTitle: "Tentang Kami",
    aboutSubtitle: "Partner perjalanan terpercaya untuk petualangan Komodo",
    aboutDescription: "Ayo jelajahi keajaiban Timur Indonesia yang masih alami bersama Gong Komodo Tour! Sejak 2016, kami menjadi sahabat lokal Anda untuk petualangan tak terlupakan di Flores dan Sumba. Dengan semangat 'Endless Discoveries to the East', kami akan membawa Anda melampaui yang biasa menuju pantai tersembunyi, desa adat, dan matahari terbenam yang tak terlupakan. Saat Anda menciptakan kenangan, Anda juga turut mendukung pemandu lokal dan komunitas yang tinggal di pulau-pulau ini. Misi kami lebih dari sekadar pariwisata; kami berkomitmen untuk mendukung dan memberdayakan masyarakat lokal dengan membina pemandu-pemandu handal yang penuh semangat membagikan keindahan dan jiwa tanah kelahirannya.",
    aboutUsHeroTitle: "TENTANG KAMI",
    aboutUsDescription: "GONG KOMODO TOUR merupakan perusahaan yang bergerak di bidang jasa perjalanan wisata yang telah berdiri sejak tahun 2016. Saat ini kami melayani paket perjalanan wisata untuk Indonesia bagian Timur yang meliputi Flores (Labuan Bajo, Ruteng, Ende, Maumere, Larantuka) & Sumba. Kami berkomitmen untuk memberikan perjalanan wisata yang tak terlupakan dengan pelayanan terbaik. Adapun tagline yang merupakan identitas dari perusahaan kami yaitu \"ENDLESS DISCOVERIES TO THE EAST\". Tagline tersebut memberikan arti bahwa, masih sangat banyak permata indah yang tersembunyi dan belum terjamah oleh para wisatawan di daerah Indonesia Timur. Selain memasarkan potensi pariwisata yang terdapat di Indonesia Timur ke mata dunia, perusahaan kami juga bertujuan untuk mensejahterakan masyarakat setempat dengan mengasah kemampuan mereka sebagai pemandu lokal berpengalaman yang siap melayani Anda menjelajahi keindahan alam dan budaya khususnya di daerah Indonesia Timur.",
    vision: "Visi",
    visionDescription: "Visi kami adalah menjadi agen perjalanan yang paling dipercaya dan dipilih, diakui atas komitmen kami terhadap kualitas, keandalan, dan penciptaan pengalaman perjalanan yang benar-benar berkesan.",
    mission: "Misi",
    missionPoint1: "Memberikan pengalaman perjalanan yang tak terlupakan bagi pelanggan kami.",
    missionPoint2: "Memperkenalkan destinasi yang masih alami dan belum terjamah kepada dunia.",
    missionPoint3: "Memastikan seluruh aktivitas perusahaan menciptakan nilai tambah (tidak hanya dari sisi pariwisata, tetapi juga meningkatkan kesejahteraan masyarakat lokal di setiap wilayah operasional kami).",
    missionPoint4: "Mengelola perusahaan sesuai dengan prinsip Good Corporate Governance.",
    missionPoint5: "Memberikan layanan yang prima, profesional, dan inovatif untuk memastikan kepuasan pelanggan.",
    missionPoint6: "Menyediakan berbagai pilihan paket perjalanan yang disesuaikan dengan kebutuhan dan anggaran pelanggan.",
    missionPoint7: "Memberikan layanan yang ramah dan profesional, memastikan kenyamanan selama perjalanan.",
    missionPoint8: "Memastikan keselamatan dan keamanan seluruh pelanggan selama perjalanan.",
    contactUs: "Hubungi Kami",
    contactUsDescription: "Jika Anda memiliki pertanyaan atau ingin memesan paket wisata, jangan ragu untuk menghubungi kami melalui informasi di bawah ini.",
    ourOffice: "Kantor Kami",
    getInTouch: "Hubungi Kami",
    yourName: "Nama Anda",
    yourEmail: "Email Anda",
    yourMessage: "Pesan Anda",
    sendMessage: "Kirim Pesan",
    sending: "Mengirim...",
    messageSentSuccess: "Pesan berhasil dikirim!",
    messageSentError: "Gagal mengirim pesan. Silakan coba lagi.",
    ourLocation: "Lokasi Kami",
    followUs: "Ikuti Kami",
    instagram: "Instagram",
    whatsapp: "WhatsApp",
    tripAdvisor: "TripAdvisor",
    
    // Open Trip & Private Trip
    openTripTitle: "OPEN TRIP",
    privateTripTitle: "PRIVATE TRIP",
    aboutOpenTripTitle: "Tentang Open Trip",
    aboutOpenTripDescription: "Open Trip adalah paket wisata yang terbuka untuk umum, dimana peserta dapat bergabung dengan peserta lain yang telah memesan perjalanan yang sama. Open Trip memiliki jadwal tetap dan harga yang lebih terjangkau.",
    aboutPrivateTripTitle: "Tentang Private Trip",
    aboutPrivateTripDescription: "Private Trip adalah paket wisata eksklusif yang dirancang khusus untuk grup atau individu, dimana peserta dapat mengatur itinerary sesuai kebutuhan mereka. Paket ini menawarkan pengalaman yang lebih personal dan fleksibel.",
    findYourTripTitle: "Temukan Perjalanan Anda",
    sortBy: "Urutkan Berdasarkan",
    duration: "Durasi",
    priceHighToLow: "Harga: Tinggi ke Rendah",
    priceLowToHigh: "Harga: Rendah ke Tinggi",
    openTripToursTitle: "Tur Open Trip",
    openTripToursDescription: "Temukan pilihan paket perjalanan grup kami, sempurna untuk mereka yang ingin menjelajah dengan petualang lainnya.",
    privateTripToursTitle: "Tur Private Trip",
    privateTripToursDescription: "Temukan pilihan paket wisata eksklusif kami, sempurna untuk mereka yang menginginkan pengalaman yang dipersonalisasi.",
    customDuration: "Durasi Kustom",
    perPax: "/pax",
    previous: "Sebelumnya",
    next: "Selanjutnya",
    
    // Why Choose Us
    whyChooseTitle: "Mengapa Memilih Kami",
    whyChooseSubtitle: "Alasan terbaik untuk bepergian bersama kami",
    bestService: "Penyedia Layanan Tur Terbaik",
    bestServiceDesc: "Kami adalah penyedia layanan tur terpercaya dengan pengalaman lebih dari 10 tahun di industri pariwisata Bali.",
    experiencedGuides: "Pemandu Wisata Berpengalaman",
    experiencedGuidesDesc: "Tim kami terdiri dari pemandu wisata profesional dan berpengalaman yang akan membuat perjalanan Anda lebih bermakna.",
    affordablePackages: "Paket Perjalanan Terjangkau",
    affordablePackagesDesc: "Nikmati pengalaman liburan berkualitas dengan harga kompetitif dan transparan tanpa biaya tersembunyi.",
    bestDestination: "Pengalaman Destinasi Terbaik",
    bestDestinationDesc: "Kami menghadirkan destinasi wisata terbaik di Bali dengan pengalaman tak terlupakan untuk setiap tamu.",
    hassleFree: "Liburan Tanpa Ribet",
    hassleFreeDesc: "Kami mengurus semua kebutuhan perjalanan Anda sehingga Anda bisa menikmati liburan tanpa khawatir.",
    enjoyableExperience: "Pengalaman Liburan Menyenangkan",
    enjoyableExperienceDesc: "Setiap perjalanan dirancang untuk memberikan pengalaman liburan yang menyenangkan dan tak terlupakan.",
    
    // Testimonials
    testimonialsTitle: "Apa Kata Pelanggan Kami",
    testimonialsSubtitle: "Temukan pengalaman yang dibagikan oleh pelanggan kami yang puas dengan petualangan Komodo bersama kami.",
    
    // FAQ
    faqTitle: "Pertanyaan yang Sering Diajukan",
    faqSubtitle: "Temukan jawaban untuk pertanyaan umum tentang layanan kami",
    
    // Gallery
    galleryTitle: "Galeri Foto",
    gallerySubtitle: "Jelajahi momen indah dari petualangan kami di Taman Nasional Komodo. Dari pemandangan alam bawah laut yang menakjubkan hingga pembelokan dengan naga-naga purba, setiap gambar memberikan cerita unik tentang keindahan alam Indonesia.",
    galleryPageTitle: "Galeri Kami: Foto & Video dari Gong Komodo Tour",
    galleryPageSubtitle: "Jelajahi keindahan Komodo melalui koleksi foto dan video yang menakjubkan kami. Dari pemandangan alam bawah laut yang menakjubkan hingga momen yang tak terlupakan, setiap gambar memberikan cerita unik tentang petualangan dan eksplorasi. Biarkan visual ini menginspirasi perjalananmu berikutnya ke Komodo!",
    noGalleryData: "Tidak ada data galeri.",
    noTitle: "Tidak Ada Judul",
    noDescription: "Tidak Ada Deskripsi",
    uncategorized: "Tidak Dikategorikan",
    
    // Common
    loading: "Memuat...",
    noData: "Tidak ada data tersedia.",
    readMore: "Baca Selengkapnya",
    bookNow: "Pesan Sekarang",
    viewDetails: "Lihat Detail",
    learnMore: "Pelajari Lebih Lanjut",
    hide: "Sembunyikan"
  }
};

type Language = 'en' | 'id';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Default to English to prevent hydration mismatch
  const [language, setLanguageState] = useState<Language>('en');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Load language from localStorage on mount (client-side only)
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'id')) {
      setLanguageState(savedLanguage);
    }
    setIsHydrated(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    // Always use current language state
    // Server and client both start with 'en' default, preventing hydration mismatch
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}; 