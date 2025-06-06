import Image from 'next/image';

interface DetailBoatProps {
  boat: {
    name: string;
    image: string;
    category: string;
    description: string;
  };
}

const DetailBoatUI: React.FC<DetailBoatProps> = ({ boat }) => {
  if (!boat) {
    return <div className="text-center py-16">Boat not found.</div>;
  }

  return (
    <div className="detail-boat px-4 md:px-8 lg:px-12 py-8">
      <h1 className="text-3xl font-semibold mb-4">{boat.name}</h1>
      <div className="relative w-full h-80 mb-4">
        <Image
          src={boat.image}
          alt={boat.name}
          fill
          className="object-cover rounded-md"
        />
      </div>
      <div className="text-gray-600 mb-2 text-sm">
        <span>Category: {boat.category}</span>
      </div>
      <p className="text-sm text-gray-800 mb-8">{boat.description}</p>
    </div>
  );
};

export default DetailBoatUI;