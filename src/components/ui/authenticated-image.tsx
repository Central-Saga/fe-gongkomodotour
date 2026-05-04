"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';

interface AuthenticatedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  quality?: number;
  priority?: boolean;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
}

// Komponen fallback sederhana untuk gambar yang gagal dimuat
const ImageFallback = ({ className, width, height, fill }: { 
  className?: string; 
  width?: number; 
  height?: number; 
  fill?: boolean; 
}) => (
  <div 
    className={`bg-gray-200 flex items-center justify-center ${className}`}
    style={fill ? {} : { width, height }}
  >
    <div className="text-center p-4">
      <div className="text-gray-400 mb-2">
        <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      </div>
      <span className="text-gray-500 text-xs">Gambar tidak tersedia</span>
    </div>
  </div>
);

// Loading spinner component
const LoadingSpinner = ({ className, width, height, fill }: { 
  className?: string; 
  width?: number; 
  height?: number; 
  fill?: boolean; 
}) => (
  <div 
    className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}
    style={fill ? {} : { width, height }}
  >
    <div className="text-gray-400">
      <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  </div>
);

export const AuthenticatedImage: React.FC<AuthenticatedImageProps> = ({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  quality = 100,
  priority = false,
  placeholder = "empty",
  blurDataURL,
  onLoad,
  onError,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;
  const { token, refreshToken } = useAuth();

  useEffect(() => {
    const loadImage = async () => {
      if (!src) {
        setHasError(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setHasError(false);

        // Jika gambar dari API gongkomodotour, tambahkan autentikasi
        if (src.includes('api.gongkomodotour.com')) {
          if (token) {
            try {
              // Buat blob URL dengan autentikasi
              const response = await fetch(src, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Cache-Control': 'no-cache',
                },
                credentials: 'include',
              });

              if (response.ok) {
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                setImageSrc(blobUrl);
                setRetryCount(0); // Reset retry count on success
              } else if (response.status === 403 && retryCount < maxRetries) {
                // Token mungkin expired, coba refresh atau retry
                console.warn(`Image load failed with 403, retry ${retryCount + 1}/${maxRetries}`);
                setRetryCount(prev => prev + 1);
                
                // Try to refresh token
                const refreshSuccess = await refreshToken();
                if (refreshSuccess) {
                  // Retry with new token after a short delay
                  setTimeout(() => {
                    setImageSrc(src); // This will trigger a re-render with new token
                  }, 1000);
                } else {
                  // Fallback to direct URL if refresh fails
                  setImageSrc(src);
                }
                return;
              } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
              }
            } catch (fetchError) {
              console.error('Fetch error:', fetchError);
              // Fallback to direct URL if fetch fails
              setImageSrc(src);
            }
          } else {
            // Jika tidak ada token, gunakan URL asli
            setImageSrc(src);
          }
        } else {
          // Untuk gambar lain, gunakan URL asli
          setImageSrc(src);
        }
      } catch (error) {
        console.error('Error loading image:', error);
        setHasError(true);
        // Coba gunakan URL asli sebagai fallback
        if (!imageSrc || imageSrc.startsWith('blob:')) {
          setImageSrc(src);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();

    // Cleanup blob URL saat komponen unmount
    return () => {
      if (imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [src, retryCount, token, refreshToken, imageSrc]);

  // Handle error pada Image component
  const handleImageError = () => {
    console.error('Image failed to load:', src);
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return <ImageFallback className={className} width={width} height={height} fill={fill} />;
  }

  if (isLoading) {
    return <LoadingSpinner className={className} width={width} height={height} fill={fill} />;
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      className={className}
      quality={quality}
      priority={priority}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      onLoad={onLoad}
      onError={handleImageError}
      unoptimized={imageSrc.startsWith('blob:')} // Disable optimization for blob URLs
      {...props}
    />
  );
};

// Komponen alternatif yang lebih sederhana untuk menangani gambar dengan fallback
export const ImageWithFallback: React.FC<AuthenticatedImageProps> = ({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  quality = 100,
  priority = false,
  placeholder = "empty",
  blurDataURL,
  onLoad,
  onError,
  fallbackSrc = '/img/logo.png',
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
      onError?.();
    }
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      className={className}
      quality={quality}
      priority={priority}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      onLoad={onLoad}
      onError={handleError}
      {...props}
    />
  );
}; 