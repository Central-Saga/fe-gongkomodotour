"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { FaChevronDown, FaUsers, FaBed, FaBath } from "react-icons/fa";

// Tambahkan tipe untuk properti boatImages
interface BoatImage {
  image: string;
  title: string;
}

interface DetailBoatProps {
  boatImages: BoatImage[];
}

const boatData = {
  title: "Luxury Phinisi Boat",
  mainImage: "/img/boat/boat-alf.jpg",
  images: [
    "/img/boat/boat-alf.jpg",
    "/img/boat/boat-alf.jpg",
    "/img/boat/boat-alf.jpg",
    "/img/boat/boat-alf.jpg",
    "/img/boat/boat-alf.jpg",
  ],
  specifications: [
    { label: "Length", value: "32 meters" },
    { label: "Beam", value: "8 meters" },
    { label: "Cruising Speed", value: "7-11 knots" },
    { label: "Fresh Water Capacity", value: "13,000 liters" },
    { label: "Fuel Capacity", value: "8,000 liters" },
    { label: "Engine", value: "Mitsubishi 8DC9" },
    { label: "Generator", value: "Double PSI20" },
    { label: "Navigation", value: "Compass, Radar, AIS, GPS, Map" },
    { label: "Radio", value: "VHF" },
    { label: "Capacity", value: "20-25 persons" },
  ],
  facilities: [
    "Front sundeck area",
    "Top sun deck area",
    "Sun chair",
    "Bean bag",
    "Snorkeling equipment",
    "Karaoke set",
    "Bluetooth sound system",
    "TV",
    "Fridge",
    "Dispenser",
    "Large Jacuzzi",
    "Comfort cabin with AC",
    "Meals during the trip",
    "Coffee, tea, mineral water",
    "Bar",
  ],
  cabinInformation:
    "Each of the 8 cabins are equipped with AC & ensuite bathroom:\n\n" +
    "- Royal Suite Cabin: Queen bed + 2 extra beds (4 persons)\n" +
    "- Signature Cabin 1: Queen bed + extra bed (3 persons)\n" +
    "- Signature Cabin 2: Queen bed + extra bed (3 persons)\n" +
    "- Deluxe Cabin 1: Queen bed + extra bed (3 persons)\n" +
    "- Deluxe Cabin 2: Queen bed + extra bed (3 persons)\n" +
    "- Superior Cabin 1: Queen bed + extra bed (3 persons)\n" +
    "- Superior Cabin 2: Queen bed + extra bed (3 persons)",
  cabinPictures: [
    {
      title: "Royal Suite Cabin",
      images: [
        "/img/boat/boat-zm.jpg",
        "/img/boat/boat-zm.jpg",
        "/img/boat/boat-zm.jpg",
      ],
      description:
        "2-4 Person | Queen Bed + Extra Bed + Private Balcony | Private Bathroom",
      prices: [
        { label: "Add Person", price: "IDR 8.950.000/pax" },
        { label: "Min 2 Pax", price: "IDR 8.950.000/pax" },
      ],
    },
    {
      title: "Deluxe Cabin",
      images: [
        "/img/boat/boat-zm.jpg",
        "/img/boat/boat-zm.jpg",
        "/img/boat/boat-zm.jpg",
      ],
      description: "2-3 Person | Queen Bed + Extra Bed | Private Bathroom",
      prices: [
        { label: "Add Person", price: "IDR 7.500.000/pax" },
        { label: "Min 2 Pax", price: "IDR 7.500.000/pax" },
      ],
    },
    {
      title: "Superior Cabin",
      images: [
        "/img/boat/boat-zm.jpg",
        "/img/boat/boat-zm.jpg",
        "/img/boat/boat-zm.jpg",
      ],
      description: "2-3 Person | Queen Bed + Extra Bed | Private Bathroom",
      prices: [
        { label: "Add Person", price: "IDR 6.500.000/pax" },
        { label: "Min 2 Pax", price: "IDR 6.500.000/pax" },
      ],
    },
    {
      title: "Superior Cabin",
      images: [
        "/img/boat/boat-zm.jpg",
        "/img/boat/boat-zm.jpg",
        "/img/boat/boat-zm.jpg",
      ],
      description: "2-3 Person | Queen Bed + Extra Bed | Private Bathroom",
      prices: [
        { label: "Add Person", price: "IDR 6.500.000/pax" },
        { label: "Min 2 Pax", price: "IDR 6.500.000/pax" },
      ],
    },
  ],
};

export default function DetailBoat({ boatImages }: DetailBoatProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isMoreInfoOpen, setIsMoreInfoOpen] = useState(false);

  const handleAccordionToggle = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="py-4 px-3 max-w-6xl mx-auto">
      {/* Section 1: Gambar Utama dan Gambar Kecil */}
      <div className="relative mb-6">
        {/* Gambar Utama */}
        <Dialog
          open={!!selectedImage}
          onOpenChange={() => setSelectedImage(null)}
        >
          <DialogTrigger asChild>
            <div className="relative h-[200px] md:h-[370px] w-full cursor-pointer rounded-lg overflow-hidden shadow-md">
              <Image
                src={boatData.mainImage}
                alt={boatData.title}
                fill
                className="object-cover"
                quality={100}
                onClick={() => setSelectedImage(boatData.mainImage)}
              />
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogTitle>{boatData.title}</DialogTitle>
            {selectedImage && (
              <Image
                src={selectedImage}
                alt="Selected Image"
                width={800}
                height={600}
                className="rounded-lg object-cover"
                quality={100}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Gambar Kecil */}
        <div className="flex gap-2 mt-3 justify-center">
          {boatData.images.slice(0, 3).map((image, index) => (
            <Dialog
              key={index}
              open={!!selectedImage}
              onOpenChange={() => setSelectedImage(null)}
            >
              <DialogTrigger asChild>
                <div
                  className="relative h-[70px] w-[100px] md:h-[90px] md:w-[130px] cursor-pointer rounded-lg overflow-hidden shadow-sm"
                  onClick={() => setSelectedImage(image)}
                >
                  <Image
                    src={image}
                    alt={`${boatData.title} ${index + 1}`}
                    fill
                    className="object-cover"
                    quality={100}
                  />
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogTitle>{`Image ${index + 1}`}</DialogTitle>
                {selectedImage && (
                  <Image
                    src={selectedImage}
                    alt={`Image ${index + 1}`}
                    width={800}
                    height={600}
                    className="rounded-lg object-cover"
                    quality={100}
                  />
                )}
              </DialogContent>
            </Dialog>
          ))}

          {/* Gambar ke-4 dengan More Info */}
          <Dialog open={isMoreInfoOpen} onOpenChange={setIsMoreInfoOpen}>
            <DialogTrigger asChild>
              <div className="relative h-[70px] w-[100px] md:h-[90px] md:w-[130px] cursor-pointer rounded-lg overflow-hidden shadow-sm flex items-center justify-center bg-gray-200">
                <Image
                  src={boatData.images[3]}
                  alt="More Info"
                  fill
                  className="object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <p className="text-white font-semibold">More Info</p>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogTitle>More Images</DialogTitle>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {boatData.images.slice(4).map((image, index) => (
                  <div
                    key={index}
                    className="relative h-[150px] md:h-[200px] w-full cursor-pointer rounded-lg overflow-hidden shadow-sm"
                  >
                    <Image
                      src={image}
                      alt={`More Image ${index + 1}`}
                      fill
                      className="object-cover"
                      quality={100}
                    />
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Section 2: Judul */}
      <div className="text-center mb-6 bg-[#f8f9fa] p-3 rounded-lg shadow-sm">
        <h1 className="text-sm md:text-xl font-bold text-gray-800">
          {boatData.title}
        </h1>
      </div>

      {/* Section 3: Fasilitas dan Spesifikasi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Spesifikasi */}
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3">
            Boat Specification
          </h2>
          <ul className="space-y-1 text-xs md:text-sm">
            {boatData.specifications.map((spec, index) => (
              <li key={index} className="flex justify-between text-gray-600">
                <span className="font-semibold">{spec.label}:</span>
                <span>{spec.value}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Fasilitas */}
        <div className="md:col-span-2 bg-white p-3 rounded-lg shadow-sm">
          <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3">
            Facilities
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 text-xs md:text-sm text-gray-600">
            {boatData.facilities.map((facility, index) => (
              <li key={index} className="list-disc list-inside">
                {facility}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Section 4: Cabin Information */}
      <div className="bg-white p-3 rounded-lg shadow-sm mb-6">
        <h2 className="text-base md:text-lg font-bold text-gray-800 mb-3">
          Cabin Information
        </h2>
        <p className="text-xs md:text-sm text-gray-600 whitespace-pre-line">
          {boatData.cabinInformation}
        </p>
      </div>

      {/* Section 5: Picture of Cabin */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <h2 className="text-center text-xs md:text-sm font-bold text-gray-800 mb-3">
          Picture of Cabin
        </h2>
        <Accordion type="single" collapsible className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bagian Kiri */}
            <div className="space-y-3">
              {boatData.cabinPictures.slice(0, 2).map((cabin, index) => (
                <AccordionItem key={index} value={`cabin-left-${index}`}>
                  <AccordionTrigger className="flex justify-between items-center bg-[#f8f9fa] p-2 rounded-lg shadow-sm">
                    <div>
                      <h3 className="p-2 text-xs md:text-sm font-bold text-gray-800">
                        {cabin.title}
                      </h3>
                    </div>
                    <FaChevronDown className="w-4 h-4 md:w-5 md:h-5 text-white transition-transform duration-300 rounded-full p-1 bg-yellow-500 data-[state=open]:rotate-180" />
                  </AccordionTrigger>
                  <AccordionContent className="p-2 bg-white rounded-lg shadow-sm">
                    {/* Konten Kabin */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Gambar */}
                      <div className="relative h-[150px] md:h-[200px] w-full grid grid-rows-2">
                        <div className="relative row-span-1 h-full">
                          <Image
                            src={cabin.images[0]}
                            alt={`${cabin.title} Main`}
                            fill
                            className="rounded-t-lg object-cover"
                          />
                        </div>
                        <div className="grid grid-cols-2 row-span-1 h-full">
                          <div className="relative h-full">
                            <Image
                              src={cabin.images[1]}
                              alt={`${cabin.title} Additional 1`}
                              fill
                              className="rounded-bl-lg object-cover"
                            />
                          </div>
                          <div className="relative h-full">
                            <Image
                              src={cabin.images[2]}
                              alt={`${cabin.title} Additional 2`}
                              fill
                              className="rounded-br-lg object-cover"
                            />
                          </div>
                        </div>
                      </div>
                      {/* Informasi */}
                      <div className="flex flex-col justify-center space-y-2">
                        <div className="flex items-center space-x-2">
                          <FaUsers className="text-gray-600" />
                          <p className="text-[10px] md:text-xs text-gray-600">
                            <strong>Capacity:</strong> 2-4 Person
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FaBed className="text-gray-600" />
                          <p className="text-[10px] md:text-xs text-gray-600">
                            <strong>Features:</strong> Queen Bed + Extra Bed +
                            Private Balcony
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FaBath className="text-gray-600" />
                          <p className="text-[10px] md:text-xs text-gray-600">
                            <strong>Bathroom:</strong> Private Bathroom
                          </p>
                        </div>
                        {/* Badge */}
                        <div className="flex flex-col space-y-1">
                          {cabin.prices.map((price, priceIndex) => (
                            <div
                              key={priceIndex}
                              className="flex items-center space-x-3"
                            >
                              <div
                                className={`px-2 py-1 rounded-lg text-[10px] md:text-xs font-semibold flex items-center space-x-2 ${
                                  price.label === "Add Person"
                                    ? "bg-yellow-500 text-white"
                                    : "bg-gray-200 text-gray-800"
                                }`}
                              >
                                <FaUsers
                                  className={
                                    price.label === "Add Person"
                                      ? "text-white"
                                      : "text-gray-800"
                                  }
                                />
                                <span>{price.label}</span>
                              </div>
                              <p className="text-[10px] md:text-xs text-gray-800 font-semibold">
                                {price.price}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </div>

            {/* Bagian Kanan */}
            <div className="space-y-3">
              {boatData.cabinPictures.slice(2).map((cabin, index) => (
                <AccordionItem key={index + 2} value={`cabin-right-${index}`}>
                  <AccordionTrigger className="flex justify-between items-center bg-[#f8f9fa] p-2 rounded-lg shadow-sm">
                    <div>
                      <h3 className="p-2 text-xs md:text-sm font-bold text-gray-800">
                        {cabin.title}
                      </h3>
                    </div>
                    <FaChevronDown className="w-4 h-4 md:w-5 md:h-5 text-white transition-transform duration-300 rounded-full p-1 bg-yellow-500 data-[state=open]:rotate-180" />
                  </AccordionTrigger>
                  <AccordionContent className="p-2 bg-white rounded-lg shadow-sm">
                    {/* Konten Kabin */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Gambar */}
                      <div className="relative h-[150px] md:h-[200px] w-full grid grid-rows-2">
                        <div className="relative row-span-1 h-full">
                          <Image
                            src={cabin.images[0]}
                            alt={`${cabin.title} Main`}
                            fill
                            className="rounded-t-lg object-cover"
                          />
                        </div>
                        <div className="grid grid-cols-2 row-span-1 h-full">
                          <div className="relative h-full">
                            <Image
                              src={cabin.images[1]}
                              alt={`${cabin.title} Additional 1`}
                              fill
                              className="rounded-bl-lg object-cover"
                            />
                          </div>
                          <div className="relative h-full">
                            <Image
                              src={cabin.images[2]}
                              alt={`${cabin.title} Additional 2`}
                              fill
                              className="rounded-br-lg object-cover"
                            />
                          </div>
                        </div>
                      </div>
                      {/* Informasi */}
                      <div className="flex flex-col justify-center space-y-2">
                        <div className="flex items-center space-x-2">
                          <FaUsers className="text-gray-600" />
                          <p className="text-[10px] md:text-xs text-gray-600">
                            <strong>Capacity:</strong> 2-4 Person
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FaBed className="text-gray-600" />
                          <p className="text-[10px] md:text-xs text-gray-600">
                            <strong>Features:</strong> Queen Bed + Extra Bed +
                            Private Balcony
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FaBath className="text-gray-600" />
                          <p className="text-[10px] md:text-xs text-gray-600">
                            <strong>Bathroom:</strong> Private Bathroom
                          </p>
                        </div>
                        {/* Badge */}
                        <div className="flex flex-col space-y-1">
                          {cabin.prices.map((price, priceIndex) => (
                            <div
                              key={priceIndex}
                              className="flex items-center space-x-3"
                            >
                              <div
                                className={`px-2 py-1 rounded-lg text-[10px] md:text-xs font-semibold flex items-center space-x-2 ${
                                  price.label === "Add Person"
                                    ? "bg-yellow-500 text-white"
                                    : "bg-gray-200 text-gray-800"
                                }`}
                              >
                                <FaUsers
                                  className={
                                    price.label === "Add Person"
                                      ? "text-white"
                                      : "text-gray-800"
                                  }
                                />
                                <span>{price.label}</span>
                              </div>
                              <p className="text-[10px] md:text-xs text-gray-800 font-semibold">
                                {price.price}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </div>
          </div>
        </Accordion>
      </div>

      {/* Section 6: Boat Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {boatImages.map((boat, index) => (
          <div
            key={index}
            className="relative group overflow-hidden rounded-lg shadow-lg cursor-pointer"
          >
            <Image
              src={boat.image}
              alt={boat.title}
              layout="fill"
              objectFit="cover"
              className="rounded-lg transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <p className="text-white font-semibold text-lg">{boat.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
