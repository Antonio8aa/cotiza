"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Bell, Check, X, Eye } from "lucide-react"
import Link from "next/link"

interface SolicitudProducto {
  id: number
  codigo: string
  nombre: string
  descripcion: string
  marca_nombre: string
  precio_base: number
  categoria: string
  tiempo_entrega: string
  usuario_nombre: string
  usuario_email: string
  estado: string
  fecha_solicitud: string
}

export default function AdminNotificacionesPage() {
  const { user } = useAuth()
  const [solicitudes, setSolicitudes] = useState<SolicitudProducto[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudProducto | null>(null)
  const [comentarios, setComentarios] = useState("")
  const [procesando, setProcesando] = useState(false)

  useEffect(() => {
    if (!user || user.rol !== "admin") {
      return
    }
    loadSolicitudes()
  }, [user])

  const loadSolicitudes = async () => {
    try {
      const response = await fetch("/api/admin/solicitudes-productos", {
        credentials: "include",
      })
      const data = await response.json()

      if (data.success) {
        setSolicitudes(data.data)
      }
    } catch (error) {
      console.error("Error cargando solicitudes:", error)
    } finally {
      setLoading(false)
    }
  }

  const procesarSolicitud = async (id: number, accion: "aprobar" | "rechazar") => {
    setProcesando(true)
    try {
      const response = await fetch("/api/admin/solicitudes-productos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, accion, comentarios }),
      })

      const data = await response.json()

      if (data.success) {
        await loadSolicitudes()
        setSelectedSolicitud(null)
        setComentarios("")
        alert(`Solicitud ${accion === "aprobar" ? "aprobada" : "rechazada"} exitosamente`)
      } else {
        alert(data.error || "Error procesando solicitud")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error de conexión")
    } finally {
      setProcesando(false)
    }
  }

  if (!user || user.rol !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Acceso Denegado</h1>
          <p className="text-sm text-muted-foreground">No tienes permisos para acceder al panel de administración.</p>
          <Link href="/dashboard">
            <Button>Volver al Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  const solicitudesPendientes = solicitudes.filter((s) => s.estado === "pendiente")

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b bg-card px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-lg p-2">
              <Bell className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">Solicitudes de Productos</h1>
              <p className="text-sm text-muted-foreground">Gestiona las solicitudes de nuevos productos</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Solicitudes Pendientes ({solicitudesPendientes.length})</span>
                <Badge variant="secondary">{solicitudes.length} total</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Marca</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Solicitante</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          Cargando solicitudes...
                        </TableCell>
                      </TableRow>
                    ) : solicitudes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No hay solicitudes de productos
                        </TableCell>
                      </TableRow>
                    ) : (
                      solicitudes.map((solicitud) => (
                        <TableRow key={solicitud.id}>
                          <TableCell className="font-medium">{solicitud.nombre}</TableCell>
                          <TableCell>{solicitud.codigo}</TableCell>
                          <TableCell>{solicitud.marca_nombre}</TableCell>
                          <TableCell>${solicitud.precio_base?.toLocaleString()}</TableCell>
                          <TableCell>{solicitud.usuario_nombre}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                solicitud.estado === "pendiente"
                                  ? "secondary"
                                  : solicitud.estado === "aprobado"
                                    ? "default"
                                    : "destructive"
                              }
                            >
                              {solicitud.estado}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(solicitud.fecha_solicitud).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" onClick={() => setSelectedSolicitud(solicitud)}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Detalles de Solicitud</DialogTitle>
                                  </DialogHeader>
                                  {selectedSolicitud && (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium">Producto:</label>
                                          <p>{selectedSolicitud.nombre}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Código:</label>
                                          <p>{selectedSolicitud.codigo}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Marca:</label>
                                          <p>{selectedSolicitud.marca_nombre}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Precio:</label>
                                          <p>${selectedSolicitud.precio_base?.toLocaleString()}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Categoría:</label>
                                          <p>{selectedSolicitud.categoria || "No especificada"}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Tiempo de entrega:</label>
                                          <p>{selectedSolicitud.tiempo_entrega || "No especificado"}</p>
                                        </div>
                                      </div>

                                      <div>
                                        <label className="text-sm font-medium">Descripción:</label>
                                        <p>{selectedSolicitud.descripcion || "Sin descripción"}</p>
                                      </div>

                                      <div>
                                        <label className="text-sm font-medium">Solicitado por:</label>
                                        <p>
                                          {selectedSolicitud.usuario_nombre} ({selectedSolicitud.usuario_email})
                                        </p>
                                      </div>

                                      {selectedSolicitud.estado === "pendiente" && (
                                        <div className="space-y-3">
                                          <div>
                                            <label className="text-sm font-medium">Comentarios (opcional):</label>
                                            <Textarea
                                              value={comentarios}
                                              onChange={(e) => setComentarios(e.target.value)}
                                              placeholder="Agregar comentarios sobre la decisión..."
                                            />
                                          </div>

                                          <div className="flex justify-end gap-2">
                                            <Button
                                              variant="destructive"
                                              onClick={() => procesarSolicitud(selectedSolicitud.id, "rechazar")}
                                              disabled={procesando}
                                            >
                                              <X className="h-4 w-4 mr-2" />
                                              Rechazar
                                            </Button>
                                            <Button
                                              onClick={() => procesarSolicitud(selectedSolicitud.id, "aprobar")}
                                              disabled={procesando}
                                            >
                                              <Check className="h-4 w-4 mr-2" />
                                              Aprobar
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
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
