import React from "react";
import { blogPosts } from "@/components/ui-blog/data-blog/blogpost";
import { FaUser, FaRegCalendarAlt } from "react-icons/fa"; // Import ikon dari React Icons
import Link from "next/link";

const BlogContent = () => {
  return (
    <div className="blog-content px-4 md:px-16 lg:px-24">
      {/* Header Section */}
      <div
        className="blog-header bg-cover bg-center text-center py-16 w-screen -mx-4 md:-mx-16 lg:-mx-24 h-96"
        style={{ backgroundImage: "url('/img/boat/bg-boat-dlx-mv.jpg')" }}
      >
        <h1 className="text-4xl font-bold text-[#ffffff]">Blog</h1>
        <div className="search-bar mt-8 flex justify-center gap-4 bg-[#f5f5f5] p-6 rounded-md shadow-md items-center w-full max-w-7xl mx-auto">
          <input
            type="text"
            placeholder="Search Article"
            className="p-3 border border-[#403d3d] rounded-md w-full md:w-1/3 focus:outline-none"
          />
          <select className="p-3 border border-[#403d3d] rounded-md w-full md:w-1/3 focus:outline-none">
            <option>Category</option>
            <option>Travel</option>
            <option>Tips</option>
          </select>
          <button className="p-3 bg-yellow-500 text-white rounded-md w-full md:w-auto md:px-6 focus:outline-none active:opacity-100">
            Search
          </button>
        </div>
      </div>

      {/* Latest Post Section */}
      <div className="latest-post py-12">
        <h2 className="text-2xl font-bold mb-6">Latest Post</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogPosts.slice(0, 3).map((post) => (
            <div
              key={post.id}
              className="post-card border rounded-lg shadow-md p-4 flex flex-col h-full"
            >
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-48 object-cover rounded-md"
              />
              <Link href={`/detail-blog?id=${post.id}`}>
                <h3 className="text-lg font-semibold mt-4 hover:text-yellow-500">
                  {post.title}
                </h3>
              </Link>
              <Link href={`/detail-blog?id=${post.id}`}>
                <p className="text-sm text-gray-600 mt-2 flex-grow hover:text-yellow-500">
                  {post.description.slice(0, 100)}...
                </p>
              </Link>
              <div className="flex justify-between items-center mt-auto text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <FaUser className="w-4 h-4" />
                  <span>Uploaded by: {post.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaRegCalendarAlt className="w-4 h-4" />
                  <span>{post.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visiting Flores Section */}
      <div className="visiting-flores py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Visiting Flores</h2>
          <Link
            href="/blog/viewall/visiting-flores"
            className="text-yellow-500 font-semibold"
          >
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogPosts
            .filter((post) => post.category === "visiting-flores")
            .slice(0, 3)
            .map((post) => (
              <div
                key={post.id}
                className="post-card border rounded-lg shadow-md p-4 flex flex-col h-full"
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover rounded-md"
                />
                <Link href={`/detail-blog?id=${post.id}`}>
                  <h3 className="text-lg font-semibold mt-4 hover:text-yellow-500">
                    {post.title}
                  </h3>
                </Link>
                <Link href={`/detail-blog?id=${post.id}`}>
                  <p className="text-sm text-gray-600 mt-2 flex-grow hover:text-yellow-500">
                    {post.description.slice(0, 100)}...
                  </p>
                </Link>
                <div className="flex justify-between items-center mt-auto text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <FaUser className="w-4 h-4" />
                    <span>Uploaded by: {post.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaRegCalendarAlt className="w-4 h-4" />
                    <span>{post.date}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Traveling Tips Section */}
      <div className="traveling-tips py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Traveling Tips</h2>
          <Link
            href="/blog/viewall/traveling-tips"
            className="text-yellow-500 font-semibold"
          >
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogPosts
            .filter((post) => post.category === "traveling-tips")
            .slice(0, 3)
            .map((post) => (
              <div
                key={post.id}
                className="post-card border rounded-lg shadow-md p-4 flex flex-col h-full"
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover rounded-md"
                />
                <Link href={`/detail-blog?id=${post.id}`}>
                  <h3 className="text-lg font-semibold mt-4 hover:text-yellow-500">
                    {post.title}
                  </h3>
                </Link>
                <Link href={`/detail-blog?id=${post.id}`}>
                  <p className="text-sm text-gray-600 mt-2 flex-grow hover:text-yellow-500">
                    {post.description.slice(0, 100)}...
                  </p>
                </Link>
                <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <FaUser className="w-4 h-4" />
                    <span>Uploaded by: {post.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaRegCalendarAlt className="w-4 h-4" />
                    <span>{post.date}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default BlogContent;
