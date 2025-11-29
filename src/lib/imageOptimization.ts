/**
 * Utility untuk optimasi gambar sebelum upload
 * Menggunakan Canvas API untuk resize dan compress tanpa library tambahan
 */

export interface ImageOptimizationOptions {
  maxWidth?: number // Maksimal lebar gambar (default: 1920px)
  maxHeight?: number // Maksimal tinggi gambar (default: 1920px)
  quality?: number // Kualitas JPEG (0-1, default: 0.85)
  maxSizeMB?: number // Target maksimal ukuran file dalam MB (default: 2MB)
}

const DEFAULT_OPTIONS: Required<ImageOptimizationOptions> = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.85,
  maxSizeMB: 2,
}

/**
 * Resize dan compress gambar menggunakan Canvas API
 */
export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        try {
          // Hitung dimensi baru dengan menjaga aspect ratio
          let { width, height } = img
          const aspectRatio = width / height

          if (width > opts.maxWidth || height > opts.maxHeight) {
            if (width > height) {
              width = opts.maxWidth
              height = width / aspectRatio
            } else {
              height = opts.maxHeight
              width = height * aspectRatio
            }
          }

          // Buat canvas untuk resize
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')

          if (!ctx) {
            reject(new Error('Failed to get canvas context'))
            return
          }

          // Set image smoothing untuk kualitas yang lebih baik
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'

          // Draw image ke canvas
          ctx.drawImage(img, 0, 0, width, height)

          // Convert ke blob dengan quality yang dioptimasi
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create blob'))
                return
              }

              // Jika ukuran masih terlalu besar, compress lebih lanjut
              const targetSizeBytes = opts.maxSizeMB * 1024 * 1024
              
              if (blob.size > targetSizeBytes) {
                // Compress lebih lanjut dengan quality yang lebih rendah
                compressWithQuality(canvas, file.type, targetSizeBytes, opts.quality)
                  .then(compressedBlob => {
                    const optimizedFile = new File(
                      [compressedBlob],
                      file.name,
                      { type: file.type, lastModified: Date.now() }
                    )
                    console.log(`Image optimized: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(optimizedFile.size / 1024 / 1024).toFixed(2)}MB`)
                    resolve(optimizedFile)
                  })
                  .catch(reject)
              } else {
                const optimizedFile = new File(
                  [blob],
                  file.name,
                  { type: file.type, lastModified: Date.now() }
                )
                console.log(`Image optimized: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(optimizedFile.size / 1024 / 1024).toFixed(2)}MB`)
                resolve(optimizedFile)
              }
            },
            file.type,
            opts.quality
          )
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      img.src = e.target?.result as string
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Compress gambar dengan quality yang disesuaikan hingga mencapai target size
 */
async function compressWithQuality(
  canvas: HTMLCanvasElement,
  mimeType: string,
  targetSizeBytes: number,
  initialQuality: number
): Promise<Blob> {
  let quality = initialQuality
  let blob: Blob | null = null
  const minQuality = 0.5 // Minimum quality untuk menjaga kualitas visual

  // Binary search untuk menemukan quality yang tepat
  while (quality >= minQuality) {
    blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), mimeType, quality)
    })

    if (blob.size <= targetSizeBytes || quality <= minQuality) {
      break
    }

    quality -= 0.1
  }

  return blob || new Blob()
}

/**
 * Batch optimize multiple images
 */
export async function optimizeImages(
  files: File[],
  options?: ImageOptimizationOptions,
  onProgress?: (current: number, total: number) => void
): Promise<File[]> {
  const optimizedFiles: File[] = []
  const total = files.length

  for (let i = 0; i < files.length; i++) {
    try {
      const optimized = await optimizeImage(files[i], options)
      optimizedFiles.push(optimized)
      onProgress?.(i + 1, total)
    } catch (error) {
      console.error(`Failed to optimize ${files[i].name}:`, error)
      // Jika gagal optimize, gunakan file original
      optimizedFiles.push(files[i])
      onProgress?.(i + 1, total)
    }
  }

  return optimizedFiles
}

/**
 * Check apakah file perlu dioptimasi
 */
export function needsOptimization(file: File, maxSizeMB: number = 2): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size > maxSizeBytes || !file.type.startsWith('image/')
}

