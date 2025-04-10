export interface BlogPost {
  id: number;
  title: string;
  image: string;
  author: string;
  date: string;
  category: string;
  description: string;
  subImage?: string; // Sub-image
  subTitle?: string; // Sub-title
  subDescription?: string; // Tambahkan properti subDescription
}

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title:
      "Petualangan Ketaman National Komodo Park Pada Destinasi Pulau Komodo",
    image: "/img/blog/blog-1.jpeg",
    author: "Admin",
    date: "February 2025",
    category: "visiting-flores",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    subImage: "/img/blog/blog-1.jpeg",
    subTitle: "Keindahan Pulau Komodo",
    subDescription: "Jelajahi keindahan Pulau Komodo yang memukau.",
  },
  {
    id: 2,
    title: "Tips Traveling Aman dan Nyaman",
    image: "/img/blog/blog-2.jpeg",
    author: "Admin",
    date: "January 2025",
    category: "traveling-tips",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    subImage: "/img/blog/blog-2.jpeg",
    subTitle: "Tips Aman Saat Traveling",
    subDescription: "Panduan untuk traveling dengan aman dan nyaman.",
  },
  {
    id: 3,
    title: "Panduan Wisata ke Pulau Komodo",
    image: "/img/blog/blog-3.jpeg",
    author: "Admin",
    date: "March 2025",
    category: "traveling-tips",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    subImage: "/img/blog/blog-3.jpeg",
    subTitle: "Panduan Lengkap Wisata",
    subDescription: "Tips dan panduan lengkap untuk wisata ke Pulau Komodo.",
  },
  {
    id: 4,
    title: "Keindahan Alam Flores yang Memukau",
    image: "/img/blog/blog-2.jpeg",
    author: "Admin",
    date: "April 2025",
    category: "visiting-flores",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    subImage: "/img/blog/blog-4.jpeg",
    subTitle: "Pesona Alam Flores",
    subDescription: "Nikmati pesona alam Flores yang luar biasa.",
  },
  {
    id: 5,
    title: "Eksplorasi Desa Tradisional di Flores",
    image: "/img/blog/blog-3.jpeg",
    author: "Admin",
    date: "May 2025",
    category: "visiting-flores",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    subImage: "/img/blog/blog-5.jpeg",
    subTitle: "Budaya Desa Tradisional",
    subDescription: "Temukan budaya unik di desa tradisional Flores.",
  },
  {
    id: 6,
    title: "Tips Hemat Saat Traveling ke Flores",
    image: "/img/blog/blog-2.jpeg",
    author: "Admin",
    date: "June 2025",
    category: "traveling-tips",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    subImage: "/img/blog/blog-6.jpeg",
    subTitle: "Tips Hemat Traveling",
    subDescription: "Cara hemat untuk menikmati perjalanan ke Flores.",
  },
  {
    id: 7,
    title: "Tips Hemat Saat Traveling ke Flores",
    image: "/img/blog/blog-2.jpeg",
    author: "Admin",
    date: "June 2025",
    category: "traveling-tips",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    subImage: "/img/blog/blog-7.jpeg",
    subTitle: "Hemat Biaya Perjalanan",
    subDescription: "Tips untuk menghemat biaya perjalanan Anda.",
  },
];
