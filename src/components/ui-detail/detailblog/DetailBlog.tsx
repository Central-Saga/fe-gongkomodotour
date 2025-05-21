import React, { useEffect, useState } from "react";
import { FaUser, FaRegCalendarAlt, FaTag } from "react-icons/fa";
import { apiRequest } from "@/lib/api";
import { Blog } from "@/types/blog";

interface DetailBlogProps {
  blogId: string;
}

const DetailBlog: React.FC<DetailBlogProps> = ({ blogId }) => {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogDetails = async () => {
      try {
        const response = await apiRequest<{ data: Blog }>(
          "GET",
          `/api/landing-page/blogs/${blogId}`
        );
        setBlog(response.data);
      } catch (err) {
        console.error("Error fetching blog details:", err);
        setError("Failed to fetch blog details.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogDetails();
  }, [blogId]);

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
      <h1 className="text-4xl font-bold mb-6">{blog.title}</h1>
      <img
        src={blog.assets?.[0]?.file_url || "/img/placeholder-image.png"}
        alt={blog.title}
        className="w-full h-96 object-cover rounded-md mb-6"
      />
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
      <p className="text-lg text-gray-800 mb-12">{blog.content}</p>
    </div>
  );
};

export default DetailBlog;
