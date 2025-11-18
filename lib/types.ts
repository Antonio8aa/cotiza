// Tipos TypeScript para el sistema de cotizaciones Grupo Lite

export interface Usuario {
  id: number
  nombre: string
  email: string
  rol: "admin" | "usuario"
  activo: boolean
  fecha_creacion: Date
  fecha_actualizacion: Date
}

export interface Marca {
  id: number
  nombre: string
  descripcion?: string
  activo: boolean
  fecha_creacion: Date
}

export interface Producto {
  id: number
  codigo: string
  nombre: string
  descripcion?: string
  marca_id: number
  marca?: Marca
  precio_base: number
  variable_plano?: string
  categoria?: string
  especificaciones?: Record<string, any>
  activo: boolean
  fecha_creacion: Date
  fecha_actualizacion: Date
}

export interface DescuentoMarca {
  id: number
  marca_id: number
  marca?: Marca
  porcentaje_descuento: number
  descripcion?: string
  activo: boolean
  fecha_creacion: Date
  fecha_actualizacion: Date
}

export interface ConfiguracionUtilidad {
  id: number
  nombre: string
  porcentaje: number
  descripcion?: string
  activo: boolean
  fecha_creacion: Date
  fecha_actualizacion: Date
}

export interface FormaPago {
  id: number
  nombre: string
  descripcion?: string
  descuento_porcentaje: number
  activo: boolean
  fecha_creacion: Date
}

export interface Cotizacion {
  id: number
  numero_cotizacion: string
  cliente_nombre: string
  cliente_email?: string
  cliente_telefono?: string
  cliente_empresa?: string
  proyecto_nombre?: string
  usuario_id: number
  usuario?: Usuario
  utilidad_id: number
  utilidad?: ConfiguracionUtilidad
  forma_pago_id: number
  forma_pago?: FormaPago
  subtotal: number
  descuento_total: number
  utilidad_total: number
  total: number
  estado: "borrador" | "enviada" | "aprobada" | "rechazada"
  observaciones?: string
  fecha_creacion: Date
  fecha_actualizacion: Date
  fecha_posible_venta?: Date
  detalles?: DetalleCotizacion[]
}

export interface DetalleCotizacion {
  id: number
  cotizacion_id: number
  producto_id: number
  producto?: Producto
  cantidad: number
  precio_unitario: number
  descuento_porcentaje: number
  precio_con_descuento: number
  subtotal: number
  variable_asignada?: string
  observaciones?: string
  utilidad_id?: number
  utilidad?: ConfiguracionUtilidad
}

export interface CotizacionForm {
  cliente_nombre: string
  cliente_email?: string
  cliente_telefono?: string
  cliente_empresa?: string
  proyecto_nombre?: string
  forma_pago_id: number
  observaciones?: string
  fecha_posible_venta?: Date
  productos: {
    producto_id: number
    cantidad: number
    variable_asignada?: string
    observaciones?: string
    utilidad_id?: number
  }[]
}

export interface ProductoSearch {
  query?: string
  marca_id?: number
  categoria?: string
  activo?: boolean
  limit?: number
  offset?: number
}

export interface CotizacionSearch {
  query?: string
  usuario_id?: number
  estado?: string
  fecha_desde?: Date
  fecha_hasta?: Date
  limit?: number
  offset?: number
}
