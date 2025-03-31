import Image from "next/image"
import { Trash2 } from "lucide-react"
import { Button } from "./button"
import { ImageModal } from "./image-modal"
import { useState } from "react"
import { TripAsset } from "@/types/trips"

interface ImageGalleryProps {
  images: TripAsset[]
  onDelete?: (id: number) => void
  getImageUrl: (url: string) => string
}

export function ImageGallery({ images, onDelete, getImageUrl }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<TripAsset | null>(null)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {images.map((image, index) => (
          <div key={image.id} className="group relative">
            <div 
              className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer"
              onClick={() => setSelectedImage(image)}
            >
              <Image
                src={getImageUrl(image.file_url)}
                alt={image.title || `Gambar ${index + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                className="object-cover transition-transform duration-200 group-hover:scale-105"
                onError={(e) => {
                  console.error(`Error loading image ${index}:`, e)
                  const target = e.target as HTMLImageElement
                  target.src = '/placeholder-image.png'
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
            </div>
            {onDelete && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(image.id)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            {image.title && (
              <p className="text-sm text-gray-600 text-center truncate mt-1" title={image.title}>
                {image.title}
              </p>
            )}
            {image.description && (
              <p className="text-xs text-gray-500 text-center truncate" title={image.description}>
                {image.description}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          imageUrl={getImageUrl(selectedImage.file_url)}
          title={selectedImage.title}
          description={selectedImage.description || undefined}
        />
      )}
    </div>
  )
} 