"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { FaUser, FaRegCalendarAlt } from "react-icons/fa";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { Blog } from "@/types/blog";
import { motion } from "framer-motion";
import { getImageUrl } from "@/lib/imageUrl";
import { cleanHtmlContent } from "@/lib/htmlUtils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Search,
  Filter,
  X,
  ArrowUpDown,
  Calendar,
  User,
  Tag,
  SortAsc,
  SortDesc,
} from "lucide-react";

const BlogContent = () => {
  const [allPosts, setAllPosts] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [selectedAuthor, setSelectedAuthor] = useState<string>("all");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await apiRequest<{ data: Blog[] }>(
          "GET",
          "/api/landing-page/blogs?status=1"
        );
        const posts = Array.isArray(response.data) ? response.data : [];
        setAllPosts(posts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);


  // Format blog data with proper image URLs and cleaned content
  const formatBlogData = (posts: Blog[]) => {
    return posts.map((post) => ({
      ...post,
      content: cleanHtmlContent(post.content),
      assets: post.assets?.map((asset) => ({
        ...asset,
        file_url: getImageUrl(asset.file_url),
      })),
    }));
  };

  // Get unique authors
  const availableAuthors = useMemo(() => {
    const authors = new Set<string>();
    allPosts.forEach((post) => {
      if (post.author?.name) {
        authors.add(post.author.name);
      }
    });
    return Array.from(authors).sort();
  }, [allPosts]);

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("newest");
    setSelectedAuthor("all");
  };

  // Check if any filter is active
  const hasActiveFilters =
    searchQuery !== "" ||
    selectedCategory !== "all" ||
    sortBy !== "newest" ||
    selectedAuthor !== "all";

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    let filtered = [...allPosts];

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((post) => post.category === selectedCategory);
    }

    // Filter by author
    if (selectedAuthor !== "all") {
      filtered = filtered.filter(
        (post) => post.author?.name === selectedAuthor
      );
    }

    // Sort posts
    switch (sortBy) {
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "oldest":
        filtered.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      case "title-asc":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        break;
    }

    return filtered;
  }, [allPosts, searchQuery, selectedCategory, selectedAuthor, sortBy]);

  // Get latest 3 posts
  const latestPosts = [...allPosts]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 3);

  // Get posts by category
  const travelPosts = allPosts
    .filter((post) => post.category === "travel")
    .slice(0, 3);
  const tipsPosts = allPosts
    .filter((post) => post.category === "tips")
    .slice(0, 3);
  const tripsPosts = allPosts
    .filter((post) => post.category === "trips")
    .slice(0, 3);

  const formattedLatestPosts = formatBlogData(latestPosts);
  const formattedTravelPosts = formatBlogData(travelPosts);
  const formattedTipsPosts = formatBlogData(tipsPosts);
  const formattedTripsPosts = formatBlogData(tripsPosts);
  const formattedFilteredPosts = formatBlogData(filteredPosts);

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
        className="blog-header bg-cover bg-center text-center py-14 w-screen -mx-4 md:-mx-16 lg:-mx-24 h-auto min-h-[400px] flex flex-col justify-center items-center"
        style={{ backgroundImage: "url('/img/boat/bg-boat-dlx-mv.jpg')" }}
      >
        <h1 className="text-4xl font-bold text-[#ffffff] mb-8">Blog</h1>
        
        {/* Enhanced Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full max-w-7xl mx-auto px-4"
        >
          <Card className="bg-white/95 backdrop-blur-sm p-6 shadow-xl border-0">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gold" />
                <h3 className="text-xl font-semibold text-gray-800">
                  Filter & Search
                </h3>
              </div>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                >
                  <X className="w-4 h-4 mr-1" />
                  Reset
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Search className="w-4 h-4 text-gold" />
                  Search Article
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by title or content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-gray-300 focus:ring-2 focus:ring-gold"
                  />
                </div>
                {searchQuery && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 mt-1">
                    {searchQuery}
                  </Badge>
                )}
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gold" />
                  Category
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-gold hover:border-gold transition-colors">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="tips">Tips</SelectItem>
                    <SelectItem value="trips">Trips</SelectItem>
                  </SelectContent>
                </Select>
                {selectedCategory !== "all" && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 mt-1">
                    {selectedCategory}
                  </Badge>
                )}
              </div>

              {/* Author Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-gold" />
                  Author
                </label>
                <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
                  <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-gold hover:border-gold transition-colors">
                    <SelectValue placeholder="All Authors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Authors</SelectItem>
                    {availableAuthors.map((author) => (
                      <SelectItem key={author} value={author}>
                        {author}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedAuthor !== "all" && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200 mt-1">
                    {selectedAuthor}
                  </Badge>
                )}
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-gold" />
                  Sort By
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-gold hover:border-gold transition-colors">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">
                      <div className="flex items-center gap-2">
                        <SortDesc className="w-4 h-4" />
                        Newest First
                      </div>
                    </SelectItem>
                    <SelectItem value="oldest">
                      <div className="flex items-center gap-2">
                        <SortAsc className="w-4 h-4" />
                        Oldest First
                      </div>
                    </SelectItem>
                    <SelectItem value="title-asc">
                      <div className="flex items-center gap-2">
                        <SortAsc className="w-4 h-4" />
                        Title A-Z
                      </div>
                    </SelectItem>
                    <SelectItem value="title-desc">
                      <div className="flex items-center gap-2">
                        <SortDesc className="w-4 h-4" />
                        Title Z-A
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {sortBy !== "newest" && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200 mt-1">
                    {sortBy === "oldest" ? "Oldest First" : sortBy === "title-asc" ? "Title A-Z" : "Title Z-A"}
                  </Badge>
                )}
              </div>
            </div>

          </Card>
        </motion.div>
      </motion.div>

      {/* Search Results Section */}
      {hasActiveFilters && (
        <motion.div
          className="search-results py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              Search Results
              {filteredPosts.length > 0 && (
                <span className="text-lg font-normal text-gray-500 ml-2">
                  ({filteredPosts.length} {filteredPosts.length === 1 ? "post" : "posts"})
                </span>
              )}
            </h2>
          </div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {formattedFilteredPosts.map((post) => (
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
                  <div
                    className="text-sm text-gray-600 mt-2 flex-grow line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                  <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <FaUser className="w-4 h-4" />
                      <span>Uploaded by: {post.author?.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaRegCalendarAlt className="w-4 h-4" />
                      <span>
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Link>
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
      {!hasActiveFilters && (
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
                    <div
                      className="text-sm text-gray-600 mt-2 flex-grow line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                    <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <FaUser className="w-4 h-4" />
                        <span>Uploaded by: {post.author?.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaRegCalendarAlt className="w-4 h-4" />
                        <span>
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
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
              <Link
                href="/blog/viewall/travel"
                className="text-gold font-semibold hover:text-gold-dark-10 transition-colors duration-300"
              >
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
                    <div
                      className="text-sm text-gray-600 mt-2 flex-grow line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                    <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <FaUser className="w-4 h-4" />
                        <span>Uploaded by: {post.author?.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaRegCalendarAlt className="w-4 h-4" />
                        <span>
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
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
              <Link
                href="/blog/viewall/tips"
                className="text-gold font-semibold hover:text-gold-dark-10 transition-colors duration-300"
              >
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
                    <div
                      className="text-sm text-gray-600 mt-2 flex-grow line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                    <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <FaUser className="w-4 h-4" />
                        <span>Uploaded by: {post.author?.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaRegCalendarAlt className="w-4 h-4" />
                        <span>
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </motion.div>
          </motion.div>

          {/* Trips Section */}
          <motion.div
            className="traveling-trips py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Trips</h2>
              <Link
                href="/blog/viewall/trips"
                className="text-gold font-semibold hover:text-gold-dark-10 transition-colors duration-300"
              >
                View All
              </Link>
            </div>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {formattedTripsPosts.map((post) => (
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
                    <div
                      className="text-sm text-gray-600 mt-2 flex-grow line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                    <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <FaUser className="w-4 h-4" />
                        <span>Uploaded by: {post.author?.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaRegCalendarAlt className="w-4 h-4" />
                        <span>
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </motion.div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default BlogContent;
