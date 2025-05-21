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
import { Boat } from "@/types/boats";
import { motion, AnimatePresence } from "framer-motion";

interface DetailBoatProps {
  boat: Boat;
}

export default function DetailBoat({ boat }: DetailBoatProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isMoreInfoOpen, setIsMoreInfoOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<string | undefined>(undefined);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const mainImage = boat.assets[0]?.file_url 
    ? (boat.assets[0].file_url.startsWith('http') 
        ? boat.assets[0].file_url 
        : `${API_URL}${boat.assets[0].file_url}`)
    : "/img/default-image.png";

  const specifications = boat.spesification.split('\n').map(spec => {
    const [label, value] = spec.split(':').map(s => s.trim());
    return { label, value };
  });

  const facilities = boat.facilities.split(',').map(facility => facility.trim());

  const cabinInfo = boat.cabin_information.split('\n').map(cabin => {
    const [type, count] = cabin.split(':').map(s => s.trim());
    return { type, count };
  });

  // Membagi cabin menjadi dua kolom
  const cabinsKiri = boat.cabin.slice(0, Math.ceil(boat.cabin.length / 2));
  const cabinsKanan = boat.cabin.slice(Math.ceil(boat.cabin.length / 2));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2
      }
    }
  };

  const contentVariants = {
    hidden: { 
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3
      }
    },
    visible: { 
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="py-4 px-3 max-w-6xl mx-auto"
    >
      {/* Section 1: Gambar Utama dan Gambar Kecil */}
      <motion.div 
        className="relative mb-6"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Gambar Utama */}
        <Dialog
          open={!!selectedImage}
          onOpenChange={() => setSelectedImage(null)}
        >
          <DialogTrigger asChild>
            <motion.div 
              className="relative h-[200px] md:h-[370px] w-full cursor-pointer rounded-lg overflow-hidden shadow-md"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Image
                src={mainImage}
                alt={boat.boat_name}
                fill
                className="object-cover"
                quality={100}
                onClick={() => setSelectedImage(mainImage)}
              />
            </motion.div>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogTitle className="text-gold">{boat.boat_name}</DialogTitle>
            <AnimatePresence>
              {selectedImage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={selectedImage}
                    alt="Selected Image"
                    width={800}
                    height={600}
                    className="rounded-lg object-cover"
                    quality={100}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </DialogContent>
        </Dialog>

        {/* Gambar Kecil */}
        <motion.div 
          className="flex gap-2 mt-3 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {boat.assets.slice(0, 3).map((asset, index) => (
            <Dialog
              key={index}
              open={!!selectedImage}
              onOpenChange={() => setSelectedImage(null)}
            >
              <DialogTrigger asChild>
                <motion.div
                  className="relative h-[70px] w-[100px] md:h-[90px] md:w-[130px] cursor-pointer rounded-lg overflow-hidden shadow-sm"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  onClick={() => setSelectedImage(asset.file_url.startsWith('http') 
                    ? asset.file_url 
                    : `${API_URL}${asset.file_url}`)}
                >
                  <Image
                    src={asset.file_url.startsWith('http') 
                      ? asset.file_url 
                      : `${API_URL}${asset.file_url}`}
                    alt={`${boat.boat_name} ${index + 1}`}
                    fill
                    className="object-cover"
                    quality={100}
                  />
                </motion.div>
              </DialogTrigger>
            </Dialog>
          ))}

          {/* Gambar ke-4 dengan More Info */}
          <Dialog open={isMoreInfoOpen} onOpenChange={setIsMoreInfoOpen}>
            <DialogTrigger asChild>
              <motion.div 
                className="relative h-[70px] w-[100px] md:h-[90px] md:w-[130px] cursor-pointer rounded-lg overflow-hidden shadow-sm flex items-center justify-center bg-gray-200"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {boat.assets[3] && (
                  <Image
                    src={boat.assets[3].file_url.startsWith('http') 
                      ? boat.assets[3].file_url 
                      : `${API_URL}${boat.assets[3].file_url}`}
                    alt="More Info"
                    fill
                    className="object-cover opacity-50"
                  />
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <p className="text-white font-semibold">More Info</p>
                </div>
              </motion.div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogTitle className="text-gold">All Images</DialogTitle>
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-3 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {boat.assets.map((asset, index) => (
                  <motion.div
                    key={index}
                    className="relative h-[150px] md:h-[200px] w-full cursor-pointer rounded-lg overflow-hidden shadow-sm"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    onClick={() => setSelectedImage(asset.file_url.startsWith('http') 
                      ? asset.file_url 
                      : `${API_URL}${asset.file_url}`)}
                  >
                    <Image
                      src={asset.file_url.startsWith('http') 
                        ? asset.file_url 
                        : `${API_URL}${asset.file_url}`}
                      alt={`Boat Image ${index + 1}`}
                      fill
                      className="object-cover"
                      quality={100}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </DialogContent>
          </Dialog>
        </motion.div>
      </motion.div>

      {/* Section 2: Judul */}
      <motion.div 
        className="text-center mb-6 bg-gold/5 p-3 rounded-lg shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h1 className="text-sm md:text-xl font-bold text-gold">
          {boat.boat_name}
        </h1>
      </motion.div>

      {/* Section 3: Fasilitas dan Spesifikasi */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {/* Spesifikasi */}
        <motion.div 
          className="bg-white p-3 rounded-lg shadow-sm"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h2 className="text-base md:text-lg font-bold text-gold mb-3">
            Boat Specification
          </h2>
          <ul className="space-y-1 text-xs md:text-sm">
            {specifications.map((spec, index) => (
              <motion.li 
                key={index} 
                className="flex justify-between text-gray-600"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <span className="font-semibold">{spec.label}:</span>
                <span>{spec.value}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Fasilitas */}
        <motion.div 
          className="md:col-span-2 bg-white p-3 rounded-lg shadow-sm"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h2 className="text-base md:text-lg font-bold text-gold mb-3">
            Facilities
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 text-xs md:text-sm text-gray-600">
            {facilities.map((facility, index) => (
              <motion.li 
                key={index} 
                className="list-disc list-inside"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                {facility}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </motion.div>

      {/* Section 4: Cabin Information */}
      <motion.div 
        className="bg-white p-3 rounded-lg shadow-sm mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.02 }}
      >
        <h2 className="text-base md:text-lg font-bold text-gold mb-3">
          Cabin Information
        </h2>
        <ul className="space-y-2 text-xs md:text-sm text-gray-600">
          {cabinInfo.map((cabin, index) => (
            <motion.li 
              key={index} 
              className="flex justify-between"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <span className="font-semibold">{cabin.type}:</span>
              <span>{cabin.count}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Section 5: Picture of Cabin */}
      <motion.div
        className="bg-white p-6 rounded-lg shadow-md mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-foreground mb-4">Picture Of Cabin</h2>
          <p className="text-lg text-muted-foreground">Choose your perfect cabin</p>
        </motion.div>

        <Accordion 
          type="single" 
          collapsible 
          className="w-full"
          value={activeIndex}
          onValueChange={setActiveIndex}
        >
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5"
          >
            {/* Kolom Kiri */}
            <motion.div variants={itemVariants} className="space-y-4">
              {cabinsKiri.map((cabin) => (
                <motion.div
                  key={cabin.id}
                  variants={itemVariants}
                  whileHover="hover"
                  className="bg-card rounded-lg shadow-md overflow-hidden"
                >
                  <AccordionItem value={`item-${cabin.id}`}>
                    <AccordionTrigger className="text-lg font-semibold text-foreground flex justify-between items-center p-4 hover:bg-accent/50 transition-colors duration-200">
                      <span>{cabin.cabin_name}</span>
                      <motion.div
                        animate={{ 
                          rotate: activeIndex === `item-${cabin.id}` ? 180 : 0,
                          scale: activeIndex === `item-${cabin.id}` ? 1.1 : 1
                        }}
                        transition={{ duration: 0.3 }}
                        className="bg-gold rounded-full p-1"
                      >
                        <FaChevronDown className="w-6 h-6 text-white" />
                      </motion.div>
                    </AccordionTrigger>
                    <AnimatePresence>
                      {activeIndex === `item-${cabin.id}` && (
                        <motion.div
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          variants={contentVariants}
                        >
                          <AccordionContent className="p-4">
                            <div className="grid grid-cols-2 gap-6">
                              {/* Kolom Kiri - Gambar */}
                              <div className="space-y-0">
                                {/* Gambar Atas - 2 Column Merge */}
                                <div className="relative w-full aspect-[16/9] mb-0">
                                  {cabin.assets[0] && (
                                    <Image
                                      src={cabin.assets[0].file_url.startsWith('http') 
                                        ? cabin.assets[0].file_url 
                                        : `${API_URL}${cabin.assets[0].file_url}`}
                                      alt={cabin.assets[0].title || `Cabin Image Main`}
                                      fill
                                      className="object-cover hover:opacity-90 transition-opacity cursor-pointer"
                                      quality={100}
                                      onClick={() => setSelectedImage(cabin.assets[0].file_url.startsWith('http') 
                                        ? cabin.assets[0].file_url 
                                        : `${API_URL}${cabin.assets[0].file_url}`)}
                                    />
                                  )}
                                </div>
                                {/* Gambar Bawah - 2 Column */}
                                <div className="flex flex-wrap">
                                  {cabin.assets.slice(1, 3).map((asset, index) => (
                                    <motion.div
                                      key={asset.id}
                                      className="relative w-1/2 aspect-square cursor-pointer"
                                      whileHover={{ scale: 1.02, zIndex: 10 }}
                                      transition={{ type: "spring", stiffness: 300 }}
                                      onClick={() => setSelectedImage(asset.file_url.startsWith('http') 
                                        ? asset.file_url 
                                        : `${API_URL}${asset.file_url}`)}
                                    >
                                      <Image
                                        src={asset.file_url.startsWith('http') 
                                          ? asset.file_url 
                                          : `${API_URL}${asset.file_url}`}
                                        alt={asset.title || `Cabin Image ${index + 1}`}
                                        fill
                                        className="object-cover hover:opacity-90 transition-opacity"
                                        quality={100}
                                      />
                                    </motion.div>
                                  ))}
                                </div>
                              </div>

                              {/* Kolom Kanan - Informasi */}
                              <div className="space-y-6">
                                {/* Icons and Info */}
                                <div className="space-y-4">
                                  <div className="flex items-center space-x-2">
                                    <FaUsers className="text-gold text-xl" />
                                    <span className="text-gray-600">{cabin.min_pax}-{cabin.max_pax} Person</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <FaBed className="text-gold text-xl" />
                                    <span className="text-gray-600">{cabin.bed_type}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <FaBath className="text-gold text-xl" />
                                    <span className="text-gray-600">Private Bathroom</span>
                                  </div>
                                </div>

                                {/* Pricing */}
                                <div className="space-y-3">
                                  <motion.div 
                                    className="flex items-center justify-between bg-gold/5 p-4 rounded-lg"
                                    whileHover={{ scale: 1.02 }}
                                  >
                                    <span className="text-gray-600">Add Person</span>
                                    <span className="font-semibold">
                                      IDR {parseInt(cabin.additional_price).toLocaleString('id-ID')}/pax
                                    </span>
                                  </motion.div>
                                  <motion.div 
                                    className="flex items-center justify-between bg-gold/5 p-4 rounded-lg"
                                    whileHover={{ scale: 1.02 }}
                                  >
                                    <span className="text-gray-600">Min {cabin.min_pax} Pax</span>
                                    <span className="font-semibold">
                                      IDR {parseInt(cabin.base_price).toLocaleString('id-ID')}/pax
                                    </span>
                                  </motion.div>
                                </div>
                              </div>
                            </div>
                          </AccordionContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </AccordionItem>
                </motion.div>
              ))}
            </motion.div>

            {/* Kolom Kanan */}
            <motion.div variants={itemVariants} className="space-y-4">
              {cabinsKanan.map((cabin) => (
                <motion.div
                  key={cabin.id}
                  variants={itemVariants}
                  whileHover="hover"
                  className="bg-card rounded-lg shadow-md overflow-hidden"
                >
                  <AccordionItem value={`item-${cabin.id}`}>
                    <AccordionTrigger className="text-lg font-semibold text-foreground flex justify-between items-center p-4 hover:bg-accent/50 transition-colors duration-200">
                      <span>{cabin.cabin_name}</span>
                      <motion.div
                        animate={{ 
                          rotate: activeIndex === `item-${cabin.id}` ? 180 : 0,
                          scale: activeIndex === `item-${cabin.id}` ? 1.1 : 1
                        }}
                        transition={{ duration: 0.3 }}
                        className="bg-gold rounded-full p-1"
                      >
                        <FaChevronDown className="w-6 h-6 text-white" />
                      </motion.div>
                    </AccordionTrigger>
                    <AnimatePresence>
                      {activeIndex === `item-${cabin.id}` && (
                        <motion.div
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          variants={contentVariants}
                        >
                          <AccordionContent className="p-4">
                            <div className="grid grid-cols-2 gap-6">
                              {/* Kolom Kiri - Gambar */}
                              <div className="space-y-0">
                                {/* Gambar Atas - 2 Column Merge */}
                                <div className="relative w-full aspect-[16/9] mb-0">
                                  {cabin.assets[0] && (
                                    <Image
                                      src={cabin.assets[0].file_url.startsWith('http') 
                                        ? cabin.assets[0].file_url 
                                        : `${API_URL}${cabin.assets[0].file_url}`}
                                      alt={cabin.assets[0].title || `Cabin Image Main`}
                                      fill
                                      className="object-cover hover:opacity-90 transition-opacity cursor-pointer"
                                      quality={100}
                                      onClick={() => setSelectedImage(cabin.assets[0].file_url.startsWith('http') 
                                        ? cabin.assets[0].file_url 
                                        : `${API_URL}${cabin.assets[0].file_url}`)}
                                    />
                                  )}
                                </div>
                                {/* Gambar Bawah - 2 Column */}
                                <div className="flex flex-wrap">
                                  {cabin.assets.slice(1, 3).map((asset, index) => (
                                    <motion.div
                                      key={asset.id}
                                      className="relative w-1/2 aspect-square cursor-pointer"
                                      whileHover={{ scale: 1.02, zIndex: 10 }}
                                      transition={{ type: "spring", stiffness: 300 }}
                                      onClick={() => setSelectedImage(asset.file_url.startsWith('http') 
                                        ? asset.file_url 
                                        : `${API_URL}${asset.file_url}`)}
                                    >
                                      <Image
                                        src={asset.file_url.startsWith('http') 
                                          ? asset.file_url 
                                          : `${API_URL}${asset.file_url}`}
                                        alt={asset.title || `Cabin Image ${index + 1}`}
                                        fill
                                        className="object-cover hover:opacity-90 transition-opacity"
                                        quality={100}
                                      />
                                    </motion.div>
                                  ))}
                                </div>
                              </div>

                              {/* Kolom Kanan - Informasi */}
                              <div className="space-y-6">
                                {/* Icons and Info */}
                                <div className="space-y-4">
                                  <div className="flex items-center space-x-2">
                                    <FaUsers className="text-gold text-xl" />
                                    <span className="text-gray-600">{cabin.min_pax}-{cabin.max_pax} Person</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <FaBed className="text-gold text-xl" />
                                    <span className="text-gray-600">{cabin.bed_type}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <FaBath className="text-gold text-xl" />
                                    <span className="text-gray-600">Private Bathroom</span>
                                  </div>
                                </div>

                                {/* Pricing */}
                                <div className="space-y-3">
                                  <motion.div 
                                    className="flex items-center justify-between bg-gold/5 p-4 rounded-lg"
                                    whileHover={{ scale: 1.02 }}
                                  >
                                    <span className="text-gray-600">Add Person</span>
                                    <span className="font-semibold">
                                      IDR {parseInt(cabin.additional_price).toLocaleString('id-ID')}/pax
                                    </span>
                                  </motion.div>
                                  <motion.div 
                                    className="flex items-center justify-between bg-gold/5 p-4 rounded-lg"
                                    whileHover={{ scale: 1.02 }}
                                  >
                                    <span className="text-gray-600">Min {cabin.min_pax} Pax</span>
                                    <span className="font-semibold">
                                      IDR {parseInt(cabin.base_price).toLocaleString('id-ID')}/pax
                                    </span>
                                  </motion.div>
                                </div>
                              </div>
                            </div>
                          </AccordionContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </AccordionItem>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </Accordion>
      </motion.div>

      {/* Image Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogTitle className="text-gold">Cabin Preview</DialogTitle>
          <div className="relative w-full h-[60vh]">
            {selectedImage && (
              <Image
                src={selectedImage}
                alt="Cabin Preview"
                fill
                className="object-contain"
                quality={100}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
