// Servicios para gestión de cotizaciones
import { executeQuery } from "@/lib/database"
import type { Cotizacion, DetalleCotizacion, CotizacionForm, CotizacionSearch } from "@/lib/types"

export interface CotizacionCompleta extends Cotizacion {
  detalles: DetalleCotizacion[]
}

// Generar número de cotización único
export async function generateCotizacionNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, "0")

  // Obtener el último número de cotización del mes
  const result = await executeQuery<{ max_numero: number }>(
    `SELECT ISNULL(MAX(CAST(RIGHT(numero_cotizacion, 4) AS INT)), 0) as max_numero
     FROM cotizaciones 
     WHERE numero_cotizacion LIKE @prefix`,
    { prefix: `GL-${year}${month}-%` },
  )

  const nextNumber = (result[0]?.max_numero || 0) + 1
  return `GL-${year}${month}-${String(nextNumber).padStart(4, "0")}`
}

// Calcular precios con descuentos y utilidades
export function calcularPrecios(
  precioBase: number,
  cantidad: number,
  descuentoPorcentaje: number,
  utilidadPorcentaje: number,
  descuentoFormaPago = 0,
) {
  const subtotalSinDescuento = precioBase * cantidad
  const descuentoMarca = subtotalSinDescuento * (descuentoPorcentaje / 100)
  const subtotalConDescuentoMarca = subtotalSinDescuento - descuentoMarca

  // Aplicar utilidad sobre el precio con descuento de marca
  const utilidad = subtotalConDescuentoMarca * (utilidadPorcentaje / 100)
  const subtotalConUtilidad = subtotalConDescuentoMarca + utilidad

  // Aplicar descuento por forma de pago
  const descuentoFP = subtotalConUtilidad * (descuentoFormaPago / 100)
  const total = subtotalConUtilidad - descuentoFP

  return {
    precioUnitario: precioBase,
    precioConDescuento: precioBase * (1 - descuentoPorcentaje / 100),
    subtotalSinDescuento,
    descuentoMarca,
    subtotalConDescuentoMarca,
    utilidad,
    subtotalConUtilidad,
    descuentoFormaPago: descuentoFP,
    total,
  }
}

// Crear nueva cotización
export async function createCotizacion(cotizacionData: CotizacionForm, usuarioId: number): Promise<CotizacionCompleta> {
  const numeroCotizacion = await generateCotizacionNumber()

  console.log("[v0] Buscando forma de pago con ID:", cotizacionData.forma_pago_id)

  const formaPagoResult = await executeQuery("SELECT * FROM formas_pago WHERE id = @id", {
    id: cotizacionData.forma_pago_id,
  })
  console.log("[v0] Resultado forma de pago:", formaPagoResult)

  const formaPago = formaPagoResult[0]

  if (!formaPago) {
    console.log("[v0] Error: forma de pago encontrada:", !!formaPago)
    throw new Error("Forma de pago no encontrada")
  }

  // Calcular totales de la cotización
  let subtotalGeneral = 0
  let descuentoTotalGeneral = 0
  let utilidadTotalGeneral = 0

  const detallesCalculados = []

  // Variable para guardar utilidad_id para la cotización
  let utilidadIdParaCotizacion: number | null = null

  for (const item of cotizacionData.productos) {
    console.log("[v0] Procesando producto:", item.producto_id, "con utilidad_id:", item.utilidad_id)

    // Obtener producto con descuento de marca
    const [producto] = await executeQuery(
      `SELECT p.*, dm.porcentaje_descuento
       FROM productos p
       LEFT JOIN descuentos_marca dm ON p.marca_id = dm.marca_id AND dm.activo = 1
       WHERE p.id = @id`,
      { id: item.producto_id },
    )

    if (!producto) {
      throw new Error(`Producto con ID ${item.producto_id} no encontrado`)
    }

    let utilidadPorcentaje = 0
    if (item.utilidad_id) {
      console.log("[v0] Buscando utilidad para producto con ID:", item.utilidad_id)
      const utilidadResult = await executeQuery("SELECT * FROM configuracion_utilidades WHERE id = @id", {
        id: item.utilidad_id,
      })
      console.log("[v0] Resultado utilidad del producto:", utilidadResult)

      if (utilidadResult.length > 0) {
        utilidadPorcentaje = utilidadResult[0].porcentaje
        console.log("[v0] Utilidad encontrada, porcentaje:", utilidadPorcentaje)

        // Asignar utilidad_id para la cotización si aún no está asignado
        if (!utilidadIdParaCotizacion) {
          utilidadIdParaCotizacion = item.utilidad_id
        }
      } else {
        console.log("[v0] No se encontró utilidad para el producto")
      }
    } else {
      console.log("[v0] Producto sin utilidad asignada")
    }

    const descuentoPorcentaje = producto.porcentaje_descuento || 0
    const precios = calcularPrecios(
      producto.precio_base,
      item.cantidad,
      descuentoPorcentaje,
      utilidadPorcentaje,
      formaPago.descuento_porcentaje,
    )

    subtotalGeneral += precios.subtotalSinDescuento
    descuentoTotalGeneral += precios.descuentoMarca + precios.descuentoFormaPago
    utilidadTotalGeneral += precios.utilidad

    detallesCalculados.push({
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio_unitario: precios.precioUnitario,
      descuento_porcentaje: descuentoPorcentaje,
      precio_con_descuento: precios.precioConDescuento,
      subtotal: precios.total,
      variable_asignada: item.variable_asignada,
      observaciones: item.observaciones,
    })
  }

  if (!utilidadIdParaCotizacion) {
    throw new Error("No se encontró utilidad válida para asignar a la cotización")
  }

  const totalFinal = subtotalGeneral - descuentoTotalGeneral + utilidadTotalGeneral

  const [nuevaCotizacion] = await executeQuery(
    `INSERT INTO cotizaciones (
      numero_cotizacion, cliente_nombre, cliente_email, cliente_telefono, 
      cliente_empresa, proyecto_nombre, usuario_id, forma_pago_id, utilidad_id,
      subtotal, descuento_total, utilidad_total, total, observaciones, fecha_posible_venta
    )
    OUTPUT INSERTED.*
    VALUES (
      @numero_cotizacion, @cliente_nombre, @cliente_email, @cliente_telefono,
      @cliente_empresa, @proyecto_nombre, @usuario_id, @forma_pago_id, @utilidad_id,
      @subtotal, @descuento_total, @utilidad_total, @total, @observaciones, @fecha_posible_venta
    )`,
    {
      numero_cotizacion: numeroCotizacion,
      cliente_nombre: cotizacionData.cliente_nombre,
      cliente_email: cotizacionData.cliente_email || null,
      cliente_telefono: cotizacionData.cliente_telefono || null,
      cliente_empresa: cotizacionData.cliente_empresa || null,
      proyecto_nombre: cotizacionData.proyecto_nombre || null,
      usuario_id: usuarioId,
      forma_pago_id: cotizacionData.forma_pago_id,
      utilidad_id: utilidadIdParaCotizacion,
      subtotal: subtotalGeneral,
      descuento_total: descuentoTotalGeneral,
      utilidad_total: utilidadTotalGeneral,
      total: totalFinal,
      observaciones: cotizacionData.observaciones || null,
      fecha_posible_venta: cotizacionData.fecha_posible_venta || null,
    },
  )

  // Insertar detalles de cotización
  const detalles = []
  for (const detalle of detallesCalculados) {
    const [nuevoDetalle] = await executeQuery(
      `INSERT INTO detalle_cotizaciones (
        cotizacion_id, producto_id, cantidad, precio_unitario, descuento_porcentaje,
        precio_con_descuento, subtotal, variable_asignada, observaciones
      )
      OUTPUT INSERTED.*
      VALUES (
        @cotizacion_id, @producto_id, @cantidad, @precio_unitario, @descuento_porcentaje,
        @precio_con_descuento, @subtotal, @variable_asignada, @observaciones
      )`,
      {
        cotizacion_id: nuevaCotizacion.id,
        ...detalle,
      },
    )
    detalles.push(nuevoDetalle)
  }

  return {
    ...nuevaCotizacion,
    detalles,
  }
}

// Obtener cotizaciones con filtros
export async function getCotizaciones(filters: CotizacionSearch = {}): Promise<Cotizacion[]> {
  const { query, usuario_id, estado, fecha_desde, fecha_hasta, limit = 50, offset = 0 } = filters

  console.log("[getCotizaciones] Filtros recibidos:", filters)

  const whereConditions = ["1=1"]
  const params: Record<string, any> = {}

  if (query) {
    whereConditions.push(
      "(c.numero_cotizacion LIKE @query OR c.cliente_nombre LIKE @query OR c.cliente_empresa LIKE @query)",
    )
    params.query = `%${query}%`
  }

  if (usuario_id) {
    whereConditions.push("c.usuario_id = @usuario_id")
    params.usuario_id = usuario_id
  }

  if (estado) {
    whereConditions.push("c.estado = @estado")
    params.estado = estado
  }

  if (fecha_desde) {
    whereConditions.push("c.fecha_creacion >= @fecha_desde")
    params.fecha_desde = fecha_desde
  }

  if (fecha_hasta) {
    whereConditions.push("c.fecha_creacion <= @fecha_hasta")
    params.fecha_hasta = fecha_hasta
  }

  params.limit = limit
  params.offset = offset

  const sql = `
    SELECT 
      c.*,
      u.nombre as usuario_nombre,
      cu.nombre as utilidad_nombre,
      fp.nombre as forma_pago_nombre
    FROM cotizaciones c
    INNER JOIN usuarios u ON c.usuario_id = u.id
    INNER JOIN configuracion_utilidades cu ON c.utilidad_id = cu.id
    INNER JOIN formas_pago fp ON c.forma_pago_id = fp.id
    WHERE ${whereConditions.join(" AND ")}
    ORDER BY c.fecha_creacion DESC
    OFFSET @offset ROWS
    FETCH NEXT @limit ROWS ONLY
  `

  console.log("[getCotizaciones] SQL generado:", sql)
  console.log("[getCotizaciones] Parámetros:", params)

  const result = await executeQuery<Cotizacion>(sql, params)
  console.log("[getCotizaciones] Resultados encontrados:", result.length)

  return result
}

// Obtener cotización completa por ID
export async function getCotizacionById(id: number, usuarioId?: number): Promise<CotizacionCompleta | null> {
  const whereCondition = usuarioId ? "c.id = @id AND c.usuario_id = @usuario_id" : "c.id = @id"
  const params = usuarioId ? { id, usuario_id: usuarioId } : { id }

  const [cotizacion] = await executeQuery<Cotizacion>(
    `SELECT 
      c.*,
      u.nombre as usuario_nombre,
      cu.nombre as utilidad_nombre, cu.porcentaje as utilidad_porcentaje,
      fp.nombre as forma_pago_nombre, fp.descuento_porcentaje as forma_pago_descuento
    FROM cotizaciones c
    INNER JOIN usuarios u ON c.usuario_id = u.id
    INNER JOIN configuracion_utilidades cu ON c.utilidad_id = cu.id
    INNER JOIN formas_pago fp ON c.forma_pago_id = fp.id
    WHERE ${whereCondition}`,
    params,
  )

  if (!cotizacion) return null

  const detalles = await executeQuery<DetalleCotizacion>(
    `SELECT 
      dc.*,
      p.nombre as producto_nombre, p.codigo as producto_codigo, p.precio_base,
      m.nombre as marca_nombre,
      -- Crear objeto producto anidado para compatibilidad
      p.id as producto_id_nested,
      p.nombre as producto_nombre_nested,
      p.codigo as producto_codigo_nested,
      m.nombre as producto_marca_nested
    FROM detalle_cotizaciones dc
    INNER JOIN productos p ON dc.producto_id = p.id
    INNER JOIN marcas m ON p.marca_id = m.id
    WHERE dc.cotizacion_id = @cotizacion_id
    ORDER BY dc.id`,
    { cotizacion_id: id },
  )

  const detallesConProducto = detalles.map((detalle) => ({
    ...detalle,
    producto: {
      id: detalle.producto_id,
      nombre: detalle.producto_nombre_nested,
      codigo: detalle.producto_codigo_nested,
      marca: detalle.producto_marca_nested,
      precio_base: detalle.precio_base,
    },
  }))

  return {
    ...cotizacion,
    detalles: detallesConProducto,
  }
}

// Actualizar estado de cotización
export async function updateCotizacionEstado(id: number, estado: string): Promise<boolean> {
  // We need to check if the query executed successfully, not the result length
  try {
    await executeQuery("UPDATE cotizaciones SET estado = @estado WHERE id = @id", { id, estado })
    return true
  } catch (error) {
    console.error("[updateCotizacionEstado] Error updating estado:", error)
    return false
  }
}

// Obtener configuraciones para cotizaciones
export async function getConfiguracionesCotizacion() {
  const [utilidades, formasPago] = await Promise.all([
    executeQuery("SELECT * FROM configuracion_utilidades WHERE activo = 1 ORDER BY porcentaje"),
    executeQuery("SELECT * FROM formas_pago WHERE activo = 1 ORDER BY nombre"),
  ])

  return { utilidades, formasPago }
}

// Actualizar cotización completa
export async function updateCotizacion(
  id: number,
  cotizacionData: CotizacionForm,
  usuarioId: number,
): Promise<CotizacionCompleta | null> {
  // Verificar que la cotización existe y pertenece al usuario
  const cotizacionExistente = await getCotizacionById(id, usuarioId)
  if (!cotizacionExistente) {
    throw new Error("Cotización no encontrada")
  }

  // Solo permitir editar cotizaciones en estado borrador
  if (cotizacionExistente.estado !== "borrador") {
    throw new Error("Solo se pueden editar cotizaciones en estado borrador")
  }

  // Obtener forma de pago
  const formaPagoResult = await executeQuery("SELECT * FROM formas_pago WHERE id = @id", {
    id: cotizacionData.forma_pago_id,
  })
  const formaPago = formaPagoResult[0]

  if (!formaPago) {
    throw new Error("Forma de pago no encontrada")
  }

  // Calcular totales de la cotización
  let subtotalGeneral = 0
  let descuentoTotalGeneral = 0
  let utilidadTotalGeneral = 0

  const detallesCalculados = []
  let utilidadIdParaCotizacion: number | null = null

  for (const item of cotizacionData.productos) {
    // Obtener producto con descuento de marca
    const [producto] = await executeQuery(
      `SELECT p.*, dm.porcentaje_descuento
       FROM productos p
       LEFT JOIN descuentos_marca dm ON p.marca_id = dm.marca_id AND dm.activo = 1
       WHERE p.id = @id`,
      { id: item.producto_id },
    )

    if (!producto) {
      throw new Error(`Producto con ID ${item.producto_id} no encontrado`)
    }

    let utilidadPorcentaje = 0
    if (item.utilidad_id) {
      const utilidadResult = await executeQuery("SELECT * FROM configuracion_utilidades WHERE id = @id", {
        id: item.utilidad_id,
      })

      if (utilidadResult.length > 0) {
        utilidadPorcentaje = utilidadResult[0].porcentaje
        if (!utilidadIdParaCotizacion) {
          utilidadIdParaCotizacion = item.utilidad_id
        }
      }
    }

    const descuentoPorcentaje = producto.porcentaje_descuento || 0
    const precios = calcularPrecios(
      producto.precio_base,
      item.cantidad,
      descuentoPorcentaje,
      utilidadPorcentaje,
      formaPago.descuento_porcentaje,
    )

    subtotalGeneral += precios.subtotalSinDescuento
    descuentoTotalGeneral += precios.descuentoMarca + precios.descuentoFormaPago
    utilidadTotalGeneral += precios.utilidad

    detallesCalculados.push({
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio_unitario: precios.precioUnitario,
      descuento_porcentaje: descuentoPorcentaje,
      precio_con_descuento: precios.precioConDescuento,
      subtotal: precios.total,
      variable_asignada: item.variable_asignada,
      observaciones: item.observaciones,
    })
  }

  if (!utilidadIdParaCotizacion) {
    throw new Error("No se encontró utilidad válida para asignar a la cotización")
  }

  const totalFinal = subtotalGeneral - descuentoTotalGeneral + utilidadTotalGeneral

  // Actualizar cotización
  await executeQuery(
    `UPDATE cotizaciones SET
      cliente_nombre = @cliente_nombre,
      cliente_email = @cliente_email,
      cliente_telefono = @cliente_telefono,
      cliente_empresa = @cliente_empresa,
      proyecto_nombre = @proyecto_nombre,
      forma_pago_id = @forma_pago_id,
      utilidad_id = @utilidad_id,
      subtotal = @subtotal,
      descuento_total = @descuento_total,
      utilidad_total = @utilidad_total,
      total = @total,
      observaciones = @observaciones,
      fecha_posible_venta = @fecha_posible_venta,
      fecha_actualizacion = GETDATE()
    WHERE id = @id`,
    {
      id,
      cliente_nombre: cotizacionData.cliente_nombre,
      cliente_email: cotizacionData.cliente_email || null,
      cliente_telefono: cotizacionData.cliente_telefono || null,
      cliente_empresa: cotizacionData.cliente_empresa || null,
      proyecto_nombre: cotizacionData.proyecto_nombre || null,
      forma_pago_id: cotizacionData.forma_pago_id,
      utilidad_id: utilidadIdParaCotizacion,
      subtotal: subtotalGeneral,
      descuento_total: descuentoTotalGeneral,
      utilidad_total: utilidadTotalGeneral,
      total: totalFinal,
      observaciones: cotizacionData.observaciones || null,
      fecha_posible_venta: cotizacionData.fecha_posible_venta || null,
    },
  )

  // Eliminar detalles existentes
  await executeQuery("DELETE FROM detalle_cotizaciones WHERE cotizacion_id = @id", { id })

  // Insertar nuevos detalles
  const detalles = []
  for (const detalle of detallesCalculados) {
    const [nuevoDetalle] = await executeQuery(
      `INSERT INTO detalle_cotizaciones (
        cotizacion_id, producto_id, cantidad, precio_unitario, descuento_porcentaje,
        precio_con_descuento, subtotal, variable_asignada, observaciones
      )
      OUTPUT INSERTED.*
      VALUES (
        @cotizacion_id, @producto_id, @cantidad, @precio_unitario, @descuento_porcentaje,
        @precio_con_descuento, @subtotal, @variable_asignada, @observaciones
      )`,
      {
        cotizacion_id: id,
        ...detalle,
      },
    )
    detalles.push(nuevoDetalle)
  }

  // Retornar cotización actualizada
  return await getCotizacionById(id, usuarioId)
}
