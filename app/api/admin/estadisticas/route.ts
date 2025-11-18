import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth-server"
import { executeQuery } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] API estadisticas - iniciando verificación de token")
    const token = request.cookies.get("auth-token")?.value
    console.log("[v0] Token extraído de cookies:", token ? "presente" : "ausente")

    if (!token) {
      console.log("[v0] Token no encontrado en cookies")
      return NextResponse.json({ success: false, message: "No autenticado" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    console.log("[v0] Usuario obtenido:", user ? { id: user.id, rol: user.rol } : "null")

    if (!user) {
      console.log("[v0] Token inválido o usuario no encontrado")
      return NextResponse.json({ success: false, message: "Token inválido" }, { status: 401 })
    }

    if (user.rol !== "admin") {
      console.log("[v0] Usuario no es admin:", user.rol)
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 403 })
    }

    console.log("[v0] Obteniendo estadísticas de la base de datos")
    // Obtener estadísticas
    const [
      totalCotizacionesResult,
      cotizacionesAprobadasResult,
      totalProductosResult,
      totalUsuariosResult,
      cotizacionesPendientesResult,
    ] = await Promise.all([
      executeQuery("SELECT COUNT(*) as total FROM cotizaciones"),
      executeQuery("SELECT COUNT(*) as total FROM cotizaciones WHERE estado = 'aprobada'"),
      executeQuery("SELECT COUNT(*) as total FROM productos WHERE activo = 1"),
      executeQuery("SELECT COUNT(*) as total FROM usuarios WHERE activo = 1"),
      executeQuery("SELECT COUNT(*) as total FROM cotizaciones WHERE estado = 'borrador'"),
    ])

    const stats = {
      totalCotizaciones: totalCotizacionesResult[0]?.total || 0,
      cotizacionesAprobadas: cotizacionesAprobadasResult[0]?.total || 0,
      totalProductos: totalProductosResult[0]?.total || 0,
      totalUsuarios: totalUsuariosResult[0]?.total || 0,
      ventasDelMes: 0,
      cotizacionesPendientes: cotizacionesPendientesResult[0]?.total || 0,
    }

    console.log("[v0] Estadísticas obtenidas:", stats)
    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("[v0] Error obteniendo estadísticas:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Error al obtener estadísticas",
      },
      { status: 500 }
    )
  }
}
