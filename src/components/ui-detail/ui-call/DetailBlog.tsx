"use client";

import Image from "next/image";
import { FaUser, FaRegCalendarAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { Blog } from "@/types/blog";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

export default function DetailBlog() {
  const [latestPosts, setLatestPosts] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await apiRequest<{ data: Blog[] }>("GET", "/api/landing-page/blogs?status=1");
        const posts = Array.isArray(response.data) ? response.data : [];
        
        // Get latest 6 posts
        const sortedPosts = [...posts]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 6);
        
        // Format blog data with proper image URLs
        const formattedPosts = sortedPosts.map(post => {
          const formattedPost = {
            ...post,
            assets: post.assets?.map(asset => {
              const fileUrl = asset.file_url.startsWith('http') 
                ? asset.file_url 
                : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${asset.file_url}`;
              return {
                ...asset,
                file_url: fileUrl
              };
            })
          };
          return formattedPost;
        });
        
        setLatestPosts(formattedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0,
      x: -20,
      y: 20
    },
    show: { 
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
        duration: 0.8
      }
    },
    hover: {
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  if (loading) {
    return (
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full h-[600px] p-6"
      >
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Latest Post</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="bg-white rounded-2xl shadow-xl w-full h-[600px] p-6"
    >
      <div className="flex flex-col h-full">
        <motion.h2 
          className="text-3xl font-bold text-gray-800 mb-6 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Latest Post
        </motion.h2>
        <motion.div 
          className="flex-1 overflow-y-auto overflow-x-hidden pr-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={{ maxHeight: "calc(100% - 4rem)" }}
        >
          <div className="space-y-6 pb-4">
            {latestPosts.map((post) => (
              <motion.div 
                key={post.id}
                variants={itemVariants}
                whileHover="hover"
                className="post-card border rounded-lg shadow-md p-4 flex flex-col md:flex-row gap-4 bg-white hover:shadow-xl transition-shadow duration-300"
              >
                {post.assets?.[0] && (
                  <motion.div 
                    className="relative w-full md:w-48 h-48 overflow-hidden rounded-md flex-shrink-0"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Image
                      src={post.assets[0].file_url}
                      alt={post.title}
                      fill
                      className="object-cover rounded-md"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      unoptimized
                      priority
                    />
                  </motion.div>
                )}
                <div className="flex-1 min-w-0">
                  <motion.h3 
                    className="text-lg font-semibold"
                    whileHover={{ scale: 1.01 }}
                  >
                    {post.title}
                  </motion.h3>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">{post.content}</p>
                  <div className="flex flex-wrap justify-between items-center mt-4 text-sm text-gray-500 gap-2">
                    <motion.div 
                      className="flex items-center gap-1"
                      whileHover={{ scale: 1.05 }}
                    >
                      <FaUser className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Uploaded by: {post.author?.name}</span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center gap-1"
                      whileHover={{ scale: 1.05 }}
                    >
                      <FaRegCalendarAlt className="w-4 h-4 flex-shrink-0" />
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}