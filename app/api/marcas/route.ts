// API endpoint para marcas
import { NextResponse } from "next/server"
import { getMarcas } from "@/lib/services/productos"

export async function GET() {
  try {
    const marcas = await getMarcas()
    return NextResponse.json({ success: true, data: marcas })
  } catch (error) {
    console.error("Error obteniendo marcas:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
