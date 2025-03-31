import { NextResponse } from "next/server"
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("Fetching trip with ID:", params.id)
    console.log("API URL:", `${API_URL}/trips/${params.id}`)
    
    const response = await axios.get(`${API_URL}/trips/${params.id}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    
    console.log("API Response:", response.data)
    
    if (!response.data) {
      return NextResponse.json(
        { message: "Data trip tidak ditemukan" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(response.data)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      })

      // Jika error dari backend Laravel
      if (error.response?.data) {
        return NextResponse.json(
          { 
            message: "Gagal mengambil data trip",
            error: error.response.data
          },
          { status: error.response.status }
        )
      }

      // Jika error koneksi
      if (error.code === 'ECONNREFUSED') {
        return NextResponse.json(
          { 
            message: "Tidak dapat terhubung ke server",
            error: { message: "Pastikan backend Laravel sudah berjalan" }
          },
          { status: 503 }
        )
      }
    }
    
    // Error lainnya
    console.error("Error fetching trip:", error)
    return NextResponse.json(
      { 
        message: "Gagal mengambil data trip",
        error: { message: "Terjadi kesalahan internal" }
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    console.log("Updating trip with ID:", params.id)
    console.log("Request body:", body)
    
    const response = await axios.put(`${API_URL}/trips/${params.id}`, body)
    console.log("API Response:", response.data)
    
    return NextResponse.json(response.data)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
    } else {
      console.error("Error updating trip:", error)
    }
    
    return NextResponse.json(
      { 
        message: "Gagal mengupdate trip",
        error: axios.isAxiosError(error) ? error.response?.data : error
      },
      { status: axios.isAxiosError(error) ? error.response?.status || 500 : 500 }
    )
  }
} 