import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const placeId = 'ChIJHQWtsFhA0i0RekulUfAA9D0';
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key tidak ditemukan' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}`
    );

    const data = await response.json();

    if (data.error_message) {
      return NextResponse.json(
        { error: data.error_message },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 