import { useRef, useState, useEffect } from "react";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

interface GoogleReview {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  profile_photo_url: string;
}

interface DetailReviewProps {
  tripId: number;
}

function AvatarWithFallback({ src, alt }: { src: string; alt: string }) {
  const [imgError, setImgError] = useState(false);
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
  return !imgError && src ? (
    <img
      src={src}
      alt={alt}
      className="w-10 h-10 object-cover rounded-full"
      onError={() => setImgError(true)}
    />
  ) : (
    <span className="text-yellow-500 font-bold text-lg">{getInitials(alt)}</span>
  );
}

export default function DetailReview({ tripId }: DetailReviewProps) {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [showFull, setShowFull] = useState<number | null>(null);

  useEffect(() => {
    const fetchGoogleReviews = async () => {
      try {
        const response = await fetch('/api/places');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        if (data.result && data.result.reviews) {
          setReviews(data.result.reviews);
        } else {
          throw new Error('Tidak ada review yang ditemukan');
        }
      } catch (error) {
        console.error('Error detail:', error);
        setError(error instanceof Error ? error.message : 'Terjadi kesalahan saat mengambil review');
      } finally {
        setLoading(false);
      }
    };

    fetchGoogleReviews();
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (scrollContainerRef.current) {
        const nextIndex = (currentIndex + 1) % reviews.length;
        const scrollAmount = nextIndex * 358;
        scrollContainerRef.current.scrollTo({
          left: scrollAmount,
          behavior: "smooth"
        });
        setCurrentIndex(nextIndex);
      }
    }, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentIndex, reviews.length]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    if (e.button !== 0) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    scrollContainerRef.current.style.cursor = "grabbing";
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
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
    intervalRef.current = setInterval(() => {
      if (scrollContainerRef.current) {
        const nextIndex = (currentIndex + 1) % reviews.length;
        const scrollAmount = nextIndex * 358;
        scrollContainerRef.current.scrollTo({
          left: scrollAmount,
          behavior: "smooth"
        });
        setCurrentIndex(nextIndex);
      }
    }, 3000);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  if (loading) {
    return (
      <section className="py-16 px-4 md:px-8 bg-[#f5f5f5]">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-4 md:px-8 bg-[#f5f5f5]">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Review</h2>
          <p className="text-red-600">Error: {error}</p>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return (
      <section className="py-16 px-4 md:px-8 bg-[#f5f5f5]">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Review</h2>
          <p className="text-gray-600">Belum ada review untuk trip ini.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 md:px-8 bg-[#f5f5f5]">
      <div className="">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Review</h2>
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide select-none"
          style={{ 
            scrollBehavior: "smooth", 
            cursor: "grab",
            scrollSnapType: "x mandatory"
          }}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {reviews.map((review, index) => {
            const isLong = review.text.length > 250;
            const displayText = showFull === index || !isLong ? review.text : review.text.slice(0, 250) + '...';
            return (
              <motion.div
                key={review.time}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="min-w-[320px] max-w-[500px] w-full bg-white p-8 rounded-2xl shadow-2xl flex-shrink-0 flex flex-col justify-between relative mb-6"
                style={{ scrollSnapAlign: "center" }}
              >
                <Quote className="absolute top-6 left-6 w-8 h-8 text-yellow-400 opacity-30 z-10" />
                <motion.div 
                  className="flex items-center mb-4 pl-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          i < review.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </motion.div>
                  ))}
                </motion.div>
                <p className="text-gray-700 mb-4 text-lg leading-relaxed" style={{minHeight: '72px'}}>
                  {displayText}
                  {isLong && showFull !== index && (
                    <button
                      className="ml-2 text-blue-600 hover:underline text-sm"
                      onClick={() => setShowFull(index)}
                    >
                      Lihat Selengkapnya
                    </button>
                  )}
                  {isLong && showFull === index && (
                    <button
                      className="ml-2 text-blue-600 hover:underline text-sm"
                      onClick={() => setShowFull(null)}
                    >
                      Sembunyikan
                    </button>
                  )}
                </p>
                <div className="flex items-center mt-4 gap-3">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="relative w-12 h-12 rounded-full bg-white border-2 border-yellow-400 flex items-center justify-center overflow-hidden shadow-md"
                    style={{ minWidth: 48, minHeight: 48 }}
                  >
                    <AvatarWithFallback src={review.profile_photo_url} alt={review.author_name} />
                  </motion.div>
                  <div className="flex flex-col justify-center">
                    <p className="text-xs font-medium text-gray-800">
                      {review.author_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(review.time * 1000).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}