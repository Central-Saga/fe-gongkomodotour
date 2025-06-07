"use client";

import React from "react";
import Image from "next/image";
import { apiRequest } from "@/lib/api";
import { Blog } from "@/types/blog";
import { useParams } from "next/navigation";

const ViewAllCategory = () => {
  const params = useParams();
  const [blogs, setBlogs] = React.useState<Blog[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await apiRequest<Blog[]>("GET", `/api/blogs?category=${params.category}`);
        setBlogs(response);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [params.category]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="view-all-page px-4 md:px-16 lg:px-24 py-12">
      <h1 className="text-3xl font-bold mb-6 capitalize">{String(params.category).replace("-", " ")} Articles</h1>
      {blogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogs.map((post) => (
            <div key={post.id} className="post-card border rounded-lg shadow-md p-4 flex flex-col h-full">
              {post.assets?.[0] && (
                <div className="relative w-full h-48">
                  <Image
                    src={post.assets[0].file_url}
                    alt={post.title}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
              )}
              <h3 className="text-lg font-semibold mt-4">{post.title}</h3>
              <p className="text-sm text-gray-600 mt-2 flex-grow line-clamp-3">{post.content}</p>
              <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <span>Uploaded by: {post.author.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No articles found for this category.</p>
      )}
    </div>
  );
};

export default ViewAllCategory;