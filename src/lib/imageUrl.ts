/**
 * Helper function to get full image URL from API
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sandbox.api.gongkomodotour.com';

export function getImageUrl(url: string): string {
  if (!url) {
    console.warn('Empty URL provided to getImageUrl')
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4='
  }

  console.log('Original URL:', url)

  // Jika url sudah absolute, gunakan langsung
  if (url.startsWith('http')) {
    console.log('Returning absolute URL:', url)
    return url;
  }

  // Pastikan URL dimulai dengan slash
  const cleanUrl = url.startsWith('/') ? url : `/${url}`
  const fullUrl = `${API_URL}${cleanUrl}`
  console.log('Constructed URL:', fullUrl)
  return fullUrl
}

export default getImageUrl;
