"use client";

import React, { useState, useEffect, use } from "react";
import { CachedImage } from "@/components/ui/cached-image";
import Link from "next/link";
import { FaUser, FaRegCalendarAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/api";
import { Blog } from "@/types/blog";
import { getImageUrl } from "@/lib/imageUrl";
import { cleanHtmlContent } from "@/lib/htmlUtils";

interface PageProps {
  params: Promise<{
    category: string;
  }>;
}

const ViewAllCategory = ({ params }: PageProps) => {
  const resolvedParams = use(params);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        duration: 0.8,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching blogs for category:", resolvedParams.category);
        const response = await apiRequest<{ data: Blog[] }>("GET", `/api/landing-page/blogs?status=1&category=${resolvedParams.category}`);
        console.log("API Response:", response);
        

        // Format blog data with proper image URLs and cleaned content
        const formattedBlogs = (response.data || []).map((post) => ({
          ...post,
          content: cleanHtmlContent(post.content),
          assets: post.assets?.map((asset) => ({
            ...asset,
            file_url: getImageUrl(asset.file_url),
          })),
        }));
        
        setBlogs(formattedBlogs);
      } catch (error) {
        console.error("Error fetching blogs:", error);
        setError("Gagal memuat artikel. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    if (resolvedParams.category) {
      fetchBlogs();
    }
  }, [resolvedParams.category]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail-blog px-4 md:px-16 lg:px-24 py-12">
        <div className="mb-6">
          <Link 
            href="/blog" 
            className="text-yellow-600 hover:text-yellow-700 font-semibold mb-4 inline-block transition-colors duration-300"
          >
            ← Kembali ke Blog
          </Link>
          <h1 className="text-4xl font-bold capitalize">{resolvedParams.category.replace("-", " ")} Articles</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-red-600 text-lg mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-blog px-4 md:px-16 lg:px-24 py-12">
      <div className="mb-6">
        <Link 
          href="/blog" 
          className="text-yellow-600 hover:text-yellow-700 font-semibold mb-4 inline-block transition-colors duration-300"
        >
          ← Kembali ke Blog
        </Link>
        <h1 className="text-4xl font-bold capitalize">{resolvedParams.category.replace("-", " ")} Articles</h1>
      </div>

      {/* Content Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        {blogs.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {blogs.map((post) => (
              <Link
                key={post.id}
                href={`/detail-blog?id=${post.id}`}
                className="group"
              >
                <motion.div
                  variants={itemVariants}
                  className="post-card border rounded-lg shadow-md p-4 flex flex-col h-full cursor-pointer transition-transform duration-300 group-hover:scale-105"
                >
                  {post.assets?.[0] && (
                    <div className="relative h-64 w-full">
                      <CachedImage
                        src={post.assets[0].file_url}
                        alt={post.title}
                        fill
                        className="object-cover rounded-md transition-transform duration-300 hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        unoptimized
                        fallbackSrc="/placeholder-image.png"
                      />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold mt-4">{post.title}</h3>
                  <div
                    className="text-sm text-gray-600 mt-2 flex-grow line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                  <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <FaUser className="w-4 h-4" />
                      <span>Uploaded by: {post.author?.name || 'Admin'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaRegCalendarAlt className="w-4 h-4" />
                      <span>
                        {new Date(post.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <p className="text-gray-600 text-lg mb-4">Tidak ada artikel ditemukan untuk kategori ini.</p>
            <Link 
              href="/blog" 
              className="text-yellow-600 hover:text-yellow-700 font-semibold"
            >
              Lihat Semua Artikel
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ViewAllCategory;