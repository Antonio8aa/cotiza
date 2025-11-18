"use client"

// Componente para mostrar detalles de una cotización
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, User, Building2, Calendar, DollarSign, Package, Tag, Download, Send, CheckCircle, XCircle } from 'lucide-react'
import type { CotizacionCompleta } from "@/lib/services/cotizaciones"

interface CotizacionDetailProps {
  cotizacionId: number
  onStatusChange?: (newStatus: string) => void
  showActions?: boolean
}

export function CotizacionDetail({ cotizacionId, onStatusChange, showActions = true }: CotizacionDetailProps) {
  const [cotizacion, setCotizacion] = useState<CotizacionCompleta | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPdfMenu, setShowPdfMenu] = useState(false)

  useEffect(() => {
    loadCotizacion()
  }, [cotizacionId])

  const loadCotizacion = async () => {
    try {
      const response = await fetch(`/api/cotizaciones/${cotizacionId}`)
      const data = await response.json()

      if (data.success) {
        setCotizacion(data.data)
      }
    } catch (error) {
      console.error("Error cargando cotización:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/cotizaciones/${cotizacionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: newStatus }),
      })

      const data = await response.json()

      if (data.success) {
        setCotizacion((prev) => (prev ? { ...prev, estado: newStatus } : null))
        onStatusChange?.(newStatus)
        alert("Estado actualizado correctamente")
      } else {
        alert(data.message || "Error al actualizar estado")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error de conexión")
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(price)
  }

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case "aprobada":
        return "default"
      case "enviada":
        return "secondary"
      case "borrador":
        return "outline"
      case "rechazada":
        return "destructive"
      default:
        return "outline"
    }
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const downloadPDFHorizontal = async () => {
    if (!cotizacion) return
    try {
      const response = await fetch(`/api/cotizaciones/${cotizacion.id}/pdf-horizontal`)
      if (!response.ok) throw new Error("Error downloading PDF")
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `cotizacion-${cotizacion.numero_cotizacion}-horizontal.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading horizontal PDF:", error)
      alert("Error al descargar PDF")
    }
  }

  if (loading) {
    return <div className="text-center py-8">Cargando cotización...</div>
  }

  if (!cotizacion) {
    return <div className="text-center py-8 text-muted-foreground">Cotización no encontrada</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-6 w-6" />
                Cotización {cotizacion.numero_cotizacion}
              </CardTitle>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant={getEstadoBadgeVariant(cotizacion.estado)} className="capitalize">
                  {cotizacion.estado}
                </Badge>
                <span className="text-sm text-muted-foreground">Creada el {formatDate(cotizacion.fecha_creacion)}</span>
              </div>
            </div>

            {showActions && (
              <div className="flex items-center gap-2">
                {cotizacion.estado === "borrador" && (
                  <Button onClick={() => handleStatusChange("enviada")} className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Enviar
                  </Button>
                )}
                {cotizacion.estado === "enviada" && (
                  <>
                    <Button
                      onClick={() => handleStatusChange("aprobada")}
                      className="flex items-center gap-2"
                      variant="default"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Aprobar
                    </Button>
                    <Button
                      onClick={() => handleStatusChange("rechazada")}
                      className="flex items-center gap-2"
                      variant="destructive"
                    >
                      <XCircle className="h-4 w-4" />
                      Rechazar
                    </Button>
                  </>
                )}
                <div className="relative">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 bg-transparent"
                    onClick={() => setShowPdfMenu(!showPdfMenu)}
                  >
                    <Download className="h-4 w-4" />
                    Descargar PDF
                  </Button>
                  
                  {showPdfMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <button
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = `/api/cotizaciones/${cotizacion.id}/pdf`
                          link.download = `cotizacion-${cotizacion.numero_cotizacion}.pdf`
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                          setShowPdfMenu(false)
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b"
                      >
                        Formato Vertical (Estándar)
                      </button>
                      <button
                        onClick={() => {
                          downloadPDFHorizontal()
                          setShowPdfMenu(false)
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Formato Horizontal (Grupolite)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Información del Cliente */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información del Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nombre</label>
              <p className="font-medium">{cotizacion.cliente_nombre}</p>
            </div>
            {cotizacion.cliente_empresa && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Empresa</label>
                <p className="font-medium">{cotizacion.cliente_empresa}</p>
              </div>
            )}
            {cotizacion.cliente_email && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="font-medium">{cotizacion.cliente_email}</p>
              </div>
            )}
            {cotizacion.cliente_telefono && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                <p className="font-medium">{cotizacion.cliente_telefono}</p>
              </div>
            )}
            {cotizacion.proyecto_nombre && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Proyecto</label>
                <p className="font-medium">{cotizacion.proyecto_nombre}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Información de la Cotización
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Usuario</label>
              <p className="font-medium">{cotizacion.usuario?.nombre}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Utilidad</label>
              <p className="font-medium">{cotizacion.utilidad?.nombre}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Forma de Pago</label>
              <p className="font-medium">{cotizacion.forma_pago?.nombre}</p>
            </div>
            {cotizacion.fecha_vencimiento && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Vencimiento</label>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(cotizacion.fecha_vencimiento)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Productos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Productos Cotizados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Variable</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Precio Unit.</TableHead>
                  <TableHead>Descuento</TableHead>
                  <TableHead>Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cotizacion.detalles.map((detalle) => (
                  <TableRow key={detalle.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{detalle.producto?.nombre}</div>
                        {detalle.producto?.descripcion && (
                          <div className="text-sm text-muted-foreground mt-1">{detalle.producto.descripcion}</div>
                        )}
                        <div className="text-sm text-muted-foreground mt-1">
                          {detalle.producto?.codigo} - {detalle.producto?.marca?.nombre}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {detalle.variable_asignada ? (
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          <Tag className="h-3 w-3" />
                          {detalle.variable_asignada}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{detalle.cantidad}</TableCell>
                    <TableCell>{formatPrice(detalle.precio_unitario)}</TableCell>
                    <TableCell>
                      {detalle.descuento_porcentaje > 0 ? (
                        <Badge variant="destructive">-{detalle.descuento_porcentaje}%</Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{formatPrice(detalle.subtotal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Totales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Resumen de Precios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-medium">{formatPrice(cotizacion.subtotal)}</span>
            </div>
            <div className="flex justify-between text-destructive">
              <span>Descuentos:</span>
              <span className="font-medium">-{formatPrice(cotizacion.descuento_total)}</span>
            </div>
            <div className="flex justify-between text-primary">
              <span>Utilidad:</span>
              <span className="font-medium">+{formatPrice(cotizacion.utilidad_total)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>{formatPrice(cotizacion.total)}</span>
            </div>
          </div>

          {cotizacion.observaciones && (
            <div className="mt-6">
              <label className="text-sm font-medium text-muted-foreground">Observaciones</label>
              <p className="mt-1 text-sm bg-muted p-3 rounded-lg">{cotizacion.observaciones}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
