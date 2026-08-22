import { NextResponse } from 'next/server';
import { apiRequest } from '@/lib/api';

// Interface untuk response carousel
interface CarouselResponse {
  success: boolean;
  data: Array<{
    id: number;
    title: string;
    description: string;
    order_num: string;
    is_active: string;
    assets: Array<{
      id: number;
      title: string;
      description: string;
      file_url: string;
      original_file_url: string;
      is_external: boolean;
      file_path: string;
      created_at: string;
      updated_at: string;
    }>;
    primary_image: {
      id: number;
      title: string;
      description: string;
      file_url: string;
      original_file_url: string;
      is_external: boolean;
      file_path: string;
      created_at: string;
      updated_at: string;
    };
    created_at: string;
    updated_at: string;
  }>;
}

// API untuk mengambil data carousel dari backend
export async function GET() {
  try {
    console.log('Fetching carousel data from backend...');
    
    // Menggunakan apiRequest untuk mengambil data dari backend yang sudah terhosting
    console.log('Calling backend API for carousel data...');
    const response = await apiRequest<CarouselResponse>(
      'GET',
      '/api/landing-page/carousels'
    );
    console.log('Backend API response received:', response);
    
    console.log('Carousel API response:', response);
    
    // Validasi response
    if (!response || !response.data) {
      console.warn('No carousel data received from backend');
      return NextResponse.json(
        { 
          success: false,
          error: 'Tidak ada data carousel yang tersedia',
          data: []
        },
        { status: 404 }
      );
    }

    // Filter hanya item yang aktif dan memiliki primary image
    const activeItems = response.data.filter(item => 
      String(item.is_active) === '1' && item.primary_image && item.primary_image.file_url
    );
    
    console.log('Active items before sorting:', activeItems.map(item => ({
      id: item.id,
      title: item.title,
      order_num: item.order_num,
      primary_image_url: item.primary_image?.file_url
    })));
    
    // Sort berdasarkan order_num
    const sortedItems = activeItems.sort((a, b) => 
      parseInt(a.order_num) - parseInt(b.order_num)
    );
    
    console.log('Sorted items after sorting:', sortedItems.map(item => ({
      id: item.id,
      title: item.title,
      order_num: item.order_num,
      primary_image_url: item.primary_image?.file_url
    })));
    
    console.log(`Loaded ${sortedItems.length} active carousel items`);

    return NextResponse.json(
      {
        success: true,
        data: sortedItems
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );

  } catch (error) {
    console.error('Error fetching carousel data from backend:', error);
    
    // Return error response instead of fallback data
    return NextResponse.json(
      { 
        success: false,
        error: 'Gagal mengambil data carousel dari backend',
        data: []
      },
      { status: 500 }
    );
  }
}

// Handler untuk method lain jika diperlukan
export async function POST() {
  return NextResponse.json(
    { error: 'Method POST tidak didukung untuk endpoint ini' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method PUT tidak didukung untuk endpoint ini' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method DELETE tidak didukung untuk endpoint ini' },
    { status: 405 }
  );
}
