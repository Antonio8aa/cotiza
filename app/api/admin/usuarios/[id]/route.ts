// API endpoints para usuario específico
import { type NextRequest, NextResponse } from "next/server"
import { updateUsuario } from "@/lib/services/admin"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userRole = request.headers.get("x-user-role")
    if (userRole !== "admin") {
      return NextResponse.json({ success: false, message: "Acceso denegado" }, { status: 403 })
    }

    const id = Number.parseInt(params.id)
    const userData = await request.json()

    const usuarioActualizado = await updateUsuario(id, userData)

    if (!usuarioActualizado) {
      return NextResponse.json({ success: false, message: "Usuario no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: usuarioActualizado })
  } catch (error) {
    console.error("Error actualizando usuario:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
