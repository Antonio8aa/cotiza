"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { MainNav } from "@/components/layout/main-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, FileText, Users, Settings, Plus, BarChart3, TrendingUp, Clock, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface DashboardStats {
  totalCotizaciones: number
  cotizacionesAprobadas: number
  totalProductos: number
  totalUsuarios: number
  ventasDelMes: number
  cotizacionesPendientes: number
}

interface CotizacionReciente {
  id: number
  numero_cotizacion: string
  cliente_nombre: string
  cliente_empresa: string
  estado: string
  total: number
  fecha_creacion: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalCotizaciones: 0,
    cotizacionesAprobadas: 0,
    totalProductos: 0,
    totalUsuarios: 0,
    ventasDelMes: 0,
    cotizacionesPendientes: 0,
  })
  const [cotizacionesRecientes, setCotizacionesRecientes] = useState<CotizacionReciente[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      const [statsResponse, cotizacionesResponse] = await Promise.all([
        user?.rol === "admin" ? fetch("/api/admin/estadisticas", { credentials: "include" }) : null,
        fetch("/api/cotizaciones?limit=5", { credentials: "include" }),
      ])

      if (user?.rol === "admin" && statsResponse) {
        const statsData = await statsResponse.json()
        if (statsData.success) {
          setStats(statsData.data)
        }
      }

      if (cotizacionesResponse) {
        const cotizacionesData = await cotizacionesResponse.json()
        if (cotizacionesData.success) {
          setCotizacionesRecientes(cotizacionesData.data)
        }
      }
    } catch (error) {
      console.error("Error cargando datos del dashboard:", error)
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (!user) {
    return <div>Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Bienvenido, {user.nombre}</h2>
          <p className="text-muted-foreground">
            Gestiona cotizaciones, productos y clientes desde tu panel de control.
          </p>
        </div>

        {user.rol === "admin" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cotizaciones</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : stats.totalCotizaciones}</div>
                <p className="text-xs text-muted-foreground">{stats.cotizacionesPendientes} pendientes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cotizaciones Aprobadas</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : stats.cotizacionesAprobadas}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalCotizaciones > 0
                    ? `${Math.round((stats.cotizacionesAprobadas / stats.totalCotizaciones) * 100)}% de conversión`
                    : "Sin datos"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : stats.totalProductos}</div>
                <p className="text-xs text-muted-foreground">En catálogo</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuarios Registrados</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : stats.totalUsuarios}</div>
                <p className="text-xs text-muted-foreground">Total en sistema</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Nueva Cotización
              </CardTitle>
              <CardDescription>Crear una nueva cotización para un cliente</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/cotizaciones/nueva">
                <Button className="w-full">Crear Cotización</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Mis Cotizaciones
              </CardTitle>
              <CardDescription>Ver y gestionar cotizaciones existentes</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/cotizaciones">
                <Button variant="outline" className="w-full bg-transparent">
                  Ver Cotizaciones
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Catálogo de Productos
              </CardTitle>
              <CardDescription>Explorar catálogo de productos y luminarias</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/productos">
                <Button variant="outline" className="w-full bg-transparent">
                  Ver Productos
                </Button>
              </Link>
            </CardContent>
          </Card>

          {user.rol === "admin" && (
            <>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Panel de Administración
                  </CardTitle>
                  <CardDescription>Acceder al panel de administración completo</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/admin">
                    <Button variant="outline" className="w-full bg-transparent">
                      Ir a Admin
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Gestión de Usuarios
                  </CardTitle>
                  <CardDescription>Administrar usuarios del sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/admin/usuarios">
                    <Button variant="outline" className="w-full bg-transparent">
                      Gestionar Usuarios
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Configuración del Sistema
                  </CardTitle>
                  <CardDescription>Configurar descuentos, utilidades y formas de pago</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/admin/configuracion">
                    <Button variant="outline" className="w-full bg-transparent">
                      Configurar Sistema
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Actividad Reciente
              </CardTitle>
              <CardDescription>Tus últimas cotizaciones</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Cargando actividad reciente...</div>
              ) : cotizacionesRecientes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay actividad reciente</p>
                  <p className="text-sm">Crea tu primera cotización para comenzar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cotizacionesRecientes.map((cotizacion) => (
                    <div
                      key={cotizacion.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="font-mono text-xs">
                            {cotizacion.numero_cotizacion}
                          </Badge>
                          <Badge variant={getEstadoBadgeVariant(cotizacion.estado)} className="capitalize text-xs">
                            {cotizacion.estado}
                          </Badge>
                        </div>
                        <div className="font-medium">{cotizacion.cliente_nombre}</div>
                        {cotizacion.cliente_empresa && (
                          <div className="text-sm text-muted-foreground">{cotizacion.cliente_empresa}</div>
                        )}
                        <div className="text-sm text-muted-foreground">
                          {formatDate(cotizacion.fecha_creacion)} • {formatPrice(cotizacion.total)}
                        </div>
                      </div>
                      <Link href={`/cotizaciones/${cotizacion.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                  <div className="text-center pt-4">
                    <Link href="/cotizaciones">
                      <Button variant="outline" size="sm">
                        Ver todas las cotizaciones
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
