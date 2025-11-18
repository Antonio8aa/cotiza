// Sistema de autenticación para Grupo Lite
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { executeQuery } from "./database"
import type { Usuario } from "./types"

const JWT_SECRET = process.env.JWT_SECRET || "grupo-lite-secret-key"
const JWT_EXPIRES_IN = "7d"

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  nombre: string
  email: string
  password: string
  rol?: "admin" | "usuario"
}

export interface AuthResult {
  success: boolean
  user?: Usuario
  token?: string
  message?: string
}

// Función para hashear contraseñas
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

// Función para verificar contraseñas
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

// Función para generar JWT token
export function generateToken(user: Usuario): string {
  const payload = {
    id: user.id,
    email: user.email,
    rol: user.rol,
    nombre: user.nombre,
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

// Función para verificar JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Función de login
export async function loginUser(credentials: LoginCredentials): Promise<AuthResult> {
  try {
    const { email, password } = credentials

    // Buscar usuario por email
    const users = await executeQuery<Usuario>("SELECT * FROM usuarios WHERE email = @email AND activo = 1", { email })

    if (users.length === 0) {
      return { success: false, message: "Credenciales inválidas" }
    }

    const user = users[0]

    // Verificar contraseña
    const isValidPassword = await verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      return { success: false, message: "Credenciales inválidas" }
    }

    // Generar token
    const token = generateToken(user)

    // Remover password_hash del objeto usuario
    const { password_hash, ...userWithoutPassword } = user

    return {
      success: true,
      user: userWithoutPassword as Usuario,
      token,
      message: "Login exitoso",
    }
  } catch (error) {
    console.error("Error en login:", error)
    return { success: false, message: "Error interno del servidor" }
  }
}

// Función de registro
export async function registerUser(userData: RegisterData): Promise<AuthResult> {
  try {
    const { nombre, email, password, rol = "usuario" } = userData

    // Verificar si el email ya existe
    const existingUsers = await executeQuery<Usuario>("SELECT id FROM usuarios WHERE email = @email", { email })

    if (existingUsers.length > 0) {
      return { success: false, message: "El email ya está registrado" }
    }

    // Hashear contraseña
    const hashedPassword = await hashPassword(password)

    // Insertar nuevo usuario
    const result = await executeQuery(
      `INSERT INTO usuarios (nombre, email, password_hash, rol) 
       OUTPUT INSERTED.* 
       VALUES (@nombre, @email, @password_hash, @rol)`,
      {
        nombre,
        email,
        password_hash: hashedPassword,
        rol,
      },
    )

    if (result.length === 0) {
      return { success: false, message: "Error al crear usuario" }
    }

    const newUser = result[0]
    const token = generateToken(newUser)

    // Remover password_hash del objeto usuario
    const { password_hash, ...userWithoutPassword } = newUser

    return {
      success: true,
      user: userWithoutPassword as Usuario,
      token,
      message: "Usuario registrado exitosamente",
    }
  } catch (error) {
    console.error("Error en registro:", error)
    return { success: false, message: "Error interno del servidor" }
  }
}

// Función para obtener usuario por token
export async function getUserFromToken(token: string): Promise<Usuario | null> {
  try {
    const decoded = verifyToken(token)
    if (!decoded) return null

    const users = await executeQuery<Usuario>("SELECT * FROM usuarios WHERE id = @id AND activo = 1", {
      id: decoded.id,
    })

    if (users.length === 0) return null

    const { password_hash, ...userWithoutPassword } = users[0]
    return userWithoutPassword as Usuario
  } catch (error) {
    console.error("Error al obtener usuario:", error)
    return null
  }
}
