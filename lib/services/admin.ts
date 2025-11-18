// Servicios administrativos para gestión del sistema
import { executeQuery } from "@/lib/database"
import { hashPassword } from "@/lib/auth-server"
import type { Usuario, Marca, DescuentoMarca, ConfiguracionUtilidad, FormaPago } from "@/lib/types"

// ===== GESTIÓN DE USUARIOS =====

export async function getUsuarios(): Promise<Usuario[]> {
  const sql = `
    SELECT id, nombre, email, rol, activo, fecha_creacion, fecha_actualizacion
    FROM usuarios 
    ORDER BY fecha_creacion DESC
  `
  return await executeQuery<Usuario>(sql)
}

export async function createUsuario(userData: {
  nombre: string
  email: string
  password: string
  rol: "admin" | "usuario"
}): Promise<Usuario> {
  const hashedPassword = await hashPassword(userData.password)

  const sql = `
    INSERT INTO usuarios (nombre, email, password_hash, rol)
    OUTPUT INSERTED.id, INSERTED.nombre, INSERTED.email, INSERTED.rol, INSERTED.activo, INSERTED.fecha_creacion, INSERTED.fecha_actualizacion
    VALUES (@nombre, @email, @password_hash, @rol)
  `

  const result = await executeQuery<Usuario>(sql, {
    nombre: userData.nombre,
    email: userData.email,
    password_hash: hashedPassword,
    rol: userData.rol,
  })

  return result[0]
}

export async function updateUsuario(
  id: number,
  userData: Partial<{ nombre: string; email: string; rol: "admin" | "usuario"; activo: boolean }>,
): Promise<Usuario | null> {
  const updateFields = []
  const params: Record<string, any> = { id }

  if (userData.nombre !== undefined) {
    updateFields.push("nombre = @nombre")
    params.nombre = userData.nombre
  }
  if (userData.email !== undefined) {
    updateFields.push("email = @email")
    params.email = userData.email
  }
  if (userData.rol !== undefined) {
    updateFields.push("rol = @rol")
    params.rol = userData.rol
  }
  if (userData.activo !== undefined) {
    updateFields.push("activo = @activo")
    params.activo = userData.activo ? 1 : 0
  }

  if (updateFields.length === 0) return null

  const sql = `
    UPDATE usuarios 
    SET ${updateFields.join(", ")}
    OUTPUT INSERTED.id, INSERTED.nombre, INSERTED.email, INSERTED.rol, INSERTED.activo, INSERTED.fecha_creacion, INSERTED.fecha_actualizacion
    WHERE id = @id
  `

  const result = await executeQuery<Usuario>(sql, params)
  return result.length > 0 ? result[0] : null
}

// ===== GESTIÓN DE MARCAS =====

export async function createMarca(marcaData: { nombre: string; descripcion?: string }): Promise<Marca> {
  const sql = `
    INSERT INTO marcas (nombre, descripcion)
    OUTPUT INSERTED.*
    VALUES (@nombre, @descripcion)
  `

  const result = await executeQuery<Marca>(sql, {
    nombre: marcaData.nombre,
    descripcion: marcaData.descripcion || null,
  })

  return result[0]
}

export async function updateMarca(
  id: number,
  marcaData: Partial<{ nombre: string; descripcion: string; activo: boolean }>,
): Promise<Marca | null> {
  const updateFields = []
  const params: Record<string, any> = { id }

  if (marcaData.nombre !== undefined) {
    updateFields.push("nombre = @nombre")
    params.nombre = marcaData.nombre
  }
  if (marcaData.descripcion !== undefined) {
    updateFields.push("descripcion = @descripcion")
    params.descripcion = marcaData.descripcion
  }
  if (marcaData.activo !== undefined) {
    updateFields.push("activo = @activo")
    params.activo = marcaData.activo ? 1 : 0
  }

  if (updateFields.length === 0) return null

  const sql = `
    UPDATE marcas 
    SET ${updateFields.join(", ")}
    OUTPUT INSERTED.*
    WHERE id = @id
  `

  const result = await executeQuery<Marca>(sql, params)
  return result.length > 0 ? result[0] : null
}

// ===== GESTIÓN DE DESCUENTOS POR MARCA =====

export async function getDescuentosMarca(): Promise<DescuentoMarca[]> {
  const sql = `
    SELECT dm.*, m.nombre as marca_nombre
    FROM descuentos_marca dm
    INNER JOIN marcas m ON dm.marca_id = m.id
    ORDER BY m.nombre
  `
  return await executeQuery<DescuentoMarca>(sql)
}

export async function createDescuentoMarca(descuentoData: {
  marca_id: number
  porcentaje_descuento: number
  descripcion?: string
}): Promise<DescuentoMarca> {
  const sql = `
    INSERT INTO descuentos_marca (marca_id, porcentaje_descuento, descripcion)
    OUTPUT INSERTED.*
    VALUES (@marca_id, @porcentaje_descuento, @descripcion)
  `

  const result = await executeQuery<DescuentoMarca>(sql, {
    marca_id: descuentoData.marca_id,
    porcentaje_descuento: descuentoData.porcentaje_descuento,
    descripcion: descuentoData.descripcion || null,
  })

  return result[0]
}

export async function updateDescuentoMarca(
  id: number,
  descuentoData: Partial<{ porcentaje_descuento: number; descripcion: string; activo: boolean }>,
): Promise<DescuentoMarca | null> {
  const updateFields = []
  const params: Record<string, any> = { id }

  if (descuentoData.porcentaje_descuento !== undefined) {
    updateFields.push("porcentaje_descuento = @porcentaje_descuento")
    params.porcentaje_descuento = descuentoData.porcentaje_descuento
  }
  if (descuentoData.descripcion !== undefined) {
    updateFields.push("descripcion = @descripcion")
    params.descripcion = descuentoData.descripcion
  }
  if (descuentoData.activo !== undefined) {
    updateFields.push("activo = @activo")
    params.activo = descuentoData.activo ? 1 : 0
  }

  if (updateFields.length === 0) return null

  const sql = `
    UPDATE descuentos_marca 
    SET ${updateFields.join(", ")}
    OUTPUT INSERTED.*
    WHERE id = @id
  `

  const result = await executeQuery<DescuentoMarca>(sql, params)
  return result.length > 0 ? result[0] : null
}

// ===== GESTIÓN DE UTILIDADES =====

export async function getUtilidadesAdmin(): Promise<ConfiguracionUtilidad[]> {
  const sql = "SELECT * FROM configuracion_utilidades ORDER BY porcentaje"
  return await executeQuery<ConfiguracionUtilidad>(sql)
}

export async function createUtilidad(utilidadData: {
  nombre: string
  porcentaje: number
  descripcion?: string
}): Promise<ConfiguracionUtilidad> {
  const sql = `
    INSERT INTO configuracion_utilidades (nombre, porcentaje, descripcion)
    OUTPUT INSERTED.*
    VALUES (@nombre, @porcentaje, @descripcion)
  `

  const result = await executeQuery<ConfiguracionUtilidad>(sql, {
    nombre: utilidadData.nombre,
    porcentaje: utilidadData.porcentaje,
    descripcion: utilidadData.descripcion || null,
  })

  return result[0]
}

export async function updateUtilidad(
  id: number,
  utilidadData: Partial<{ nombre: string; porcentaje: number; descripcion: string; activo: boolean }>,
): Promise<ConfiguracionUtilidad | null> {
  const updateFields = []
  const params: Record<string, any> = { id }

  if (utilidadData.nombre !== undefined) {
    updateFields.push("nombre = @nombre")
    params.nombre = utilidadData.nombre
  }
  if (utilidadData.porcentaje !== undefined) {
    updateFields.push("porcentaje = @porcentaje")
    params.porcentaje = utilidadData.porcentaje
  }
  if (utilidadData.descripcion !== undefined) {
    updateFields.push("descripcion = @descripcion")
    params.descripcion = utilidadData.descripcion
  }
  if (utilidadData.activo !== undefined) {
    updateFields.push("activo = @activo")
    params.activo = utilidadData.activo ? 1 : 0
  }

  if (updateFields.length === 0) return null

  const sql = `
    UPDATE configuracion_utilidades 
    SET ${updateFields.join(", ")}
    OUTPUT INSERTED.*
    WHERE id = @id
  `

  const result = await executeQuery<ConfiguracionUtilidad>(sql, params)
  return result.length > 0 ? result[0] : null
}

// ===== GESTIÓN DE FORMAS DE PAGO =====

export async function getFormasPagoAdmin(): Promise<FormaPago[]> {
  const sql = "SELECT * FROM formas_pago ORDER BY nombre"
  return await executeQuery<FormaPago>(sql)
}

export async function createFormaPago(formaPagoData: {
  nombre: string
  descripcion?: string
  descuento_porcentaje?: number
}): Promise<FormaPago> {
  const sql = `
    INSERT INTO formas_pago (nombre, descripcion, descuento_porcentaje)
    OUTPUT INSERTED.*
    VALUES (@nombre, @descripcion, @descuento_porcentaje)
  `

  const result = await executeQuery<FormaPago>(sql, {
    nombre: formaPagoData.nombre,
    descripcion: formaPagoData.descripcion || null,
    descuento_porcentaje: formaPagoData.descuento_porcentaje || 0,
  })

  return result[0]
}

export async function updateFormaPago(
  id: number,
  formaPagoData: Partial<{ nombre: string; descripcion: string; descuento_porcentaje: number; activo: boolean }>,
): Promise<FormaPago | null> {
  const updateFields = []
  const params: Record<string, any> = { id }

  if (formaPagoData.nombre !== undefined) {
    updateFields.push("nombre = @nombre")
    params.nombre = formaPagoData.nombre
  }
  if (formaPagoData.descripcion !== undefined) {
    updateFields.push("descripcion = @descripcion")
    params.descripcion = formaPagoData.descripcion
  }
  if (formaPagoData.descuento_porcentaje !== undefined) {
    updateFields.push("descuento_porcentaje = @descuento_porcentaje")
    params.descuento_porcentaje = formaPagoData.descuento_porcentaje
  }
  if (formaPagoData.activo !== undefined) {
    updateFields.push("activo = @activo")
    params.activo = formaPagoData.activo ? 1 : 0
  }

  if (updateFields.length === 0) return null

  const sql = `
    UPDATE formas_pago 
    SET ${updateFields.join(", ")}
    OUTPUT INSERTED.*
    WHERE id = @id
  `

  const result = await executeQuery<FormaPago>(sql, params)
  return result.length > 0 ? result[0] : null
}

// ===== ESTADÍSTICAS Y REPORTES =====

export async function getEstadisticasAdmin() {
  const [totalUsuarios, totalProductos, totalCotizaciones, cotizacionesPorEstado, ventasPorMes, productosPopulares] =
    await Promise.all([
      executeQuery<{ total: number }>("SELECT COUNT(*) as total FROM usuarios WHERE activo = 1"),
      executeQuery<{ total: number }>("SELECT COUNT(*) as total FROM productos WHERE activo = 1"),
      executeQuery<{ total: number }>("SELECT COUNT(*) as total FROM cotizaciones"),
      executeQuery<{ estado: string; cantidad: number }>(
        "SELECT estado, COUNT(*) as cantidad FROM cotizaciones GROUP BY estado",
      ),
      executeQuery<{ mes: string; total: number; cantidad: number }>(
        `SELECT 
        FORMAT(fecha_creacion, 'yyyy-MM') as mes,
        SUM(total) as total,
        COUNT(*) as cantidad
      FROM cotizaciones 
      WHERE fecha_creacion >= DATEADD(month, -6, GETDATE())
      GROUP BY FORMAT(fecha_creacion, 'yyyy-MM')
      ORDER BY mes DESC`,
      ),
      executeQuery<{ producto_nombre: string; cantidad_total: number }>(
        `SELECT TOP 10
        p.nombre as producto_nombre,
        SUM(dc.cantidad) as cantidad_total
      FROM detalle_cotizaciones dc
      INNER JOIN productos p ON dc.producto_id = p.id
      GROUP BY p.nombre
      ORDER BY cantidad_total DESC`,
      ),
    ])

  return {
    resumen: {
      totalUsuarios: totalUsuarios[0]?.total || 0,
      totalProductos: totalProductos[0]?.total || 0,
      totalCotizaciones: totalCotizaciones[0]?.total || 0,
    },
    cotizacionesPorEstado,
    ventasPorMes,
    productosPopulares,
  }
}
