// API endpoint para búsqueda de productos en cotizaciones
import { type NextRequest, NextResponse } from "next/server"
import { searchProductosParaCotizacion } from "@/lib/services/productos"
import { verifyToken } from "@/lib/auth-server"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ success: false, message: "Token no encontrado" }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ success: false, message: "Token inválido" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    if (!query.trim()) {
      return NextResponse.json({ success: true, data: [] })
    }

    const productos = await searchProductosParaCotizacion(query, limit)
    return NextResponse.json({ success: true, data: productos })
  } catch (error) {
    console.error("Error buscando productos:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
