import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import { getUserFromToken } from "@/lib/auth-server"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
    }

    const usuario = await getUserFromToken(token)
    if (!usuario) {
      return NextResponse.json({ success: false, error: "Usuario no válido" }, { status: 401 })
    }

    const body = await request.json()
    const { codigo, nombre, descripcion, marca_id, precio_base, categoria, tiempo_entrega } = body

    if (!codigo || !nombre || !marca_id || !precio_base) {
      return NextResponse.json(
        {
          success: false,
          error: "Faltan campos requeridos: código, nombre, marca y precio",
        },
        { status: 400 },
      )
    }

    const sqlSolicitud = `
      INSERT INTO productos_solicitudes (
        codigo, nombre, descripcion, marca_id, precio_base, categoria, tiempo_entrega,
        usuario_solicitante_id, estado, fecha_solicitud
      )
      OUTPUT INSERTED.id
      VALUES (@codigo, @nombre, @descripcion, @marca_id, @precio_base, @categoria, @tiempo_entrega, @usuario_id, 'pendiente', GETDATE())
    `

    const params = {
      codigo,
      nombre,
      descripcion: descripcion || null,
      marca_id,
      precio_base,
      categoria: categoria || null,
      tiempo_entrega: tiempo_entrega || null,
      usuario_id: usuario.id,
    }

    const result = await executeQuery<{ id: number }>(sqlSolicitud, params)
    const solicitudId = result[0].id

    const sqlNotificacion = `
      INSERT INTO notificaciones_admin (
        tipo, titulo, mensaje, datos_adicionales, fecha_creacion
      )
      VALUES (
        'producto_solicitado',
        'Nueva solicitud de producto',
        @mensaje,
        @datos,
        GETDATE()
      )
    `

    const mensaje = `El usuario ${usuario.nombre} ha solicitado agregar el producto "${nombre}" (${codigo})`
    const datos = JSON.stringify({
      solicitud_id: solicitudId,
      usuario_solicitante: usuario.nombre,
      producto: { codigo, nombre, marca_id, precio_base },
    })

    await executeQuery(sqlNotificacion, { mensaje, datos })

    return NextResponse.json({
      success: true,
      message: "Solicitud de producto enviada correctamente",
      solicitud_id: solicitudId,
    })
  } catch (error) {
    console.error("Error procesando solicitud de producto:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
