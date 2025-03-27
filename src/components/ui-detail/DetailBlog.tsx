// components/ui-detail/DetailBlog.tsx
import Image from "next/image";
import Link from "next/link";

// Definisikan tipe untuk data artikel
interface BlogPost {
  title: string;
  image: string;
  slug: string;
}

// Definisikan tipe untuk props komponen
interface DetailBlogProps {
  posts: BlogPost[];
}

export default function DetailBlog({ posts }: DetailBlogProps) {
  return (
    <section className="py-12 px-4 md:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Latest Post</h2>
        <div className="space-y-4">
          {posts.map((post, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4"
            >
              <Image
                src={post.image}
                alt={post.title}
                width={96}
                height={96}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">{post.title}</h3>
                <Link href={`/blog/${post.slug}`}>
                  <span className="text-sm text-blue-500 hover:underline">Read More</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}