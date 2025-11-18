"use client"

// Página de detalle de cotización
import { MainNav } from "@/components/layout/main-nav"
import { CotizacionDetail } from "@/components/cotizaciones/cotizacion-detail"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export default function CotizacionDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const cotizacionId = Number.parseInt(params.id)

  if (!user) {
    return <div>Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/cotizaciones">
            <Button variant="ghost" className="flex items-center gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Volver a Cotizaciones
            </Button>
          </Link>
        </div>

        <CotizacionDetail cotizacionId={cotizacionId} />
      </main>
    </div>
  )
}
