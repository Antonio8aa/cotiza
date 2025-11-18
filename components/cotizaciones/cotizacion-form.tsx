"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Trash2, Calculator, FileText, User } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ProductSearch } from "@/components/productos/product-search"
import type { ProductoConMarca } from "@/lib/services/productos"
import type { CotizacionForm, ConfiguracionUtilidad, FormaPago } from "@/lib/types"

interface ProductoCotizacion extends ProductoConMarca {
  cantidad: number
  variable_asignada?: string
  observaciones?: string
  utilidad_id?: string
  tiempo_entrega?: string
  imagen_url?: string
}

interface InitialData {
  cliente_nombre?: string
  cliente_email?: string
  cliente_telefono?: string
  cliente_empresa?: string
  proyecto_nombre?: string
  observaciones?: string
  forma_pago_id?: number
  fecha_posible_venta?: string
  ubicacion_entrega?: string
  moneda?: string
  productos?: Array<{
    id: number
    nombre: string
    codigo: string
    marca: string
    precio: number
    cantidad: number
    descuento?: number
    variable_asignada?: string
    observaciones?: string
    utilidad_id?: string
    tiempo_entrega?: string
    imagen_url?: string
  }>
}

interface CotizacionFormProps {
  onSubmit: (cotizacion: CotizacionForm) => Promise<void>
  loading?: boolean
  initialData?: InitialData
}

export function CotizacionFormComponent({ onSubmit, loading = false, initialData }: CotizacionFormProps) {
  const [formData, setFormData] = useState({
    cliente_nombre: "",
    cliente_email: "",
    cliente_telefono: "",
    cliente_empresa: "",
    proyecto_nombre: "",
    utilidad_id: "",
    forma_pago_id: "",
    observaciones: "",
    fecha_posible_venta: "",
    ubicacion_entrega: "",
    moneda: "MXN",
  })

  const [productos, setProductos] = useState<ProductoCotizacion[]>([])
  const [utilidades, setUtilidades] = useState<ConfiguracionUtilidad[]>([])
  const [formasPago, setFormasPago] = useState<FormaPago[]>([])
  const [totales, setTotales] = useState({
    subtotal: 0,
    descuentoTotal: 0,
    utilidadTotal: 0,
    total: 0,
  })

  useEffect(() => {
    if (initialData) {
      console.log("[v0] Cargando datos iniciales:", initialData)
      setFormData({
        cliente_nombre: initialData.cliente_nombre || "",
        cliente_email: initialData.cliente_email || "",
        cliente_telefono: initialData.cliente_telefono || "",
        cliente_empresa: initialData.cliente_empresa || "",
        proyecto_nombre: initialData.proyecto_nombre || "",
        utilidad_id: "",
        forma_pago_id: initialData.forma_pago_id?.toString() || "",
        observaciones: initialData.observaciones || "",
        fecha_posible_venta: initialData.fecha_posible_venta || "",
        ubicacion_entrega: initialData.ubicacion_entrega || "",
        moneda: initialData.moneda || "MXN",
      })

      if (initialData.productos && initialData.productos.length > 0) {
        console.log("[v0] Cargando productos iniciales:", initialData.productos)
        const productosIniciales = initialData.productos.map((p) => ({
          id: p.id,
          nombre: p.nombre,
          codigo: p.codigo,
          marca_nombre: p.marca,
          precio_base: p.precio,
          cantidad: p.cantidad,
          descuento_porcentaje: p.descuento || 0,
          variable_asignada: p.variable_asignada || "",
          observaciones: p.observaciones || "",
          utilidad_id: p.utilidad_id || "0",
          tiempo_entrega: p.tiempo_entrega || "",
          imagen_url: p.imagen_url || "",
          // Campos adicionales requeridos por ProductoConMarca
          descripcion: "",
          marca_id: 0,
          categoria_id: 0,
          activo: true,
          fecha_creacion: new Date(),
          fecha_actualizacion: new Date(),
        }))
        setProductos(productosIniciales)
      }
    }
  }, [initialData])

  useEffect(() => {
    loadConfiguraciones()
  }, [])

  useEffect(() => {
    calcularTotales()
  }, [productos, formData.forma_pago_id])

  const loadConfiguraciones = async () => {
    try {
      const response = await fetch("/api/cotizaciones/configuracion")
      const data = await response.json()

      if (data.success) {
        setUtilidades(data.data.utilidades)
        setFormasPago(data.data.formasPago)
      }
    } catch (error) {
      console.error("Error cargando configuraciones:", error)
    }
  }

  const calcularTotales = () => {
    if (productos.length === 0) {
      setTotales({ subtotal: 0, descuentoTotal: 0, utilidadTotal: 0, total: 0 })
      return
    }

    const formaPago = formasPago.find((fp) => fp.id === Number.parseInt(formData.forma_pago_id))

    let subtotal = 0
    let descuentoTotal = 0
    let utilidadTotal = 0

    productos.forEach((producto) => {
      const subtotalProducto = producto.precio_base * producto.cantidad
      const descuentoMarca = subtotalProducto * ((producto.descuento_porcentaje || 0) / 100)
      const subtotalConDescuento = subtotalProducto - descuentoMarca

      subtotal += subtotalProducto
      descuentoTotal += descuentoMarca

      if (producto.utilidad_id && producto.utilidad_id !== "") {
        const utilidad = utilidades.find((u) => u.id === Number.parseInt(producto.utilidad_id!))
        if (utilidad) {
          const utilidadProducto = subtotalConDescuento * (utilidad.porcentaje / 100)
          utilidadTotal += utilidadProducto
        }
      }
    })

    const totalConUtilidad = subtotal - descuentoTotal + utilidadTotal
    const descuentoFormaPago = formaPago ? totalConUtilidad * (formaPago.descuento_porcentaje / 100) : 0
    const total = totalConUtilidad - descuentoFormaPago

    setTotales({
      subtotal,
      descuentoTotal: descuentoTotal + descuentoFormaPago,
      utilidadTotal,
      total,
    })
  }

  const handleProductSelect = (producto: ProductoConMarca) => {
    const existe = productos.find((p) => p.id === producto.id)
    if (existe) {
      setProductos(productos.map((p) => (p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p)))
    } else {
      setProductos([...productos, { ...producto, cantidad: 1, utilidad_id: "0", tiempo_entrega: "", imagen_url: "" }])
    }
  }

  const updateProducto = (id: number, field: string, value: any) => {
    console.log(`[v0] Actualizando producto ${id}, campo: ${field}, valor:`, value)
    const updatedProducts = productos.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    console.log(
      `[v0] Productos después de actualizar:`,
      updatedProducts.find((p) => p.id === id),
    )
    setProductos(updatedProducts)
  }

  const removeProducto = (id: number) => {
    setProductos(productos.filter((p) => p.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (productos.length === 0) {
      alert("Debe agregar al menos un producto")
      return
    }

    console.log("[v0] Productos antes de enviar:", productos)
    console.log(
      "[v0] Productos mapeados:",
      productos.map((p) => ({
        producto_id: p.id,
        cantidad: p.cantidad,
        variable_asignada: p.variable_asignada,
        observaciones: p.observaciones,
        utilidad_id_original: p.utilidad_id,
        utilidad_id_procesada:
          p.utilidad_id && p.utilidad_id !== "" && p.utilidad_id !== "0" ? Number.parseInt(p.utilidad_id) : undefined,
        tiempo_entrega: p.tiempo_entrega,
        imagen_url: p.imagen_url,
      })),
    )

    const cotizacionData: CotizacionForm = {
      ...formData,
      forma_pago_id: Number.parseInt(formData.forma_pago_id),
      fecha_posible_venta: formData.fecha_posible_venta ? new Date(formData.fecha_posible_venta) : undefined,
      productos: productos.map((p) => ({
        producto_id: p.id,
        cantidad: p.cantidad,
        variable_asignada: p.variable_asignada,
        observaciones: p.observaciones,
        utilidad_id:
          p.utilidad_id && p.utilidad_id !== "" && p.utilidad_id !== "0" ? Number.parseInt(p.utilidad_id) : undefined,
        tiempo_entrega: p.tiempo_entrega,
        imagen_url: p.imagen_url,
      })),
    }

    console.log("[v0] Datos finales de cotización:", cotizacionData)

    await onSubmit(cotizacionData)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: formData.moneda,
    }).format(price)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información del Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información del Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cliente_nombre">Nombre del Cliente *</Label>
            <Input
              id="cliente_nombre"
              value={formData.cliente_nombre}
              onChange={(e) => setFormData({ ...formData, cliente_nombre: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cliente_email">Email</Label>
            <Input
              id="cliente_email"
              type="email"
              value={formData.cliente_email}
              onChange={(e) => setFormData({ ...formData, cliente_email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cliente_telefono">Teléfono</Label>
            <Input
              id="cliente_telefono"
              value={formData.cliente_telefono}
              onChange={(e) => setFormData({ ...formData, cliente_telefono: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cliente_empresa">Empresa</Label>
            <Input
              id="cliente_empresa"
              value={formData.cliente_empresa}
              onChange={(e) => setFormData({ ...formData, cliente_empresa: e.target.value })}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="proyecto_nombre">Nombre del Proyecto</Label>
            <Input
              id="proyecto_nombre"
              value={formData.proyecto_nombre}
              onChange={(e) => setFormData({ ...formData, proyecto_nombre: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configuración de Cotización */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Configuración de Precios
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="forma_pago_id">Forma de Pago *</Label>
            <Select
              value={formData.forma_pago_id}
              onValueChange={(value) => setFormData({ ...formData, forma_pago_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar forma de pago" />
              </SelectTrigger>
              <SelectContent>
                {formasPago.map((formaPago) => (
                  <SelectItem key={formaPago.id} value={formaPago.id.toString()}>
                    {formaPago.nombre}
                    {formaPago.descuento_porcentaje > 0 && ` (-${formaPago.descuento_porcentaje}%)`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha_posible_venta">Fecha de Posible Venta</Label>
            <Input
              id="fecha_posible_venta"
              type="date"
              value={formData.fecha_posible_venta}
              onChange={(e) => setFormData({ ...formData, fecha_posible_venta: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Información de Entrega */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Entrega</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ubicacion_entrega">Ubicación de Entrega</Label>
            <Input
              id="ubicacion_entrega"
              placeholder="Ej: CDMX, Monterrey, Guadalajara"
              value={formData.ubicacion_entrega}
              onChange={(e) => setFormData({ ...formData, ubicacion_entrega: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="moneda">Moneda</Label>
            <Select
              value={formData.moneda}
              onValueChange={(value) => setFormData({ ...formData, moneda: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar moneda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MXN">MXN - Pesos Mexicanos</SelectItem>
                <SelectItem value="USD">USD - Dólares</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Productos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Productos de la Cotización
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProductSearch onProductSelect={handleProductSelect} placeholder="Buscar y agregar productos..." />

          {productos.length > 0 && (
            <div className="space-y-4">
              {productos.map((producto) => (
                <div key={producto.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium">{producto.nombre}</h4>
                      {producto.descripcion && (
                        <p className="text-sm text-muted-foreground mt-1">{producto.descripcion}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{producto.codigo}</Badge>
                        <Badge variant="secondary">{producto.marca_nombre}</Badge>
                        {producto.descuento_porcentaje && producto.descuento_porcentaje > 0 && (
                          <Badge variant="destructive">-{producto.descuento_porcentaje}%</Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProducto(producto.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Cantidad</Label>
                      <Input
                        type="number"
                        min="1"
                        value={producto.cantidad}
                        onChange={(e) => updateProducto(producto.id, "cantidad", Number.parseInt(e.target.value) || 1)}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Variable Plano</Label>
                      <Input
                        placeholder="ej: L1, P2"
                        value={producto.variable_asignada || ""}
                        onChange={(e) => updateProducto(producto.id, "variable_asignada", e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Tiempo de Entrega</Label>
                      <Input
                        placeholder="ej: 3-4 semanas"
                        value={producto.tiempo_entrega || ""}
                        onChange={(e) => updateProducto(producto.id, "tiempo_entrega", e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Utilidad</Label>
                      <Select
                        value={producto.utilidad_id || "0"}
                        onValueChange={(value) => {
                          console.log(`[v0] Seleccionando utilidad para producto ${producto.id}:`, value)
                          updateProducto(producto.id, "utilidad_id", value)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Sin utilidad</SelectItem>
                          {utilidades.map((utilidad) => (
                            <SelectItem key={utilidad.id} value={utilidad.id.toString()}>
                              {utilidad.nombre} ({utilidad.porcentaje}%)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Precio Unitario</Label>
                      <div className="text-sm font-medium py-2">{formatPrice(producto.precio_base)}</div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Subtotal</Label>
                      <div className="text-sm font-medium py-2">
                        {formatPrice(producto.precio_base * producto.cantidad)}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Imagen del Producto</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onload = (event) => {
                              updateProducto(producto.id, "imagen_url", event.target?.result as string)
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                      />
                      {producto.imagen_url && (
                        <div className="mt-2">
                          <img src={producto.imagen_url || "/placeholder.svg"} alt="Producto" className="h-16 w-16 object-cover rounded" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <Label className="text-xs">Observaciones</Label>
                    <Input
                      placeholder="Observaciones específicas del producto..."
                      value={producto.observaciones || ""}
                      onChange={(e) => updateProducto(producto.id, "observaciones", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Totales */}
      {productos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Cotización</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatPrice(totales.subtotal)}</span>
              </div>
              <div className="flex justify-between text-destructive">
                <span>Descuentos:</span>
                <span>-{formatPrice(totales.descuentoTotal)}</span>
              </div>
              <div className="flex justify-between text-primary">
                <span>Utilidad:</span>
                <span>+{formatPrice(totales.utilidadTotal)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatPrice(totales.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Observaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Observaciones Generales</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Observaciones adicionales de la cotización..."
            value={formData.observaciones}
            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Botones de Acción */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline">
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || productos.length === 0}>
          {loading ? "Creando..." : "Crear Cotización"}
        </Button>
      </div>
    </form>
  )
}
