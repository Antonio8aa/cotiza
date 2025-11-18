"use client"

// Componente para listar cotizaciones
import { useState, useEffect } from "react"
import { Search, Eye, Edit, FileText, Calendar, Download, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import type { Cotizacion } from "@/lib/types"

interface CotizacionListProps {
  showAllUsers?: boolean // Para admin ver todas las cotizaciones
}

export function CotizacionList({ showAllUsers = false }: CotizacionListProps) {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEstado, setSelectedEstado] = useState<string>("all")

  useEffect(() => {
    loadCotizaciones()
  }, [])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadCotizaciones()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery, selectedEstado])

  const loadCotizaciones = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append("query", searchQuery)
      if (selectedEstado !== "all") params.append("estado", selectedEstado)

      const response = await fetch(`/api/cotizaciones?${params.toString()}`, {
        credentials: "include",
      })

      const data = await response.json()
      console.log("Respuesta de la API:", data)

      if (data.success) {
        setCotizaciones(data.data)
        console.log("Cotizaciones cargadas:", data.data.length)
      } else {
        console.error("Error en la respuesta:", data.message)
      }
    } catch (error) {
      console.error("Error cargando cotizaciones:", error)
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

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const downloadPDF = async (cotizacionId: number, numeroCotizacion: string) => {
    try {
      const response = await fetch(`/api/cotizaciones/${cotizacionId}/pdf`, {
        credentials: "include",
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `cotizacion-${numeroCotizacion}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        console.error("Error descargando PDF")
      }
    } catch (error) {
      console.error("Error descargando PDF:", error)
    }
  }

  const sendWhatsApp = async (cotizacion: Cotizacion) => {
    try {
      // Primero descargar el PDF
      const response = await fetch(`/api/cotizaciones/${cotizacion.id}/pdf`, {
        credentials: "include",
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `cotizacion-${cotizacion.numero_cotizacion}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        // Mostrar alerta con instrucciones
        alert(
          `PDF descargado exitosamente como "cotizacion-${cotizacion.numero_cotizacion}.pdf".\n\nEn WhatsApp:\n1. Selecciona el contacto\n2. Haz clic en el ícono de adjuntar (📎)\n3. Selecciona "Documento"\n4. Busca y selecciona el archivo PDF descargado\n5. Envía el mensaje`,
        )

        // Crear mensaje para WhatsApp
        const mensaje = `Hola ${cotizacion.cliente_nombre},\n\nTe envío la cotización ${cotizacion.numero_cotizacion} por un total de ${formatPrice(cotizacion.total)}.\n\nEl archivo PDF se ha descargado automáticamente en tu dispositivo. Por favor adjúntalo a este mensaje.\n\n¡Gracias por tu confianza en Grupo Lite!`

        // Abrir WhatsApp con el mensaje
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(mensaje)}`
        window.open(whatsappUrl, "_blank")
      } else {
        console.error("Error descargando PDF para WhatsApp")
        alert("Error al descargar el PDF. Por favor intenta nuevamente.")
      }
    } catch (error) {
      console.error("Error enviando por WhatsApp:", error)
      alert("Error al procesar la solicitud. Por favor intenta nuevamente.")
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {showAllUsers ? "Todas las Cotizaciones" : "Mis Cotizaciones"}
          </CardTitle>
          <Link href="/cotizaciones/nueva">
            <Button className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Nueva Cotización
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por número, cliente o empresa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedEstado} onValueChange={setSelectedEstado}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="borrador">Borrador</SelectItem>
              <SelectItem value="enviada">Enviada</SelectItem>
              <SelectItem value="aprobada">Aprobada</SelectItem>
              <SelectItem value="rechazada">Rechazada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabla de cotizaciones */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Fecha</TableHead>
                {showAllUsers && <TableHead>Usuario</TableHead>}
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={showAllUsers ? 8 : 7} className="text-center py-8">
                    Cargando cotizaciones...
                  </TableCell>
                </TableRow>
              ) : cotizaciones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={showAllUsers ? 8 : 7} className="text-center py-8 text-muted-foreground">
                    No se encontraron cotizaciones
                  </TableCell>
                </TableRow>
              ) : (
                cotizaciones.map((cotizacion) => (
                  <TableRow key={cotizacion.id}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {cotizacion.numero_cotizacion}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{cotizacion.cliente_nombre}</div>
                        {cotizacion.cliente_empresa && (
                          <div className="text-sm text-muted-foreground">{cotizacion.cliente_empresa}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{cotizacion.proyecto_nombre || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={getEstadoBadgeVariant(cotizacion.estado)} className="capitalize">
                        {cotizacion.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{formatPrice(cotizacion.total)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {formatDate(cotizacion.fecha_creacion)}
                      </div>
                    </TableCell>
                    {showAllUsers && (
                      <TableCell>
                        <span className="text-sm">{cotizacion.usuario?.nombre}</span>
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/cotizaciones/${cotizacion.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/cotizaciones/${cotizacion.id}/editar`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => downloadPDF(cotizacion.id, cotizacion.numero_cotizacion)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => sendWhatsApp(cotizacion)}
                          title="Enviar por WhatsApp"
                        >
                          <MessageCircle className="h-4 w-4" />
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
  )
}
