"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Loader2, Upload, X, Link } from "lucide-react"
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
    file_url: string
    title: string
    description: string | null
  }>
  maxFiles?: number
  maxSize?: number // in bytes
  accept?: Record<string, string[]>
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export function FileUpload({
  onUpload,
  onDelete,
  existingFiles = [],
  maxFiles = 5,
  maxSize = 2 * 1024 * 1024, // 2MB
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif']
  }
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (files.length + acceptedFiles.length > maxFiles) {
      toast.error(`Maksimal ${maxFiles} file`)
      return
    }

    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      title: file.name,
      description: ""
    }))

    setFiles(prev => [...prev, ...newFiles])
  }, [files.length, maxFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize
  })

  const handleUpload = async () => {
    try {
      setIsUploading(true)
      if (activeTab === "file") {
        await onUpload(
          files.map(f => f.file),
          files.map(f => f.title),
          files.map(f => f.description)
        )
        setFiles([])
      } else {
        await onUpload(
          [],
          urls.map(u => u.url),
          urls.map(u => u.description)
        )
        setUrls([])
      }
    } catch (error) {
      toast.error("Gagal mengupload file")
      console.error("Upload error:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = (index: number) => {
    if (activeTab === "file") {
      setFiles(prev => prev.filter((_, i) => i !== index))
    } else {
      setUrls(prev => prev.filter((_, i) => i !== index))
    }
  }

  const updateFileInfo = (index: number, field: 'title' | 'description' | 'url', value: string) => {
    if (activeTab === "file") {
      setFiles(prev => prev.map((file, i) => 
        i === index ? { ...file, [field]: value } : file
      ))
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
    if (url.startsWith('http')) {
      return url
    }
    // Hapus leading slash jika ada
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url
    return `${API_URL}/${cleanUrl}`
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
                  onClick={() => removeFile(index)}
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
      {existingFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">File yang sudah ada</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {existingFiles.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square relative rounded-lg overflow-hidden">
                  <Image
                    src={getImageUrl(file.file_url)}
                    alt={file.title}
                    fill
                    className="object-cover"
                  />
                  {onDelete && (
                    <button
                      onClick={() => onDelete(file.file_url)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium">{file.title}</p>
                  {file.description && (
                    <p className="text-xs text-gray-500">{file.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Files */}
      {(files.length > 0 || urls.length > 0) && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">File baru</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {activeTab === "file" ? (
              files.map((file, index) => (
                <div key={index} className="relative">
                  <div className="aspect-square relative rounded-lg overflow-hidden">
                    <Image
                      src={file.preview}
                      alt={file.title}
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 space-y-2">
                    <Input
                      placeholder="Judul file"
                      value={file.title}
                      onChange={(e) => updateFileInfo(index, 'title', e.target.value)}
                    />
                    <Textarea
                      placeholder="Deskripsi (opsional)"
                      value={file.description}
                      onChange={(e) => updateFileInfo(index, 'description', e.target.value)}
                    />
                  </div>
                </div>
              ))
            ) : null}
          </div>
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upload {activeTab === "file" ? "File" : "URL"}
          </Button>
        </div>
      )}
    </div>
  )
} 