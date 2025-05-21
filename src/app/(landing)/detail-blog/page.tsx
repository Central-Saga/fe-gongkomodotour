"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import DetailBlog from "@/components/ui-detail/detailblog/DetailBlog";

const DetailBlogPage = () => {
  const searchParams = useSearchParams();
  const blogId = searchParams.get("id");

  if (!blogId) {
    return <div className="text-center py-16">Blog ID is missing.</div>;
  }

  return <DetailBlog blogId={blogId} />;
};

export default DetailBlogPage;
