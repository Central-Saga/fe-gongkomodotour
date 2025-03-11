// src/app/(landing)/page.tsx
export default function Home() {
  return (
    <div className="py-10">
      <h1 className="text-4xl font-bold text-center mb-6">
        Welcome to Gong Komodo Tour & Travel
      </h1>
      <p className="text-center text-lg text-gray-600 mb-8">
        Explore the best tours and travel experiences with us!
      </p>
      <div className="text-center">
        <p className="text-gray-700">
          Use the navigation above to explore our packages, gallery, blog, and more.
        </p>
      </div>
    </div>
  );
}