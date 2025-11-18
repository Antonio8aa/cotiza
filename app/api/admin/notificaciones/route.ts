import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import { getUserFromToken } from "@/lib/auth-server"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
    }

    const usuario = await getUserFromToken(token)
    if (!usuario || usuario.rol !== "admin") {
      return NextResponse.json({ success: false, error: "Acceso denegado" }, { status: 403 })
    }

    const sql = `
      SELECT 
        id,
        tipo,
        titulo,
        mensaje,
        datos_adicionales,
        leida,
        fecha_creacion,
        fecha_lectura
      FROM notificaciones_admin 
      ORDER BY fecha_creacion DESC
    `

    const notificaciones = await executeQuery(sql)

    return NextResponse.json({
      success: true,
      data: notificaciones,
    })
  } catch (error) {
    console.error("Error obteniendo notificaciones:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
    }

    const usuario = await getUserFromToken(token)
    if (!usuario || usuario.rol !== "admin") {
      return NextResponse.json({ success: false, error: "Acceso denegado" }, { status: 403 })
    }

    const { id, accion } = await request.json()

    if (accion === "marcar_leida") {
      const sql = `
        UPDATE notificaciones_admin 
        SET leida = 1, fecha_lectura = GETDATE()
        WHERE id = @id
      `
      await executeQuery(sql, { id })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error actualizando notificación:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
