// API endpoints para productos
import { type NextRequest, NextResponse } from "next/server"
import { getProductos, createProducto } from "@/lib/services/productos"
import type { ProductoSearch } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const filters: ProductoSearch = {
      query: searchParams.get("query") || undefined,
      marca_id: searchParams.get("marca_id") ? Number.parseInt(searchParams.get("marca_id")!) : undefined,
      categoria: searchParams.get("categoria") || undefined,
      activo: searchParams.get("activo") !== "false",
      limit: searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 50,
      offset: searchParams.get("offset") ? Number.parseInt(searchParams.get("offset")!) : 0,
    }

    const productos = await getProductos(filters)
    return NextResponse.json({ success: true, data: productos })
  } catch (error) {
    console.error("Error obteniendo productos:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { codigo, nombre, descripcion, marca_id, precio_base, variable_plano, categoria, especificaciones } = body

    if (!codigo || !nombre || !marca_id || !precio_base) {
      return NextResponse.json(
        { success: false, message: "Código, nombre, marca y precio son requeridos" },
        { status: 400 },
      )
    }

    const nuevoProducto = await createProducto({
      codigo,
      nombre,
      descripcion,
      marca_id: Number.parseInt(marca_id),
      precio_base: Number.parseFloat(precio_base),
      variable_plano,
      categoria,
      especificaciones,
      activo: true,
    })

    return NextResponse.json({ success: true, data: nuevoProducto }, { status: 201 })
  } catch (error) {
    console.error("Error creando producto:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
