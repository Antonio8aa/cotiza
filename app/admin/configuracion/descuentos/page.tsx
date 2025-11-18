"use client"

import type React from "react"

// Gestión de descuentos por marca
import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Percent, Plus, Edit, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

interface Descuento {
  id: number
  marca_id: number
  marca_nombre: string
  porcentaje_descuento: number
  activo: boolean
}

interface Marca {
  id: number
  nombre: string
}

export default function DescuentosPage() {
  const { user } = useAuth()
  const [descuentos, setDescuentos] = useState<Descuento[]>([])
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDescuento, setEditingDescuento] = useState<Descuento | null>(null)
  const [formData, setFormData] = useState({
    marca_id: "",
    porcentaje: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [descuentosRes, marcasRes] = await Promise.all([
        fetch("/api/admin/configuracion?tipo=descuentos", {
          credentials: "include",
        }),
        fetch("/api/admin/configuracion?tipo=marcas", {
          credentials: "include",
        }),
      ])

      const descuentosData = await descuentosRes.json()
      const marcasData = await marcasRes.json()

      if (descuentosData.success) setDescuentos(descuentosData.data)
      if (marcasData.success) setMarcas(marcasData.data)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (descuento: Descuento) => {
    setEditingDescuento(descuento)
    setFormData({
      marca_id: descuento.marca_id.toString(),
      porcentaje: descuento.porcentaje_descuento.toString(),
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este descuento?")) return

    try {
      const response = await fetch(`/api/admin/configuracion?tipo=descuento&id=${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error("Error deleting descuento:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingDescuento ? "PUT" : "POST"
      const body = editingDescuento
        ? {
            tipo: "descuento",
            id: editingDescuento.id,
            marca_id: Number.parseInt(formData.marca_id),
            porcentaje_descuento: Number.parseFloat(formData.porcentaje),
          }
        : {
            tipo: "descuento",
            marca_id: Number.parseInt(formData.marca_id),
            porcentaje_descuento: Number.parseFloat(formData.porcentaje),
          }

      const response = await fetch("/api/admin/configuracion", {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })

      if (response.ok) {
        setDialogOpen(false)
        setEditingDescuento(null)
        setFormData({ marca_id: "", porcentaje: "" })
        fetchData()
      }
    } catch (error) {
      console.error("Error saving descuento:", error)
    }
  }

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditingDescuento(null)
      setFormData({ marca_id: "", porcentaje: "" })
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
                <Percent className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">Descuentos por Marca</h1>
                <p className="text-sm text-muted-foreground">Configura descuentos específicos para cada marca</p>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Descuento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingDescuento ? "Editar Descuento" : "Crear Nuevo Descuento"}</DialogTitle>
                  <DialogDescription>
                    {editingDescuento
                      ? "Modifica el descuento para esta marca"
                      : "Configura un descuento para una marca específica"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="marca">Marca</Label>
                    <Select
                      value={formData.marca_id}
                      onValueChange={(value) => setFormData({ ...formData, marca_id: value })}
                      disabled={!!editingDescuento}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una marca" />
                      </SelectTrigger>
                      <SelectContent>
                        {marcas.map((marca) => (
                          <SelectItem key={marca.id} value={marca.id.toString()}>
                            {marca.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="porcentaje">Porcentaje de Descuento (%)</Label>
                    <Input
                      id="porcentaje"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.porcentaje}
                      onChange={(e) => setFormData({ ...formData, porcentaje: e.target.value })}
                      placeholder="Ej: 15.5"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {editingDescuento ? "Actualizar Descuento" : "Crear Descuento"}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {descuentos.map((descuento) => (
                <Card key={descuento.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {descuento.marca_nombre}
                      <Badge variant={descuento.activo ? "default" : "secondary"}>
                        {descuento.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>Descuento aplicable a productos de esta marca</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary mb-4">{descuento.porcentaje_descuento}%</div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(descuento)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(descuento.id)}>
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
