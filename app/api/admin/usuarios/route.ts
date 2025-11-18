// API endpoints para gestión de usuarios
import { type NextRequest, NextResponse } from "next/server"
import { getUsuarios, createUsuario } from "@/lib/services/admin"
import { getUserFromToken } from "@/lib/auth-server"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] API usuarios - iniciando verificación de token")
    const token = request.cookies.get("auth-token")?.value
    console.log("[v0] Token extraído de cookies:", token ? "presente" : "ausente")

    if (!token) {
      console.log("[v0] Token no encontrado en cookies")
      return NextResponse.json({ success: false, message: "Token no encontrado" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    console.log("[v0] Usuario obtenido:", user ? { id: user.id, rol: user.rol } : "null")

    if (!user) {
      console.log("[v0] Token inválido o usuario no encontrado")
      return NextResponse.json({ success: false, message: "Token inválido" }, { status: 401 })
    }

    if (user.rol !== "admin") {
      console.log("[v0] Usuario no es admin:", user.rol)
      return NextResponse.json({ success: false, message: "Acceso denegado" }, { status: 403 })
    }

    console.log("[v0] Obteniendo usuarios de la base de datos")
    const usuarios = await getUsuarios()
    console.log("[v0] Usuarios obtenidos:", usuarios.length)
    return NextResponse.json({ success: true, data: usuarios })
  } catch (error) {
    console.error("[v0] Error obteniendo usuarios:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ success: false, message: "Token no encontrado" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ success: false, message: "Token inválido" }, { status: 401 })
    }

    if (user.rol !== "admin") {
      return NextResponse.json({ success: false, message: "Acceso denegado" }, { status: 403 })
    }

    const { nombre, email, password, rol } = await request.json()

    if (!nombre || !email || !password || !rol) {
      return NextResponse.json({ success: false, message: "Todos los campos son requeridos" }, { status: 400 })
    }

    const nuevoUsuario = await createUsuario({ nombre, email, password, rol })
    return NextResponse.json({ success: true, data: nuevoUsuario }, { status: 201 })
  } catch (error) {
    console.error("Error creando usuario:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
