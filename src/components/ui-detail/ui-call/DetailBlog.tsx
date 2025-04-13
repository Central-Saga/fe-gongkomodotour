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
        
        // Get latest 5 posts
        const latest = [...posts]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);
        
        // Format blog data with proper image URLs
        const formattedPosts = latest.map(post => {
          console.log('Original asset URL:', post.assets?.[0]?.file_url);
          const formattedPost = {
            ...post,
            assets: post.assets?.map(asset => {
              const fileUrl = asset.file_url.startsWith('http') 
                ? asset.file_url 
                : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${asset.file_url}`;
              console.log('Formatted asset URL:', fileUrl);
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
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <section className="pt-12 px-4 md:px-8 bg-white rounded-2xl shadow-xl">
      <div className="max-w-6xl mx-auto">
        <motion.h2 
          className="text-3xl font-bold text-gray-800 mb-6 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Latest Post
        </motion.h2>
        <motion.div 
          className="h-[600px] overflow-y-auto scrollbar-hide"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <div className="space-y-6 pr-4 pb-8">
            {latestPosts.map((post) => {
              console.log('Rendering post with assets:', post.assets);
              return (
                <motion.div 
                  key={post.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="show"
                  whileHover="hover"
                  className="post-card border rounded-lg shadow-md p-4 flex flex-col md:flex-row gap-4 bg-white hover:shadow-xl transition-shadow duration-300"
                >
                  {post.assets?.[0] && (
                    <motion.div 
                      className="relative w-full md:w-48 h-48 overflow-hidden rounded-md"
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
                  <div className="flex-1">
                    <motion.h3 
                      className="text-lg font-semibold"
                      whileHover={{ scale: 1.01 }}
                    >
                      {post.title}
                    </motion.h3>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-3">{post.content}</p>
                    <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                      <motion.div 
                        className="flex items-center gap-1"
                        whileHover={{ scale: 1.05 }}
                      >
                        <FaUser className="w-4 h-4" />
                        <span>Uploaded by: {post.author?.name}</span>
                      </motion.div>
                      <motion.div 
                        className="flex items-center gap-1"
                        whileHover={{ scale: 1.05 }}
                      >
                        <FaRegCalendarAlt className="w-4 h-4" />
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}