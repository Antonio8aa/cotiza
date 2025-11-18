"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Search, Eye, Download } from "lucide-react"
import Link from "next/link"
import type { Cotizacion } from "@/lib/types"

export default function AdminCotizacionesPage() {
  const { user } = useAuth()
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!user || user.rol !== "admin") {
      return
    }
    loadCotizaciones()
  }, [user])

  const loadCotizaciones = async () => {
    try {
      const response = await fetch("/api/cotizaciones")
      const data = await response.json()

      if (data.success) {
        setCotizaciones(data.data)
      }
    } catch (error) {
      console.error("Error cargando cotizaciones:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCotizaciones = cotizaciones.filter(
    (cotizacion) =>
      cotizacion.numero_cotizacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cotizacion.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cotizacion.cliente_email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "borrador":
        return <Badge variant="secondary">Borrador</Badge>
      case "enviada":
        return <Badge variant="default">Enviada</Badge>
      case "aprobada":
        return (
          <Badge variant="default" className="bg-green-500">
            Aprobada
          </Badge>
        )
      case "rechazada":
        return <Badge variant="destructive">Rechazada</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  if (!user || user.rol !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Acceso Denegado</h1>
          <p className="text-sm text-muted-foreground mb-4">
            No tienes permisos para acceder al panel de administración.
          </p>
          <Link href="/dashboard">
            <Button>Volver al Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b bg-card px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-lg p-2">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">Gestión de Cotizaciones</h1>
              <p className="text-sm text-muted-foreground">Administra todas las cotizaciones del sistema</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Todas las Cotizaciones
                </CardTitle>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar cotizaciones..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Cargando cotizaciones...
                        </TableCell>
                      </TableRow>
                    ) : filteredCotizaciones.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {searchTerm ? "No se encontraron cotizaciones" : "No hay cotizaciones registradas"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCotizaciones.map((cotizacion) => (
                        <TableRow key={cotizacion.id}>
                          <TableCell className="font-medium">{cotizacion.numero_cotizacion}</TableCell>
                          <TableCell>{cotizacion.cliente_nombre}</TableCell>
                          <TableCell>{cotizacion.cliente_email}</TableCell>
                          <TableCell>${cotizacion.total.toLocaleString()}</TableCell>
                          <TableCell>{getStatusBadge(cotizacion.estado)}</TableCell>
                          <TableCell>{new Date(cotizacion.fecha_creacion).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/cotizaciones/${cotizacion.id}`}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
