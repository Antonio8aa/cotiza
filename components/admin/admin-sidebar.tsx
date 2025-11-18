"use client"

// Sidebar de navegación para panel de administración
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Users,
  Package,
  Settings,
  BarChart3,
  FileText,
  Building2,
  ChevronLeft,
  ChevronRight,
  Percent,
  CreditCard,
  TrendingUp,
  ArrowLeft,
  Bell,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: BarChart3,
  },
  {
    title: "Usuarios",
    href: "/admin/usuarios",
    icon: Users,
  },
  {
    title: "Productos",
    href: "/admin/productos",
    icon: Package,
  },
  {
    title: "Cotizaciones",
    href: "/admin/cotizaciones",
    icon: FileText,
  },
  {
    title: "Notificaciones",
    href: "/admin/notificaciones",
    icon: Bell,
  },
  {
    title: "Configuración",
    href: "/admin/configuracion",
    icon: Settings,
    submenu: [
      { title: "Descuentos", href: "/admin/configuracion/descuentos", icon: Percent },
      { title: "Utilidades", href: "/admin/configuracion/utilidades", icon: TrendingUp },
      { title: "Formas de Pago", href: "/admin/configuracion/formas-pago", icon: CreditCard },
    ],
  },
]

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div className={cn("bg-card border-r transition-all duration-300", collapsed ? "w-16" : "w-64")}>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="bg-primary rounded-lg p-2">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-primary">Admin Panel</h2>
                <p className="text-xs text-muted-foreground">Grupo Lite</p>
              </div>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="h-8 w-8 p-0">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <div className="p-4 border-b">
          <Link href="/cotizaciones">
            <Button variant="outline" size="sm" className={cn("w-full", collapsed && "px-2")}>
              <ArrowLeft className="h-4 w-4" />
              {!collapsed && <span className="ml-2">Ir a Cotizaciones</span>}
            </Button>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <div key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href && "bg-primary text-primary-foreground",
                  collapsed && "justify-center",
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>

              {/* Submenu */}
              {item.submenu && !collapsed && pathname.startsWith(item.href) && (
                <div className="ml-4 mt-2 space-y-1">
                  {item.submenu.map((subitem) => (
                    <Link
                      key={subitem.href}
                      href={subitem.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        pathname === subitem.href && "bg-secondary text-secondary-foreground",
                      )}
                    >
                      <subitem.icon className="h-3 w-3 flex-shrink-0" />
                      <span>{subitem.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  )
}
