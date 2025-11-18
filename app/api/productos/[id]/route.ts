// API endpoints para producto específico
import { type NextRequest, NextResponse } from "next/server"
import { getProductoById, updateProducto, deleteProducto } from "@/lib/services/productos"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const producto = await getProductoById(id)

    if (!producto) {
      return NextResponse.json({ success: false, message: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: producto })
  } catch (error) {
    console.error("Error obteniendo producto:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const body = await request.json()

    const productoActualizado = await updateProducto(id, body)

    if (!productoActualizado) {
      return NextResponse.json({ success: false, message: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: productoActualizado })
  } catch (error) {
    console.error("Error actualizando producto:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const eliminado = await deleteProducto(id)

    if (!eliminado) {
      return NextResponse.json({ success: false, message: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Producto eliminado correctamente" })
  } catch (error) {
    console.error("Error eliminando producto:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
