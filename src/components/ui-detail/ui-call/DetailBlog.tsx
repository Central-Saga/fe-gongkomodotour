import Image from "next/image";
import Link from "next/link";

interface BlogPost {
  title: string;
  image: string;
  slug: string;
}

interface DetailBlogProps {
  posts: BlogPost[];
}

export default function DetailBlog({ posts }: DetailBlogProps) {
  return (
    <section className="pt-12 px-4 md:px-8 bg-white h-[545px] rounded-2xl shadow-xl">
      <div className="max-w-6xl mx-auto h-full flex flex-col">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Latest Post</h2>
        <div className="flex-1 overflow-y-auto space-y-4 pb-4 scrollbar-hide">
          {posts.map((post, index) => (
            <div
              key={index}
              className="bg-[#f5f5f5] p-4 rounded-lg shadow-md flex items-center space-x-4"
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