// API endpoints para cotización específica
import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserFromToken } from "@/lib/auth-server"
import { getCotizacionById, updateCotizacionEstado, updateCotizacion } from "@/lib/services/cotizaciones"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "Token no encontrado" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ success: false, message: "Token inválido" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    const cotizacion = await getCotizacionById(id)

    if (!cotizacion) {
      return NextResponse.json({ success: false, message: "Cotización no encontrada" }, { status: 404 })
    }

    // Verificar permisos (solo el creador o admin pueden ver)
    if (user.rol !== "admin" && cotizacion.usuario_id !== user.id) {
      return NextResponse.json(
        { success: false, message: "No tienes permisos para ver esta cotización" },
        { status: 403 },
      )
    }

    return NextResponse.json({ success: true, data: cotizacion })
  } catch (error) {
    console.error("Error obteniendo cotización:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "Token no encontrado" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ success: false, message: "Token inválido" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    const cotizacionData = await request.json()

    const cotizacionExistente = await getCotizacionById(id)
    if (!cotizacionExistente) {
      return NextResponse.json({ success: false, message: "Cotización no encontrada" }, { status: 404 })
    }

    if (user.rol !== "admin" && cotizacionExistente.usuario_id !== user.id) {
      return NextResponse.json(
        { success: false, message: "No tienes permisos para editar esta cotización" },
        { status: 403 },
      )
    }

    const actualizada = await updateCotizacion(id, cotizacionData, user.id)

    if (!actualizada) {
      return NextResponse.json({ success: false, message: "Error actualizando cotización" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Cotización actualizada correctamente", data: actualizada })
  } catch (error) {
    console.error("Error actualizando cotización:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "Token no encontrado" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ success: false, message: "Token inválido" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    const { estado } = await request.json()

    if (!estado) {
      return NextResponse.json({ success: false, message: "Estado es requerido" }, { status: 400 })
    }

    const cotizacion = await getCotizacionById(id)
    if (!cotizacion) {
      return NextResponse.json({ success: false, message: "Cotización no encontrada" }, { status: 404 })
    }

    if (user.rol !== "admin" && cotizacion.usuario_id !== user.id) {
      return NextResponse.json(
        { success: false, message: "No tienes permisos para actualizar esta cotización" },
        { status: 403 },
      )
    }

    const actualizado = await updateCotizacionEstado(id, estado)

    if (!actualizado) {
      return NextResponse.json({ success: false, message: "Error actualizando estado" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Estado actualizado correctamente" })
  } catch (error) {
    console.error("Error actualizando cotización:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
