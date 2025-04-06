import React from "react";
import { blogPosts } from "@/components/ui-blog/data-blog/blogpost";

const ViewAllCategory = ({ params }: { params: { category: string } }) => {
  // Filter artikel berdasarkan kategori
  const filteredPosts = blogPosts.filter((post) => post.category === params.category);

  return (
    <div className="view-all-page px-4 md:px-16 lg:px-24 py-12">
      <h1 className="text-3xl font-bold mb-6 capitalize">{params.category.replace("-", " ")} Articles</h1>
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div key={post.id} className="post-card border rounded-lg shadow-md p-4 flex flex-col h-full">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-48 object-cover rounded-md"
              />
              <h3 className="text-lg font-semibold mt-4">{post.title}</h3>
              <p className="text-sm text-gray-600 mt-2 flex-grow">{post.description}</p>
              <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <span>Uploaded by: {post.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>{post.date}</span>
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