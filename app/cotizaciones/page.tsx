"use client"

// Página principal de cotizaciones para usuarios
import { MainNav } from "@/components/layout/main-nav"
import { CotizacionList } from "@/components/cotizaciones/cotizacion-list"
import { useAuth } from "@/contexts/auth-context"

export default function CotizacionesPage() {
  const { user } = useAuth()

  if (!user) {
    return <div>Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Cotizaciones</h1>
          <p className="text-muted-foreground">Gestiona y revisa tus cotizaciones</p>
        </div>

        <CotizacionList />
      </main>
    </div>
  )
}
