// API endpoints para configuraciones administrativas
import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserFromToken } from "@/lib/auth-server"
import {
  getDescuentosMarca,
  getUtilidadesAdmin,
  getFormasPagoAdmin,
  createDescuentoMarca,
  createUtilidad,
  createFormaPago,
  updateDescuentoMarca,
  updateUtilidad,
  updateFormaPago,
} from "@/lib/services/admin"
import { getMarcas } from "@/lib/services/productos"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "Token no encontrado" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user || user.rol !== "admin") {
      return NextResponse.json({ success: false, message: "Acceso denegado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get("tipo")

    switch (tipo) {
      case "descuentos":
        const descuentos = await getDescuentosMarca()
        return NextResponse.json({ success: true, data: descuentos })

      case "utilidades":
        const utilidades = await getUtilidadesAdmin()
        return NextResponse.json({ success: true, data: utilidades })

      case "formas-pago":
        const formasPago = await getFormasPagoAdmin()
        return NextResponse.json({ success: true, data: formasPago })

      case "marcas":
        const marcas = await getMarcas()
        return NextResponse.json({ success: true, data: marcas })

      default:
        const [descuentosData, utilidadesData, formasPagoData, marcasData] = await Promise.all([
          getDescuentosMarca(),
          getUtilidadesAdmin(),
          getFormasPagoAdmin(),
          getMarcas(),
        ])

        return NextResponse.json({
          success: true,
          data: {
            descuentos: descuentosData,
            utilidades: utilidadesData,
            formasPago: formasPagoData,
            marcas: marcasData,
          },
        })
    }
  } catch (error) {
    console.error("Error obteniendo configuraciones:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "Token no encontrado" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user || user.rol !== "admin") {
      return NextResponse.json({ success: false, message: "Acceso denegado" }, { status: 403 })
    }

    const { tipo, ...data } = await request.json()

    switch (tipo) {
      case "descuento":
        const nuevoDescuento = await createDescuentoMarca(data)
        return NextResponse.json({ success: true, data: nuevoDescuento }, { status: 201 })

      case "utilidad":
        const nuevaUtilidad = await createUtilidad(data)
        return NextResponse.json({ success: true, data: nuevaUtilidad }, { status: 201 })

      case "forma-pago":
        const nuevaFormaPago = await createFormaPago(data)
        return NextResponse.json({ success: true, data: nuevaFormaPago }, { status: 201 })

      default:
        return NextResponse.json({ success: false, message: "Tipo no válido" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error creando configuración:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "Token no encontrado" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user || user.rol !== "admin") {
      return NextResponse.json({ success: false, message: "Acceso denegado" }, { status: 403 })
    }

    const { tipo, id, ...data } = await request.json()

    switch (tipo) {
      case "descuento":
        const descuentoActualizado = await updateDescuentoMarca(id, {
          porcentaje_descuento: Number.parseFloat(data.porcentaje),
        })
        return NextResponse.json({ success: true, data: descuentoActualizado })

      case "utilidad":
        const utilidadActualizada = await updateUtilidad(id, data)
        return NextResponse.json({ success: true, data: utilidadActualizada })

      case "forma-pago":
        const formaPagoActualizada = await updateFormaPago(id, data)
        return NextResponse.json({ success: true, data: formaPagoActualizada })

      default:
        return NextResponse.json({ success: false, message: "Tipo no válido" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error actualizando configuración:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "Token no encontrado" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user || user.rol !== "admin") {
      return NextResponse.json({ success: false, message: "Acceso denegado" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get("tipo")
    const id = searchParams.get("id")

    if (!tipo || !id) {
      return NextResponse.json({ success: false, message: "Parámetros faltantes" }, { status: 400 })
    }

    switch (tipo) {
      case "descuento":
        await updateDescuentoMarca(Number.parseInt(id), { activo: false })
        return NextResponse.json({ success: true })

      case "utilidad":
        await updateUtilidad(Number.parseInt(id), { activo: false })
        return NextResponse.json({ success: true })

      case "forma-pago":
        await updateFormaPago(Number.parseInt(id), { activo: false })
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ success: false, message: "Tipo no válido" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error eliminando configuración:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
