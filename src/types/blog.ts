export interface Author {
  id: number
  name: string
  email: string
  role: string
  status: string
  created_at: string
  updated_at: string
}

export interface BlogAsset {
  id: number
  blog_id: number
  file_url: string
  title?: string
  created_at: string
  updated_at: string
}

export interface Blog {
  id: number
  author_id: number
  title: string
  content: string
  status: string
  category: 'trips' | 'travel'
  created_at: string
  updated_at: string
  author: Author
  assets: BlogAsset[]
} 