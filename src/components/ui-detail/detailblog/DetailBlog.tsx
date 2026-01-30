import React, { useEffect, useState } from "react";
import { FaUser, FaRegCalendarAlt, FaTag } from "react-icons/fa";
import { apiRequest } from "@/lib/api";
import { Blog } from "@/types/blog";
import Image from "next/image";
import Link from "next/link";
import { cleanHtmlContent, stripHtmlTags } from "@/lib/htmlUtils";

interface DetailBlogProps {
  blogId: string;
}

const getImageUrl = (fileUrl?: string) => {
  if (!fileUrl) return "/img/placeholder-image.png";
  return fileUrl.startsWith("http")
    ? fileUrl
    : `${process.env.NEXT_PUBLIC_API_URL}${fileUrl}`;
};

const DetailBlog: React.FC<DetailBlogProps> = ({ blogId }) => {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latestPosts, setLatestPosts] = useState<Blog[]>([]);

  useEffect(() => {
    const fetchBlogDetails = async () => {
      try {
        const response = await apiRequest<{ data: Blog }>(
          "GET",
          `/api/landing-page/blogs/${blogId}`
        );
        if (response.data?.status === "draft") {
          setError("Artikel tidak tersedia.");
          setBlog(null);
          return;
        }
        const cleanedBlog = {
          ...response.data,
          content: cleanHtmlContent(response.data.content),
        };
        setBlog(cleanedBlog);
      } catch (err) {
        console.error("Error fetching blog details:", err);
        setError("Failed to fetch blog details.");
      } finally {
        setLoading(false);
      }
    };

    const fetchLatestPosts = async () => {
      try {
        const response = await apiRequest<{ data: Blog[] }>(
          "GET",
          "/api/landing-page/blogs?status=1"
        );
        const posts = Array.isArray(response.data) ? response.data : [];
        const publishedOnly = posts.filter((p) => p.status === "published");
        const sortedPosts = publishedOnly
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
          .slice(0, 3)
          .map((post) => ({
            ...post,
            content: cleanHtmlContent(post.content),
          }));
        setLatestPosts(sortedPosts);
      } catch (error) {
        console.error("Error fetching latest posts:", error);
      }
    };

    fetchBlogDetails();
    fetchLatestPosts();
  }, [blogId]);

  const latestPostsToShow = latestPosts.slice(0, 3); // Get the latest 3 posts

  if (loading) {
    return <div className="text-center py-16">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-16 text-red-500">{error}</div>;
  }

  if (!blog) {
    return <div className="text-center py-16">Blog not found.</div>;
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
        <h1 className="text-4xl font-bold">{blog.title}</h1>
      </div>
      <div className="relative w-full h-96 mb-6">
        <Image
          src={getImageUrl(blog.assets?.[0]?.file_url)}
          alt={blog.title}
          fill
          className="object-cover rounded-md"
        />
      </div>
      <div className="text-gray-600 mb-4 flex items-center space-x-4">
        <span className="flex items-center space-x-2">
          <FaUser className="w-4 h-4" />{" "}
          <span>{blog.author?.name || "Unknown"}</span>
        </span>
        <span className="flex items-center space-x-2">
          <FaRegCalendarAlt className="w-4 h-4" />{" "}
          <span>{new Date(blog.created_at).toLocaleDateString()}</span>
        </span>
        <span className="flex items-center space-x-2">
          <FaTag className="w-4 h-4" />{" "}
          <span>{blog.category || "General"}</span>
        </span>
      </div>
      <div
        className="text-lg text-gray-800 mb-12"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />

      {/* Latest Posts Section */}
      <h2 className="text-2xl font-bold mb-4">Latest Post Article</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {latestPostsToShow.map((post) => (
          <a
            key={post.id}
            href={`/detail-blog?id=${post.id}`}
            className="group"
          >
            <div className="latest-post-card p-4 border rounded-md shadow-lg flex flex-col h-full cursor-pointer transition-transform duration-300 group-hover:scale-105">
              <div className="relative w-full h-40 mb-4">
                <Image
                  src={getImageUrl(post.assets?.[0]?.file_url)}
                  alt={post.title}
                  fill
                  className="object-cover object-center rounded-md"
                />
              </div>
              <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
              <div 
                className="text-sm text-gray-800 flex-grow line-clamp-3"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
              <div className="text-gray-600 text-sm mt-auto flex justify-between items-center">
                <span className="flex items-center space-x-1">
                  <FaUser className="w-4 h-4" />
                  <span>{post.author?.name || "Unknown"}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <FaRegCalendarAlt className="w-4 h-4" />
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default DetailBlog;
