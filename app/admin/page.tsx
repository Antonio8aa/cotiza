"use client"

// Dashboard principal de administración
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminStats } from "@/components/admin/admin-stats"
import { NotificationBell } from "@/components/admin/notification-bell" // importando campana de notificaciones
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Building2 } from "lucide-react"
import Link from "next/link"

export default function AdminDashboardPage() {
  const { user, logout } = useAuth()

  if (!user || user.rol !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Acceso Denegado</h1>
          <p className="text-muted-foreground mb-4">No tienes permisos para acceder al panel de administración.</p>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary rounded-lg p-2">
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">Panel de Administración</h1>
                <p className="text-sm text-muted-foreground">Dashboard y estadísticas del sistema</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <div className="text-right">
                <p className="font-medium">{user.nombre}</p>
                <p className="text-sm text-muted-foreground capitalize">{user.rol}</p>
              </div>
              <Button variant="outline" onClick={logout}>
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Bienvenido, {user.nombre}</h2>
            <p className="text-muted-foreground">
              Gestiona usuarios, productos, configuraciones y revisa las estadísticas del sistema.
            </p>
          </div>

          <AdminStats />
        </main>
      </div>
    </div>
  )
}
