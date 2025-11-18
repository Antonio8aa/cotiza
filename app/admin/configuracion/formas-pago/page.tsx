"use client"

import type React from "react"

// Gestión de formas de pago
import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Plus, Edit, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Link from "next/link"

interface FormaPago {
  id: number
  nombre: string
  descuento_porcentaje: number
  activo: boolean
}

export default function FormasPagoPage() {
  const { user } = useAuth()
  const [formasPago, setFormasPago] = useState<FormaPago[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFormaPago, setEditingFormaPago] = useState<FormaPago | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    descuento_porcentaje: "",
  })

  useEffect(() => {
    fetchFormasPago()
  }, [])

  const fetchFormasPago = async () => {
    try {
      const response = await fetch("/api/admin/configuracion?tipo=formas-pago", {
        credentials: "include",
      })
      const data = await response.json()
      if (data.success) {
        setFormasPago(data.data)
      }
    } catch (error) {
      console.error("Error fetching formas de pago:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingFormaPago ? "PUT" : "POST"
      const body = editingFormaPago
        ? {
            tipo: "forma-pago",
            id: editingFormaPago.id,
            nombre: formData.nombre,
            descuento_porcentaje: Number.parseFloat(formData.descuento_porcentaje),
          }
        : {
            tipo: "forma-pago",
            nombre: formData.nombre,
            descuento_porcentaje: Number.parseFloat(formData.descuento_porcentaje),
          }

      const response = await fetch("/api/admin/configuracion", {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })

      if (response.ok) {
        setDialogOpen(false)
        setFormData({ nombre: "", descuento_porcentaje: "" })
        setEditingFormaPago(null)
        fetchFormasPago()
      }
    } catch (error) {
      console.error("Error saving forma de pago:", error)
    }
  }

  const handleEdit = (formaPago: FormaPago) => {
    setEditingFormaPago(formaPago)
    setFormData({
      nombre: formaPago.nombre,
      descuento_porcentaje: formaPago.descuento_porcentaje.toString(),
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta forma de pago?")) return

    try {
      const response = await fetch(`/api/admin/configuracion?tipo=forma-pago&id=${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        fetchFormasPago()
      }
    } catch (error) {
      console.error("Error deleting forma de pago:", error)
    }
  }

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditingFormaPago(null)
      setFormData({ nombre: "", descuento_porcentaje: "" })
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
                <CreditCard className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">Formas de Pago</h1>
                <p className="text-sm text-muted-foreground">Administra las formas de pago y sus descuentos</p>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Forma de Pago
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingFormaPago ? "Editar Forma de Pago" : "Crear Nueva Forma de Pago"}</DialogTitle>
                  <DialogDescription>
                    {editingFormaPago
                      ? "Modifica los datos de la forma de pago"
                      : "Configura una nueva forma de pago con su descuento asociado"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="nombre">Nombre de la Forma de Pago</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder="Ej: Efectivo, Transferencia, Tarjeta"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="descuento">Descuento Asociado (%)</Label>
                    <Input
                      id="descuento"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.descuento_porcentaje}
                      onChange={(e) => setFormData({ ...formData, descuento_porcentaje: e.target.value })}
                      placeholder="Ej: 5.0"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {editingFormaPago ? "Actualizar Forma de Pago" : "Crear Forma de Pago"}
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
              {formasPago.map((forma) => (
                <Card key={forma.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {forma.nombre}
                      <Badge variant={forma.activo ? "default" : "secondary"}>
                        {forma.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>Forma de pago disponible para cotizaciones</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary mb-4">{forma.descuento_porcentaje}% descuento</div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(forma)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(forma.id)}>
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
