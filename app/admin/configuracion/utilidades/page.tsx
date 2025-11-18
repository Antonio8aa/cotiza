"use client"

import type React from "react"

// Gestión de niveles de utilidad
import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Plus, Edit, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Link from "next/link"

interface Utilidad {
  id: number
  nombre: string
  porcentaje: number
  descripcion: string
  activo: boolean
}

export default function UtilidadesPage() {
  const { user } = useAuth()
  const [utilidades, setUtilidades] = useState<Utilidad[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUtilidad, setEditingUtilidad] = useState<Utilidad | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    porcentaje: "",
    descripcion: "",
  })

  useEffect(() => {
    fetchUtilidades()
  }, [])

  const fetchUtilidades = async () => {
    try {
      const response = await fetch("/api/admin/configuracion?tipo=utilidades", {
        credentials: "include",
      })
      const data = await response.json()
      if (data.success) {
        setUtilidades(data.data)
      }
    } catch (error) {
      console.error("Error fetching utilidades:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (utilidad: Utilidad) => {
    setEditingUtilidad(utilidad)
    setFormData({
      nombre: utilidad.nombre,
      porcentaje: utilidad.porcentaje.toString(),
      descripcion: utilidad.descripcion,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta utilidad?")) return

    try {
      const response = await fetch(`/api/admin/configuracion?tipo=utilidad&id=${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        fetchUtilidades()
      }
    } catch (error) {
      console.error("Error deleting utilidad:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingUtilidad ? "PUT" : "POST"
      const body = editingUtilidad
        ? {
            tipo: "utilidad",
            id: editingUtilidad.id,
            nombre: formData.nombre,
            porcentaje: Number.parseFloat(formData.porcentaje),
            descripcion: formData.descripcion,
          }
        : {
            tipo: "utilidad",
            nombre: formData.nombre,
            porcentaje: Number.parseFloat(formData.porcentaje),
            descripcion: formData.descripcion,
          }

      const response = await fetch("/api/admin/configuracion", {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })

      if (response.ok) {
        setDialogOpen(false)
        setEditingUtilidad(null)
        setFormData({ nombre: "", porcentaje: "", descripcion: "" })
        fetchUtilidades()
      }
    } catch (error) {
      console.error("Error saving utilidad:", error)
    }
  }

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditingUtilidad(null)
      setFormData({ nombre: "", porcentaje: "", descripcion: "" })
    }
  }

  if (!user || user.rol !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Acceso Denegado</h1>
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
        <header className="border-b bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary rounded-lg p-2">
                <TrendingUp className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">Niveles de Utilidad</h1>
                <p className="text-sm text-muted-foreground">Configura los porcentajes de utilidad disponibles</p>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Utilidad
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingUtilidad ? "Editar Utilidad" : "Crear Nuevo Nivel de Utilidad"}</DialogTitle>
                  <DialogDescription>
                    {editingUtilidad ? "Modifica el nivel de utilidad" : "Configura un nuevo porcentaje de utilidad"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder="Ej: Nivel 1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="porcentaje">Porcentaje de Utilidad (%)</Label>
                    <Input
                      id="porcentaje"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.porcentaje}
                      onChange={(e) => setFormData({ ...formData, porcentaje: e.target.value })}
                      placeholder="Ej: 25.5"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Input
                      id="descripcion"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      placeholder="Ej: Utilidad estándar"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {editingUtilidad ? "Actualizar Utilidad" : "Crear Utilidad"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <main className="flex-1 p-6">
          {loading ? (
            <div className="text-center">Cargando...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {utilidades.map((utilidad) => (
                <Card key={utilidad.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {utilidad.nombre}
                      <Badge variant={utilidad.activo ? "default" : "secondary"}>
                        {utilidad.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{utilidad.descripcion}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary mb-4">{utilidad.porcentaje}%</div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(utilidad)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(utilidad.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
