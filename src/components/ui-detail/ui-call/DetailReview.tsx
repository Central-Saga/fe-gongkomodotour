import { useRef, useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";

// Definisikan tipe untuk data ulasan
interface ReviewItem {
  judul: string;
  nama: string;
  tanggal: string;
  komentar: string;
  gambar: string;
  rating: number;
}

// Definisikan tipe untuk props komponen
interface DetailReviewProps {
  reviews: ReviewItem[];
}

export default function DetailReview({ reviews }: DetailReviewProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    if (e.button !== 0) return; // Hanya klik kiri yang memicu drag
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    scrollContainerRef.current.style.cursor = "grabbing";
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = "grab";
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = "grab";
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Mengatur kecepatan drag
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <section className="py-16 px-4 md:px-8 bg-[#f5f5f5]">
      <div className="">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Review</h2>
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide select-none"
          style={{ scrollBehavior: "smooth", cursor: "grab" }}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {reviews.map((review, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg shadow-2xl hover:shadow-lg transition-shadow duration-300 flex-shrink-0"
              style={{
                minWidth: "400px", // Ukuran tetap untuk card
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Bayangan seperti MoreTrip
              }}
            >
              <div className="flex items-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < review.rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <h3 className="text-lg font-semibold text-gray-800">{review.judul}</h3>
              <p className="text-gray-600 mt-2">{review.komentar}</p>
              <div className="flex items-center mt-4">
                <Image
                  src={review.gambar}
                  alt={review.nama}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">{review.nama}</p>
                  <p className="text-sm text-gray-500">{review.tanggal}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}