// API endpoint para configuraciones de cotización
import { type NextRequest, NextResponse } from "next/server"
import { getConfiguracionesCotizacion } from "@/lib/services/cotizaciones"
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

    const configuraciones = await getConfiguracionesCotizacion()
    return NextResponse.json({ success: true, data: configuraciones })
  } catch (error) {
    console.error("Error obteniendo configuraciones:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
