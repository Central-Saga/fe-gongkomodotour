"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { apiRequest } from "@/lib/api";

interface Review {
  user_image: string;
  user_name: string;
  rating: number;
  comment: string;
  date: string;
}

interface ApiResponse {
  data: Review[];
}

interface DetailReviewProps {
  tripId: number;
}

export default function DetailReview({ tripId }: DetailReviewProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await apiRequest<ApiResponse>('GET', `/api/landing-page/trips/${tripId}/reviews`);
        if (response?.data) {
          setReviews(response.data);
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [tripId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 p-4 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-500">
          Belum ada review untuk trip ini
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Reviews</h2>
      <div className="grid gap-6">
        {reviews.map((review, index) => (
          <div key={index} className="review-card p-4 border rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <div className="relative w-12 h-12 mr-4">
                <Image
                  src={review.user_image}
                  alt={review.user_name}
                  fill
                  className="object-cover rounded-full"
                />
              </div>
              <div>
                <h4 className="font-semibold">{review.user_name}</h4>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-${i < review.rating ? 'yellow' : 'gray'}-400`}>★</span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-gray-600">{review.comment}</p>
            <p className="text-sm text-gray-400 mt-2">{review.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}