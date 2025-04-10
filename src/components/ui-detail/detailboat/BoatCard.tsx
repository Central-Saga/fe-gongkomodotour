const BoatCard: React.FC<BoatCardProps> = ({ boat }) => {
  return (
    <div className="boat-card p-2 border rounded-md">
      <img
        src={boat.image}
        alt={boat.name}
        className="w-full h-40 object-cover rounded-md mb-2"
      />
      <h3 className="text-base font-medium mb-1">{boat.name}</h3>
      <p className="text-xs text-gray-600">{boat.description.slice(0, 50)}...</p>
    </div>
  );
};