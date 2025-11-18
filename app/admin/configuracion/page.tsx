"use client"

// Página principal de configuración del sistema
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Percent, TrendingUp, CreditCard, Settings } from "lucide-react"
import Link from "next/link"

export default function ConfiguracionPage() {
  const { user } = useAuth()

  if (!user || user.rol !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Acceso Denegado</h1>
          <p className="text-muted-foreground mb-4">No tienes permisos para acceder a esta sección.</p>
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
              <Settings className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">Configuración del Sistema</h1>
              <p className="text-sm text-muted-foreground">Gestiona descuentos, utilidades y formas de pago</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="h-5 w-5 text-primary" />
                  Descuentos por Marca
                </CardTitle>
                <CardDescription>Configura los descuentos aplicables según la marca de las luminarias</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/configuracion/descuentos">
                  <Button className="w-full">Gestionar Descuentos</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Niveles de Utilidad
                </CardTitle>
                <CardDescription>Configura los 4 porcentajes de utilidad disponibles para cotizaciones</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/configuracion/utilidades">
                  <Button className="w-full">Gestionar Utilidades</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Formas de Pago
                </CardTitle>
                <CardDescription>Administra las formas de pago y sus descuentos asociados</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/configuracion/formas-pago">
                  <Button className="w-full">Gestionar Formas de Pago</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
