"use client"

// Componente de estadísticas para dashboard administrativo
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Package, FileText, TrendingUp, BarChart3 } from "lucide-react"

interface EstadisticasData {
  resumen: {
    totalUsuarios: number
    totalProductos: number
    totalCotizaciones: number
  }
  cotizacionesPorEstado: { estado: string; cantidad: number }[]
  ventasPorMes: { mes: string; total: number; cantidad: number }[]
  productosPopulares: { producto_nombre: string; cantidad_total: number }[]
}

export function AdminStats() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEstadisticas()
  }, [])

  const loadEstadisticas = async () => {
    try {
      const response = await fetch("/api/admin/estadisticas")
      const data = await response.json()

      if (data.success) {
        setEstadisticas(data.data)
      }
    } catch (error) {
      console.error("Error cargando estadísticas:", error)
    } finally {
      setLoading(false)
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

  if (loading) {
    return <div className="text-center py-8">Cargando estadísticas...</div>
  }

  if (!estadisticas) {
    return <div className="text-center py-8 text-muted-foreground">Error cargando estadísticas</div>
  }

  return (
    <div className="space-y-6">
      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.resumen.totalUsuarios}</div>
            <p className="text-xs text-muted-foreground">Usuarios activos en el sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.resumen.totalProductos}</div>
            <p className="text-xs text-muted-foreground">Productos en catálogo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cotizaciones</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.resumen.totalCotizaciones}</div>
            <p className="text-xs text-muted-foreground">Cotizaciones generadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Cotizaciones por Estado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Cotizaciones por Estado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {estadisticas.cotizacionesPorEstado.map((item) => (
              <div key={item.estado} className="flex items-center gap-2">
                <Badge variant={getEstadoBadgeVariant(item.estado)} className="capitalize">
                  {item.estado}
                </Badge>
                <span className="font-medium">{item.cantidad}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ventas por Mes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Ventas Últimos 6 Meses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {estadisticas.ventasPorMes.map((item) => (
              <div key={item.mes} className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.mes}</span>
                <div className="text-right">
                  <div className="font-medium">{formatPrice(item.total)}</div>
                  <div className="text-xs text-muted-foreground">{item.cantidad} cotizaciones</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Productos Populares */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Productos Más Cotizados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {estadisticas.productosPopulares.map((item, index) => (
              <div key={item.producto_nombre} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <span className="text-sm font-medium">{item.producto_nombre}</span>
                </div>
                <span className="font-medium">{item.cantidad_total} unidades</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
