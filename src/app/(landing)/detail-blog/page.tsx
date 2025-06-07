"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { blogPosts } from "@/components/ui-blog/data-blog/blogpost";
import DetailBlogUI from "@/components/ui-detail/detailblog/DetailBlog";

const DetailBlogContent = () => {
  const searchParams = useSearchParams();
  const blogId = searchParams.get("id");
  const blog = blogPosts.find((post) => post.id === Number(blogId)) || null;

  return <DetailBlogUI blog={blog} />;
};

const DetailBlog = () => {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    }>
      <DetailBlogContent />
    </Suspense>
  );
};

export default DetailBlog;
