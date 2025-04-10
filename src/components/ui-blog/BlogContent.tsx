"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { FaUser, FaRegCalendarAlt } from "react-icons/fa";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { Blog } from "@/types/blog";
import { motion } from "framer-motion";
        
const BlogContent = () => {
  const [allPosts, setAllPosts] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await apiRequest<{ data: Blog[] }>("GET", "/api/landing-page/blogs?status=1");
        const posts = Array.isArray(response.data) ? response.data : [];
        // Debug log removed to prevent leaking internal information
        setAllPosts(posts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Filter posts based on search and category
  const filteredPosts = allPosts.filter(post => {
    const matchesSearch = searchQuery === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategory === "all" || 
      post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get latest 3 posts
  const latestPosts = [...allPosts]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  // Get posts by category
  const travelPosts = allPosts.filter(post => {
    console.log('Checking post for travel:', {
      id: post.id,
      category: post.category,
      title: post.title
    });
    return post.category === "travel";
  }).slice(0, 3);

  const tipsPosts = allPosts.filter(post => {
    console.log('Checking post for tips:', {
      id: post.id,
      category: post.category,
      title: post.title
    });
    return post.category === "tips";
  }).slice(0, 3);

  console.log('Final travel posts:', travelPosts.map(post => ({
    id: post.id,
    category: post.category,
    title: post.title
  })));
  
  console.log('Final tips posts:', tipsPosts.map(post => ({
    id: post.id,
    category: post.category,
    title: post.title
  })));

  // Format blog data with proper image URLs
  const formatBlogData = (posts: Blog[]) => {
    return posts.map(post => ({
      ...post,
      assets: post.assets?.map(asset => ({
        ...asset,
        file_url: asset.file_url.startsWith('http') 
          ? asset.file_url 
          : `${process.env.NEXT_PUBLIC_API_URL}${asset.file_url}`
      }))
    }));
  };

  const formattedLatestPosts = formatBlogData(latestPosts);
  const formattedTravelPosts = formatBlogData(travelPosts);
  const formattedTipsPosts = formatBlogData(tipsPosts);
  const formattedFilteredPosts = formatBlogData(filteredPosts);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        duration: 0.8
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
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
    <div className="blog-content px-4 md:px-16 lg:px-24">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="blog-header bg-cover bg-center text-center py-16 w-screen -mx-4 md:-mx-16 lg:-mx-24 h-96 flex flex-col justify-center items-center"
        style={{ backgroundImage: "url('/img/boat/bg-boat-dlx-mv.jpg')" }}
      >
        <h1 className="text-4xl font-bold text-[#ffffff] mb-8">Blog</h1>
        <div className="search-bar flex justify-center gap-4 bg-[#f5f5f5] p-6 rounded-md shadow-md items-center w-full max-w-7xl mx-auto">
          <input
            type="text"
            placeholder="Search Article"
            className="p-3 border border-[#403d3d] rounded-md w-full md:w-1/3 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="p-3 border border-[#403d3d] rounded-md w-full md:w-1/3 focus:outline-none"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="travel">Travel</option>
          </select>
          <button 
            className="p-3 bg-gold text-white rounded-md w-full md:w-auto md:px-6 focus:outline-none active:opacity-100 hover:bg-gold-dark-10 transition-colors duration-300"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
          >
            Reset
          </button>
        </div>
      </motion.div>

      {/* Search Results Section */}
      {(searchQuery || selectedCategory !== "all") && (
        <motion.div 
          className="search-results py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-2xl font-bold mb-6">
            Search Results {selectedCategory !== "all" ? `in ${selectedCategory}` : ""}
          </h2>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {formattedFilteredPosts.map((post) => (
              <motion.div 
                key={post.id}
                variants={itemVariants}
                className="post-card border rounded-lg shadow-md p-4 flex flex-col h-full"
              >
                {post.assets?.[0] && (
                  <div className="relative h-64 w-full">
                    <Image
                      src={post.assets[0].file_url}
                      alt={post.title}
                      fill
                      className="object-cover rounded-md transition-transform duration-300 hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      unoptimized
                    />
                  </div>
                )}
                <h3 className="text-lg font-semibold mt-4">{post.title}</h3>
                <p className="text-sm text-gray-600 mt-2 flex-grow line-clamp-3">{post.content}</p>
                <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <FaUser className="w-4 h-4" />
                    <span>Uploaded by: {post.author?.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaRegCalendarAlt className="w-4 h-4" />
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
            {formattedFilteredPosts.length === 0 && (
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-500">No posts found</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Default View (when no search or filter) */}
      {!searchQuery && selectedCategory === "all" && (
        <>
          {/* Latest Post Section */}
          <motion.div 
            className="latest-post py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <h2 className="text-2xl font-bold mb-6">Latest Post</h2>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {formattedLatestPosts.map((post) => (
                <motion.div 
                  key={post.id}
                  variants={itemVariants}
                  className="post-card border rounded-lg shadow-md p-4 flex flex-col h-full"
                >
                  {post.assets?.[0] && (
                    <div className="relative h-64 w-full">
                      <Image
                        src={post.assets[0].file_url}
                        alt={post.title}
                        fill
                        className="object-cover rounded-md transition-transform duration-300 hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        unoptimized
                      />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold mt-4">{post.title}</h3>
                  <p className="text-sm text-gray-600 mt-2 flex-grow line-clamp-3">{post.content}</p>
                  <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <FaUser className="w-4 h-4" />
                      <span>Uploaded by: {post.author?.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaRegCalendarAlt className="w-4 h-4" />
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Travel Section */}
          <motion.div 
            className="traveling-flores py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Travel</h2>
              <Link href="/blog/viewall/travel" className="text-gold font-semibold hover:text-gold-dark-10 transition-colors duration-300">
                View All
              </Link>
            </div>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {formattedTravelPosts.map((post) => (
                <motion.div 
                  key={post.id}
                  variants={itemVariants}
                  className="post-card border rounded-lg shadow-md p-4 flex flex-col h-full"
                >
                  {post.assets?.[0] && (
                    <div className="relative h-64 w-full">
                      <Image
                        src={post.assets[0].file_url}
                        alt={post.title}
                        fill
                        className="object-cover rounded-md transition-transform duration-300 hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        unoptimized
                      />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold mt-4">{post.title}</h3>
                  <p className="text-sm text-gray-600 mt-2 flex-grow line-clamp-3">{post.content}</p>
                  <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <FaUser className="w-4 h-4" />
                      <span>Uploaded by: {post.author?.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaRegCalendarAlt className="w-4 h-4" />
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Tips Section */}
          <motion.div 
            className="traveling-tips py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Tips</h2>
              <Link href="/blog/viewall/tips" className="text-gold font-semibold hover:text-gold-dark-10 transition-colors duration-300">
                View All
              </Link>
            </div>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {formattedTipsPosts.map((post) => (
                <motion.div 
                  key={post.id}
                  variants={itemVariants}
                  className="post-card border rounded-lg shadow-md p-4 flex flex-col h-full"
                >
                  {post.assets?.[0] && (
                    <div className="relative h-64 w-full">
                      <Image
                        src={post.assets[0].file_url}
                        alt={post.title}
                        fill
                        className="object-cover rounded-md transition-transform duration-300 hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        unoptimized
                      />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold mt-4">{post.title}</h3>
                  <p className="text-sm text-gray-600 mt-2 flex-grow line-clamp-3">{post.content}</p>
                  <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <FaUser className="w-4 h-4" />
                      <span>Uploaded by: {post.author?.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaRegCalendarAlt className="w-4 h-4" />
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default BlogContent;
