"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MainNav } from "@/components/layout/main-nav"
import { CotizacionFormComponent } from "@/components/cotizaciones/cotizacion-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { CotizacionForm } from "@/lib/types"

export default function NuevaCotizacionPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (cotizacionData: CotizacionForm) => {
    setLoading(true)
    try {
      const response = await fetch("/api/cotizaciones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Incluir cookies automáticamente
        body: JSON.stringify(cotizacionData),
      })

      const data = await response.json()

      if (data.success) {
        alert("Cotización creada exitosamente")
        router.push(`/cotizaciones/${data.data.id}`)
      } else {
        alert(data.message || "Error al crear cotización")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="flex items-center gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Volver al Dashboard
            </Button>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary">Nueva Cotización</h1>
            <p className="text-muted-foreground">Crear una nueva cotización para un cliente</p>
          </div>
        </div>

        <CotizacionFormComponent onSubmit={handleSubmit} loading={loading} />
      </main>
    </div>
  )
}
