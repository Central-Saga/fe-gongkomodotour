import Image from "next/image";

export default function Testimonials() {
  const testimonials = [
    {
      name: "John Doe",
      comment:
        "Amazing experience! The guides were very knowledgeable and the scenery was breathtaking.",
      image: "/img/testimonial1.jpg",
    },
    {
      name: "Jane Smith",
      comment:
        "Highly recommend this tour. The service was excellent and the price was fair.",
      image: "/img/testimonial2.jpg",
    },
    {
      name: "Mike Johnson",
      comment:
        "Best trip ever! The team made sure everything was perfect from start to finish.",
      image: "/img/testimonial3.jpg",
    },
  ];

  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Testimonials</h2>
          <p className="text-gray-600 mt-2">What Our Customers Say</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 shadow-md rounded-lg">
              <div className="flex items-center mb-4">
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  width={50}
                  height={50}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <h3 className="text-lg font-semibold text-gray-800">{testimonial.name}</h3>
              </div>
              <p className="text-gray-600">{testimonial.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}