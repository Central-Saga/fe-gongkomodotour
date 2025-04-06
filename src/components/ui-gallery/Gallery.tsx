import React from "react";

interface GalleryItem {
  image: string;
  title: string;
}

interface GalleryProps {
  data: GalleryItem[];
}

const Gallery: React.FC<GalleryProps> = ({ data }) => {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-6 pb-10">
      {data.map((item, index) => (
        <div
          key={index}
          className="relative bg-white rounded-lg shadow-md overflow-hidden"
        >
          {/* Gambar */}
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-50 object-cover" // Tinggi gambar diatur menjadi lebih kecil
          />
          {/* Judul */}
          <div className="absolute bottom-0 left-1/4 w-1/2 bg-yellow-500 text-white text-center py-1 rounded-t-lg">
            {item.title}
          </div>
        </div>
      ))}
    </section>
  );
};

export default Gallery;