"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainNav } from "@/components/layout/main-nav"
import { CotizacionFormComponent } from "@/components/cotizaciones/cotizacion-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

interface CotizacionData {
  id: number
  numero_cotizacion: string
  cliente_nombre: string
  cliente_email: string
  cliente_telefono: string
  cliente_empresa: string
  proyecto_nombre: string
  observaciones: string
  estado: string
  total: number
  forma_pago_id: number
  fecha_posible_venta: string
  detalles: Array<{
    producto_id: number
    cantidad: number
    precio_unitario: number
    descuento: number
    subtotal: number
    producto: {
      nombre: string
      codigo: string
      marca: string
    }
  }>
}

export default function EditarCotizacionPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const cotizacionId = Number.parseInt(params.id)
  const [cotizacion, setCotizacion] = useState<CotizacionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && cotizacionId) {
      loadCotizacion()
    }
  }, [user, cotizacionId])

  const loadCotizacion = async () => {
    try {
      const response = await fetch(`/api/cotizaciones/${cotizacionId}`, {
        credentials: "include",
      })
      const data = await response.json()

      if (data.success) {
        setCotizacion(data.data)
      } else {
        toast.error("Error al cargar la cotización")
        router.push("/cotizaciones")
      }
    } catch (error) {
      console.error("Error cargando cotización:", error)
      toast.error("Error al cargar la cotización")
      router.push("/cotizaciones")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData: any) => {
    try {
      const response = await fetch(`/api/cotizaciones/${cotizacionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Cotización actualizada exitosamente")
        router.push(`/cotizaciones/${cotizacionId}`)
      } else {
        toast.error(data.message || "Error al actualizar la cotización")
      }
    } catch (error) {
      console.error("Error actualizando cotización:", error)
      toast.error("Error al actualizar la cotización")
    }
  }

  if (!user) {
    return <div>Cargando...</div>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Cargando cotización...</div>
        </main>
      </div>
    )
  }

  if (!cotizacion) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Cotización no encontrada</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href={`/cotizaciones/${cotizacionId}`}>
            <Button variant="ghost" className="flex items-center gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Volver a Detalle
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Editar Cotización {cotizacion.numero_cotizacion}</h1>
        </div>

        <CotizacionFormComponent
          onSubmit={handleSubmit}
          initialData={{
            cliente_nombre: cotizacion.cliente_nombre,
            cliente_email: cotizacion.cliente_email,
            cliente_telefono: cotizacion.cliente_telefono,
            cliente_empresa: cotizacion.cliente_empresa,
            proyecto_nombre: cotizacion.proyecto_nombre || "",
            observaciones: cotizacion.observaciones,
            forma_pago_id: cotizacion.forma_pago_id || 1,
            fecha_posible_venta: cotizacion.fecha_posible_venta
              ? new Date(cotizacion.fecha_posible_venta).toISOString().split("T")[0]
              : "",
            productos:
              cotizacion.detalles?.map((detalle) => ({
                id: detalle.producto_id,
                nombre: detalle.producto?.nombre || "Producto sin nombre",
                codigo: detalle.producto?.codigo || "",
                marca: detalle.producto?.marca || "",
                precio: detalle.precio_unitario,
                cantidad: detalle.cantidad,
                descuento: detalle.descuento || 0,
              })) || [],
          }}
        />
      </main>
    </div>
  )
}
