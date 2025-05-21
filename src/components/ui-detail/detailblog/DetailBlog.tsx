import React from "react";
import { BlogPost, blogPosts } from "@/components/ui-blog/data-blog/blogpost";
import { FaUser, FaRegCalendarAlt, FaTag } from "react-icons/fa";

interface DetailBlogProps {
  blog: BlogPost | null | undefined;
}

const DetailBlogUI: React.FC<DetailBlogProps> = ({ blog }) => {
  if (!blog) {
    return <div className="text-center py-16">Blog not found.</div>;
  }

  const latestPosts = blogPosts.slice(0, 3); // Get the latest 3 posts

  return (
    <div className="detail-blog px-4 md:px-16 lg:px-24 py-12">
      {/* Judul dan Gambar Utama */}
      <h1 className="text-4xl font-bold mb-6">{blog.title}</h1>
      <img
        src={blog.image}
        alt={blog.title}
        className="w-full h-96 object-cover rounded-md mb-6"
      />
      <div className="text-gray-600 mb-4 flex items-center space-x-4">
        <span className="flex items-center space-x-2">
          <FaUser className="w-4 h-4" /> <span>Upload By {blog.author}</span>
        </span>
        <span className="flex items-center space-x-2">
          <FaRegCalendarAlt className="w-4 h-4" /> <span>{blog.date}</span>
        </span>
        <span className="flex items-center space-x-2">
          <FaTag className="w-4 h-4" /> <span>{blog.category}</span>
        </span>
      </div>
      <p className="text-lg text-gray-800 mb-12">{blog.description}</p>

      {/* Sub-Gambar, Sub-Judul, dan Sub-Deskripsi */}
      {blog.subTitle && (
        <div className="sub-section py-5 border-t border-gray-200">
          <h2 className="text-2xl font-bold mb-4">{blog.subTitle}</h2>
          {blog.subDescription && (
            <p className="text-lg text-gray-800 mb-6">{blog.subDescription}</p>
          )}
        </div>
      )}
      {blog.subTitle && (
        <div className="sub-section py-12 border-t border-gray-200">
          <h2 className="text-2xl font-bold mb-4">{blog.subTitle}</h2>
          {blog.subDescription && (
            <p className="text-lg text-gray-800 ">{blog.subDescription}</p>
          )}
        </div>
      )}

      {/* Latest Posts */}
      <h2 className="text-2xl font-bold mb-4">Latest Post Article</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {latestPosts.map((post) => (
          <a
            key={post.id}
            href={`/detail-blog?id=${post.id}`}
            className="group"
          >
            <div className="latest-post-card p-4 border rounded-md shadow-lg flex flex-col h-full cursor-pointer transition-transform duration-300 group-hover:scale-105">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-40 object-cover object-center rounded-md mb-4"
              />
              <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
              <p className="text-sm text-gray-800 flex-grow">
                {post.description.slice(0, 100)}...
              </p>
              <div className="text-gray-600 text-sm mt-auto flex justify-between items-center">
                <span className="flex items-center space-x-1">
                  <FaUser className="w-4 h-4" />
                  <span>{post.author}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <FaRegCalendarAlt className="w-4 h-4" />
                  <span>{post.date}</span>
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default DetailBlogUI;
