import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  title?: string
  description?: string
}

export function ImageModal({ isOpen, onClose, imageUrl, title, description }: ImageModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0">
        <DialogTitle className="sr-only">
          {title || "Gambar"}
        </DialogTitle>
        <div className="relative aspect-video w-full">
          <Image
            src={imageUrl}
            alt={title || "Gambar"}
            fill
            className="object-contain"
            priority
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4 text-white">
            <div>
              {title && <h3 className="font-semibold">{title}</h3>}
              {description && <p className="text-sm opacity-90">{description}</p>}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 