"use client"

import { useCallback, useState, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, X, Link } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FileUploadProps {
  onUpload: (files: File[], titles: string[], descriptions: string[]) => Promise<void>
  onDelete?: (fileUrl: string) => Promise<void>
  existingFiles?: Array<{
    id?: number
    file_url: string
    title: string
    description: string | null
  }>
  maxFiles?: number
  maxSize?: number // in bytes
  accept?: Record<string, string[]>
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.gongkomodotour.com'

// Fungsi untuk membersihkan HTML tags dari teks
const stripHtmlTags = (html: string) => {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').trim()
}

export function FileUpload({
  onUpload,
  onDelete,
  existingFiles = [],
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.avif', '.webp']
  }
}: FileUploadProps) {
  const [activeTab, setActiveTab] = useState<"file" | "url">("file")
  const [files, setFiles] = useState<Array<{
    file: File
    preview: string
    title: string
    description: string
  }>>([])
  const [urls, setUrls] = useState<Array<{
    url: string
    title: string
    description: string
  }>>([])

  // Debug state changes
  useEffect(() => {
    console.log('Files state changed:', files.length, files)
  }, [files])

  useEffect(() => {
    console.log('URLs state changed:', urls.length, urls)
  }, [urls])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    console.log('Files accepted:', acceptedFiles.length, acceptedFiles)
    console.log('Current files state:', files.length)
    
    // Cek total file (existing + new) tidak melebihi maxFiles
    const totalFiles = files.length + acceptedFiles.length
    if (totalFiles > maxFiles) {
      toast.error(`Maksimal ${maxFiles} file. Anda sudah memiliki ${files.length} file.`)
      return
    }

    // Filter file yang sudah ada berdasarkan nama dan ukuran untuk mencegah duplikasi
    const existingFileNames = new Set(files.map(f => `${f.file.name}-${f.file.size}`))
    const uniqueNewFiles = acceptedFiles.filter(file => {
      const fileKey = `${file.name}-${file.size}`
      if (existingFileNames.has(fileKey)) {
        toast.warning(`File ${file.name} sudah ada dalam daftar`)
        return false
      }
      return true
    })

    if (uniqueNewFiles.length === 0) {
      return // Semua file sudah ada
    }

    const newFiles = uniqueNewFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      title: file.name,
      description: ""
    }))

    console.log('New files created:', newFiles)
    
    setFiles(prev => {
      const updated = [...prev, ...newFiles]
      console.log('Files state updated:', updated.length, updated)
      
      // Call onUpload dengan file yang benar-benar baru saja
      // Gunakan requestAnimationFrame untuk memastikan state sudah ter-update
      requestAnimationFrame(() => {
        onUpload(
          updated.map(f => f.file),
          updated.map(f => f.title),
          updated.map(f => f.description)
        ).catch(error => {
          console.error('Error uploading files:', error)
          toast.error('Gagal mengupload file')
        })
      })
      
      return updated
    })
  }, [files, maxFiles, onUpload])

  const onDropRejected = useCallback((fileRejections: any[]) => {
    console.log('Files rejected:', fileRejections)
    
    fileRejections.forEach(({ file, errors }) => {
      errors.forEach((error: any) => {
        if (error.code === 'file-too-large') {
          toast.error(`File ${file.name} terlalu besar. Maksimal ${maxSize / (1024 * 1024)}MB`)
        } else if (error.code === 'file-invalid-type') {
          toast.error(`File ${file.name} tidak didukung. Gunakan format gambar yang valid`)
        } else if (error.code === 'too-many-files') {
          toast.error(`Maksimal ${maxFiles} file`)
        } else {
          toast.error(`File ${file.name} ditolak: ${error.message}`)
        }
      })
    })
  }, [maxFiles, maxSize])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept,
    maxSize
  })

  const removeFile = (index: number) => {
    console.log('Removing file at index:', index)
    if (activeTab === "file") {
      setFiles(prev => {
        const newFiles = prev.filter((_, i) => i !== index)
        console.log('Files after removal:', newFiles)
        
        // Update onUpload dengan file yang tersisa
        requestAnimationFrame(() => {
          onUpload(
            newFiles.map(f => f.file),
            newFiles.map(f => f.title),
            newFiles.map(f => f.description)
          ).catch(error => {
            console.error('Error updating files after removal:', error)
          })
        })
        
        return newFiles
      })
    } else {
      setUrls(prev => prev.filter((_, i) => i !== index))
    }
  }

  const updateFileInfo = (index: number, field: 'title' | 'description' | 'url', value: string) => {
    console.log('Updating file info:', { index, field, value })
    if (activeTab === "file") {
      setFiles(prev => {
        const updated = prev.map((file, i) => 
          i === index ? { ...file, [field]: value } : file
        )
        console.log('Files after update:', updated)
        return updated
      })
    } else {
      setUrls(prev => prev.map((url, i) => 
        i === index ? { ...url, [field]: value } : url
      ))
    }
  }

  const addUrl = () => {
    if (urls.length >= maxFiles) {
      toast.error(`Maksimal ${maxFiles} URL`)
      return
    }
    setUrls(prev => [...prev, { url: "", title: "", description: "" }])
  }

  // Fungsi untuk mengubah URL relatif menjadi URL absolut
  const getImageUrl = (url: string) => {
    if (!url) {
      console.warn('Empty URL provided to getImageUrl')
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4='
    }
    
    console.log('Original URL:', url)
    
    if (url.startsWith('http')) {
      console.log('Returning absolute URL:', url)
      return url
    }
    
    // Pastikan URL dimulai dengan slash
    const cleanUrl = url.startsWith('/') ? url : `/${url}`
    const fullUrl = `${API_URL}${cleanUrl}`
    console.log('Constructed URL:', fullUrl)
    return fullUrl
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "file" | "url")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file">Upload File</TabsTrigger>
          <TabsTrigger value="url">URL Eksternal</TabsTrigger>
        </TabsList>
        <TabsContent value="file">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              {isDragActive
                ? "Lepaskan file di sini"
                : "Drag & drop file di sini, atau klik untuk memilih file"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Maksimal {maxFiles} file, ukuran maksimal {maxSize / (1024 * 1024)}MB
            </p>
          </div>

          {files.length > 0 && (
            <div className="mt-4">
              <div className="text-sm text-gray-600 mb-2">
                {files.length} file(s) uploaded
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {files.map((file, index) => {
                  console.log('Rendering file:', { index, file: file.file.name, preview: file.preview })
                  return (
                    <div key={index} className="p-4 border rounded-lg relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          removeFile(index)
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full z-10"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="space-y-2">
                        <div className="h-32 w-full relative rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={file.preview}
                            alt={file.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            unoptimized={true}
                            onLoad={() => console.log('Image loaded successfully:', file.file.name)}
                            onError={(e) => {
                              console.error('Image failed to load:', file.file.name, file.preview, e)
                            }}
                          />
                        </div>
                        <Input
                          placeholder="Judul"
                          value={file.title}
                          onChange={(e) => updateFileInfo(index, 'title', e.target.value)}
                        />
                        <Textarea
                          placeholder="Deskripsi (opsional)"
                          value={file.description}
                          onChange={(e) => updateFileInfo(index, 'description', e.target.value)}
                          className="h-20 min-h-0 resize-none"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </TabsContent>
        <TabsContent value="url">
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              onClick={addUrl}
              className="w-full"
            >
              <Link className="h-4 w-4 mr-2" />
              Tambah URL
            </Button>
            {urls.map((url, index) => (
              <div key={index} className="space-y-2 p-4 border rounded-lg relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    removeFile(index)
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                >
                  <X className="h-4 w-4" />
                </button>
                <Input
                  placeholder="URL Gambar"
                  value={url.url}
                  onChange={(e) => updateFileInfo(index, 'url', e.target.value)}
                />
                <Input
                  placeholder="Judul"
                  value={url.title}
                  onChange={(e) => updateFileInfo(index, 'title', e.target.value)}
                />
                <Textarea
                  placeholder="Deskripsi (opsional)"
                  value={url.description}
                  onChange={(e) => updateFileInfo(index, 'description', e.target.value)}
                />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Existing Files */}
      {existingFiles && existingFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">File yang sudah ada ({existingFiles.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {existingFiles.map((file, index) => {
              if (!file || !file.file_url) {
                console.warn(`Invalid existing file at index ${index}:`, file)
                return null
              }
              
              console.log(`Rendering existing file ${index}:`, {
                id: file.id,
                title: file.title,
                file_url: file.file_url,
                key: `existing-${file.id ?? file.file_url}-${index}`
              })
              
              return (
                <div key={`existing-${file.id ?? file.file_url}-${index}`} className="relative group">
                  <div className="aspect-square relative rounded-lg overflow-hidden">
                    <Image
                      src={getImageUrl(file.file_url)}
                      alt={file.title || `Existing file ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized={true}
                      onError={(e) => {
                        console.error('Failed to load existing image:', {
                          file,
                          constructedUrl: getImageUrl(file.file_url),
                          error: e
                        })
                        const target = e.target as HTMLImageElement
                        // Gunakan data URL untuk placeholder yang valid
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4='
                      }}
                      onLoad={() => {
                        console.log('Existing image loaded successfully:', file.title)
                      }}
                    />
                    {onDelete && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          console.log('Deleting existing file:', {
                            fileUrl: file.file_url,
                            fileTitle: file.title,
                            fileId: file.id ?? 'no-id'
                          })
                          onDelete(file.file_url)
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title={`Hapus ${file.title || 'file'}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium">{file.title || 'Untitled'}</p>
                    {file.description && (
                      <p className="text-xs text-gray-500">{stripHtmlTags(file.description)}</p>
                    )}
                  </div>
                </div>
              )
            }).filter(Boolean)}
          </div>
        </div>
      )}
    </div>
  )
} 