// Servicios para gestión de productos
import { executeQuery } from "@/lib/database"
import type { Producto, ProductoSearch, Marca } from "@/lib/types"

export interface ProductoConMarca extends Producto {
  marca_nombre: string
  descuento_porcentaje?: number
}

// Obtener todos los productos con filtros
export async function getProductos(filters: ProductoSearch = {}): Promise<ProductoConMarca[]> {
  const { query, marca_id, categoria, activo = true, limit = 50, offset = 0 } = filters

  const whereConditions = ["p.activo = @activo"]
  const params: Record<string, any> = { activo: activo ? 1 : 0 }

  if (query) {
    whereConditions.push("(p.nombre LIKE @query OR p.codigo LIKE @query OR p.descripcion LIKE @query)")
    params.query = `%${query}%`
  }

  if (marca_id) {
    whereConditions.push("p.marca_id = @marca_id")
    params.marca_id = marca_id
  }

  if (categoria) {
    whereConditions.push("p.categoria LIKE @categoria")
    params.categoria = `%${categoria}%`
  }

  params.limit = limit
  params.offset = offset

  const sql = `
    SELECT 
      p.*,
      m.nombre as marca_nombre,
      dm.porcentaje_descuento
    FROM productos p
    INNER JOIN marcas m ON p.marca_id = m.id
    LEFT JOIN descuentos_marca dm ON m.id = dm.marca_id AND dm.activo = 1
    WHERE ${whereConditions.join(" AND ")}
    ORDER BY p.nombre
    OFFSET @offset ROWS
    FETCH NEXT @limit ROWS ONLY
  `

  return await executeQuery<ProductoConMarca>(sql, params)
}

// Obtener producto por ID
export async function getProductoById(id: number): Promise<ProductoConMarca | null> {
  const sql = `
    SELECT 
      p.*,
      m.nombre as marca_nombre,
      dm.porcentaje_descuento
    FROM productos p
    INNER JOIN marcas m ON p.marca_id = m.id
    LEFT JOIN descuentos_marca dm ON m.id = dm.marca_id AND dm.activo = 1
    WHERE p.id = @id
  `

  const productos = await executeQuery<ProductoConMarca>(sql, { id })
  return productos.length > 0 ? productos[0] : null
}

// Crear nuevo producto
export async function createProducto(
  producto: Omit<Producto, "id" | "fecha_creacion" | "fecha_actualizacion">,
): Promise<Producto> {
  const sql = `
    INSERT INTO productos (codigo, nombre, descripcion, marca_id, precio_base, variable_plano, categoria, especificaciones, imagen_url)
    VALUES (@codigo, @nombre, @descripcion, @marca_id, @precio_base, @variable_plano, @categoria, @especificaciones, @imagen_url);
    SELECT CAST(SCOPE_IDENTITY() as int) as id;
  `

  const params = {
    codigo: producto.codigo,
    nombre: producto.nombre,
    descripcion: producto.descripcion || null,
    marca_id: producto.marca_id,
    precio_base: producto.precio_base,
    variable_plano: producto.variable_plano || null,
    categoria: producto.categoria || null,
    especificaciones: producto.especificaciones ? JSON.stringify(producto.especificaciones) : null,
    imagen_url: (producto as any).imagen_url || null,
  }

  const result = await executeQuery<{ id: number }>(sql, params)
  if (result.length === 0) throw new Error("Failed to create producto")
  
  return (await getProductoById(result[0].id))!
}

// Actualizar producto
export async function updateProducto(id: number, producto: Partial<Producto>): Promise<Producto | null> {
  const updateFields = []
  const params: Record<string, any> = { id }

  if (producto.codigo !== undefined) {
    updateFields.push("codigo = @codigo")
    params.codigo = producto.codigo
  }
  if (producto.nombre !== undefined) {
    updateFields.push("nombre = @nombre")
    params.nombre = producto.nombre
  }
  if (producto.descripcion !== undefined) {
    updateFields.push("descripcion = @descripcion")
    params.descripcion = producto.descripcion
  }
  if (producto.marca_id !== undefined) {
    updateFields.push("marca_id = @marca_id")
    params.marca_id = producto.marca_id
  }
  if (producto.precio_base !== undefined) {
    updateFields.push("precio_base = @precio_base")
    params.precio_base = producto.precio_base
  }
  if (producto.variable_plano !== undefined) {
    updateFields.push("variable_plano = @variable_plano")
    params.variable_plano = producto.variable_plano
  }
  if (producto.categoria !== undefined) {
    updateFields.push("categoria = @categoria")
    params.categoria = producto.categoria
  }
  if (producto.especificaciones !== undefined) {
    updateFields.push("especificaciones = @especificaciones")
    params.especificaciones = producto.especificaciones ? JSON.stringify(producto.especificaciones) : null
  }
  if (producto.activo !== undefined) {
    updateFields.push("activo = @activo")
    params.activo = producto.activo ? 1 : 0
  }
  if ((producto as any).imagen_url !== undefined) {
    updateFields.push("imagen_url = @imagen_url")
    params.imagen_url = (producto as any).imagen_url
  }

  if (updateFields.length === 0) {
    return null
  }

  const sql = `
    UPDATE productos 
    SET ${updateFields.join(", ")}
    WHERE id = @id
  `

  await executeQuery(sql, params)
  
  return await getProductoById(id)
}

// Eliminar producto (soft delete)
export async function deleteProducto(id: number): Promise<boolean> {
  const sql = "UPDATE productos SET activo = 0 WHERE id = @id"
  const result = await executeQuery(sql, { id })
  return result.length > 0
}

// Obtener todas las marcas
export async function getMarcas(): Promise<Marca[]> {
  const sql = "SELECT * FROM marcas WHERE activo = 1 ORDER BY nombre"
  return await executeQuery<Marca>(sql)
}

// Obtener categorías únicas
export async function getCategorias(): Promise<string[]> {
  const sql = "SELECT DISTINCT categoria FROM productos WHERE categoria IS NOT NULL AND activo = 1 ORDER BY categoria"
  const result = await executeQuery<{ categoria: string }>(sql)
  return result.map((r) => r.categoria)
}

// Buscar productos para cotización (con información de descuentos)
export async function searchProductosParaCotizacion(query: string, limit = 20): Promise<ProductoConMarca[]> {
  const sql = `
    SELECT TOP (@limit)
      p.*,
      m.nombre as marca_nombre,
      dm.porcentaje_descuento
    FROM productos p
    INNER JOIN marcas m ON p.marca_id = m.id
    LEFT JOIN descuentos_marca dm ON m.id = dm.marca_id AND dm.activo = 1
    WHERE p.activo = 1 
      AND (p.nombre LIKE @query OR p.codigo LIKE @query OR p.descripcion LIKE @query)
    ORDER BY 
      CASE 
        WHEN p.codigo LIKE @exactQuery THEN 1
        WHEN p.nombre LIKE @exactQuery THEN 2
        ELSE 3
      END,
      p.nombre
  `

  const params = {
    query: `%${query}%`,
    exactQuery: `${query}%`,
    limit,
  }

  return await executeQuery<ProductoConMarca>(sql, params)
}
