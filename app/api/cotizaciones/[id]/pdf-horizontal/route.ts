import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserFromToken } from "@/lib/auth-server"
import { getCotizacionById } from "@/lib/services/cotizaciones"
import { generateCotizacionPDFHorizontal } from "@/lib/services/pdf"

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

    const cotizacionId = Number.parseInt(params.id)
    const cotizacion = await getCotizacionById(cotizacionId)

    if (!cotizacion) {
      return NextResponse.json({ success: false, message: "Cotización no encontrada" }, { status: 404 })
    }

    if (user.rol !== "admin" && cotizacion.usuario_id !== user.id) {
      return NextResponse.json(
        { success: false, message: "No tienes permisos para descargar esta cotización" },
        { status: 403 },
      )
    }

    const pdfBuffer = await generateCotizacionPDFHorizontal(cotizacion)

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="cotizacion-${cotizacion.numero_cotizacion}-horizontal.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generando PDF horizontal:", error)
    return NextResponse.json({ success: false, message: "Error generando PDF" }, { status: 500 })
  }
}
