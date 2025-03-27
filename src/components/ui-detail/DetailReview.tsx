// components/ui-detail/DetailReview.tsx
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
  return (
    <section className="py-16 px-4 md:px-8 bg-gray-50">
      <div className="">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Review</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {reviews.map((review, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-md">
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