// API endpoint para registro
import { type NextRequest, NextResponse } from "next/server"
import { registerUser } from "@/lib/auth-server"

export async function POST(request: NextRequest) {
  try {
    const { nombre, email, password, rol } = await request.json()

    if (!nombre || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Nombre, email y contraseña son requeridos" },
        { status: 400 },
      )
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 },
      )
    }

    const result = await registerUser({ nombre, email, password, rol })

    if (result.success) {
      return NextResponse.json(result, { status: 201 })
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error("Error en API register:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
