export interface BlogPost {
  id: number;
  title: string;
  image: string;
  author: string;
  date: string;
  category: string;
  description: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Petualangan Ketaman National Komodo Park Pada Destinasi Pulau Komodo",
    image: "/img/blog/blog-1.jpeg",
    author: "Admin",
    date: "February 2025",
    category: "visiting-flores",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: 2,
    title: "Tips Traveling Aman dan Nyaman",
    image: "/img/blog/blog-2.jpeg",
    author: "Admin",
    date: "January 2025",
    category: "traveling-tips",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: 3,
    title: "Panduan Wisata ke Pulau Komodo",
    image: "/img/blog/blog-3.jpeg",
    author: "Admin",
    date: "March 2025",
    category: "traveling-tips",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: 4,
    title: "Keindahan Alam Flores yang Memukau",
    image: "/img/blog/blog-2.jpeg",
    author: "Admin",
    date: "April 2025",
    category: "visiting-flores",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Jelajahi keindahan alam Flores yang memukau.",
  },
  {
    id: 5,
    title: "Eksplorasi Desa Tradisional di Flores",
    image: "/img/blog/blog-3.jpeg",
    author: "Admin",
    date: "May 2025",
    category: "visiting-flores",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Temukan budaya unik di desa tradisional Flores.",
  },
  // Tambahan data dummy untuk Traveling Tips
  {
    id: 6,
    title: "Tips Hemat Saat Traveling ke Flores",
    image: "/img/blog/blog-2.jpeg",
    author: "Admin",
    date: "June 2025",
    category: "traveling-tips",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tips hemat untuk perjalanan ke Flores.",
  },
  {
    id: 7,
    title: "Tips Hemat Saat Traveling ke Flores",
    image: "/img/blog/blog-2.jpeg",
    author: "Admin",
    date: "June 2025",
    category: "traveling-tips",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tips hemat untuk perjalanan ke Flores.",
  },
];