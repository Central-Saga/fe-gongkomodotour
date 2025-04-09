"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { blogPosts } from "@/components/ui-blog/data-blog/blogpost";
import DetailBlogUI from "@/components/ui-detail/detailblog/DetailBlog";

const DetailBlog = () => {
  const searchParams = useSearchParams();
  const blogId = searchParams.get("id");
  const blog = blogPosts.find((post) => post.id === Number(blogId)) || null;

  return <DetailBlogUI blog={blog} />;
};

export default DetailBlog;
