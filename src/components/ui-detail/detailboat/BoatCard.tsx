import Image from "next/image"

interface BoatCardProps {
  image: string;
  name: string;
  description: string;
}

export default function BoatCard({ image, name, description }: BoatCardProps) {
  return (
    <div className="boat-card border rounded-lg shadow-md overflow-hidden">
      <div className="relative w-full h-[200px]">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{name}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}