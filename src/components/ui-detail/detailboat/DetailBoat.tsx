const DetailBoatUI: React.FC<DetailBoatProps> = ({ boat }) => {
  if (!boat) {
    return <div className="text-center py-16">Boat not found.</div>;
  }

  return (
    <div className="detail-boat px-4 md:px-8 lg:px-12 py-8">
      <h1 className="text-3xl font-semibold mb-4">{boat.name}</h1>
      <img
        src={boat.image}
        alt={boat.name}
        className="w-full h-80 object-cover rounded-md mb-4"
      />
      <div className="text-gray-600 mb-2 text-sm">
        <span>Category: {boat.category}</span>
      </div>
      <p className="text-sm text-gray-800 mb-8">{boat.description}</p>
    </div>
  );
};