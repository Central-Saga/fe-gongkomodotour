import { useRef, useState, useEffect } from "react";
import { Star } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { Testimonial } from "@/types/testimonials";

interface DetailReviewProps {
  tripId: number;
}

export default function DetailReview({ tripId }: DetailReviewProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await apiRequest<{ data: Testimonial[] }>(
          'GET',
          '/api/testimonials'
        );
        // Filter testimonial yang terkait dengan trip dan sudah disetujui
        const tripTestimonials = response.data.filter(
          (testimonial) => testimonial.trip_id === tripId && testimonial.is_approved
        );
        setTestimonials(tripTestimonials);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, [tripId]);

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

  // Fungsi untuk mendapatkan inisial dari nama
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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

  if (testimonials.length === 0) {
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
          style={{ scrollBehavior: "smooth", cursor: "grab" }}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white p-4 rounded-lg shadow-2xl hover:shadow-lg transition-shadow duration-300 flex-shrink-0"
              style={{
                minWidth: "400px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div className="flex items-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < testimonial.rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <h3 className="text-lg font-semibold text-gray-800">{testimonial.trip?.name}</h3>
              <p className="text-gray-600 mt-2">{testimonial.review}</p>
              <div className="flex items-center mt-4">
                <div className="relative w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold mr-3">
                  {getInitials(testimonial.customer.user.name)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{testimonial.customer.user.name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(testimonial.created_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}