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
        ps.*,
        u.nombre as usuario_nombre,
        u.email as usuario_email,
        m.nombre as marca_nombre
      FROM productos_solicitudes ps
      LEFT JOIN usuarios u ON ps.usuario_solicitante_id = u.id
      LEFT JOIN marcas m ON ps.marca_id = m.id
      ORDER BY ps.fecha_solicitud DESC
    `

    const solicitudes = await executeQuery(sql)

    return NextResponse.json({
      success: true,
      data: solicitudes,
    })
  } catch (error) {
    console.error("Error obteniendo solicitudes:", error)
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

    const { id, accion, comentarios } = await request.json()

    if (accion === "aprobar") {
      const sqlSolicitud = `
        SELECT * FROM productos_solicitudes WHERE id = @id
      `
      const solicitud = await executeQuery(sqlSolicitud, { id })

      if (solicitud.length === 0) {
        return NextResponse.json({ success: false, error: "Solicitud no encontrada" }, { status: 404 })
      }

      const producto = solicitud[0]

      const sqlProducto = `
        INSERT INTO productos (codigo, nombre, descripcion, marca_id, precio_base, categoria, tiempo_entrega, activo)
        VALUES (@codigo, @nombre, @descripcion, @marca_id, @precio_base, @categoria, @tiempo_entrega, 1)
      `

      await executeQuery(sqlProducto, {
        codigo: producto.codigo,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        marca_id: producto.marca_id,
        precio_base: producto.precio_base,
        categoria: producto.categoria,
        tiempo_entrega: producto.tiempo_entrega,
      })

      // Actualizar solicitud
      const sqlUpdate = `
        UPDATE productos_solicitudes 
        SET estado = 'aprobado', fecha_respuesta = GETDATE(), admin_respuesta_id = @admin_id, comentarios_admin = @comentarios
        WHERE id = @id
      `
      await executeQuery(sqlUpdate, { id, admin_id: usuario.id, comentarios })
    } else if (accion === "rechazar") {
      const sqlUpdate = `
        UPDATE productos_solicitudes 
        SET estado = 'rechazado', fecha_respuesta = GETDATE(), admin_respuesta_id = @admin_id, comentarios_admin = @comentarios
        WHERE id = @id
      `
      await executeQuery(sqlUpdate, { id, admin_id: usuario.id, comentarios })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error procesando solicitud:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
