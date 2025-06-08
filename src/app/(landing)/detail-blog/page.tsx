"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DetailBlog from "@/components/ui-detail/detailblog/DetailBlog";

const DetailBlogContent = () => {
  const searchParams = useSearchParams();
  const blogId = searchParams.get("id");

  if (!blogId) {
    return <div className="text-center py-16">Blog ID is missing.</div>;
  }

  return <DetailBlog blogId={blogId} />;
};

const DetailBlogPage = () => {
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

export default DetailBlogPage;
