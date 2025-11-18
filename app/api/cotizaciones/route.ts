// API endpoints para cotizaciones
import { type NextRequest, NextResponse } from "next/server"
import { getCotizaciones, createCotizacion } from "@/lib/services/cotizaciones"
import { verifyToken } from "@/lib/auth-server"
import type { CotizacionSearch, CotizacionForm } from "@/lib/types"

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

    const filters: CotizacionSearch = {
      query: searchParams.get("query") || undefined,
      usuario_id: searchParams.get("usuario_id") ? Number.parseInt(searchParams.get("usuario_id")!) : undefined,
      estado: searchParams.get("estado") || undefined,
      fecha_desde: searchParams.get("fecha_desde") ? new Date(searchParams.get("fecha_desde")!) : undefined,
      fecha_hasta: searchParams.get("fecha_hasta") ? new Date(searchParams.get("fecha_hasta")!) : undefined,
      limit: searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 50,
      offset: searchParams.get("offset") ? Number.parseInt(searchParams.get("offset")!) : 0,
    }

    // Si no es admin, solo mostrar cotizaciones propias
    if (user.rol !== "admin") {
      filters.usuario_id = user.id
    }

    const cotizaciones = await getCotizaciones(filters)
    return NextResponse.json({ success: true, data: cotizaciones })
  } catch (error) {
    console.error("Error obteniendo cotizaciones:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ success: false, message: "Token no encontrado" }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ success: false, message: "Token inválido" }, { status: 401 })
    }

    const cotizacionData: CotizacionForm = await request.json()

    if (!cotizacionData.cliente_nombre || !cotizacionData.forma_pago_id) {
      return NextResponse.json(
        { success: false, message: "Nombre del cliente y forma de pago son requeridos" },
        { status: 400 },
      )
    }

    if (!cotizacionData.productos || cotizacionData.productos.length === 0) {
      return NextResponse.json(
        { success: false, message: "Debe agregar al menos un producto a la cotización" },
        { status: 400 },
      )
    }

    const nuevaCotizacion = await createCotizacion(cotizacionData, user.id)
    return NextResponse.json({ success: true, data: nuevaCotizacion }, { status: 201 })
  } catch (error) {
    console.error("Error creando cotización:", error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Error interno del servidor" },
      { status: 500 },
    )
  }
}
