"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Package, Plus, Edit, Trash2, Upload } from 'lucide-react'
import Link from "next/link"
import type { Producto, Marca } from "@/lib/types"

export default function AdminProductosPage() {
  const { user } = useAuth()
  const [productos, setProductos] = useState<Producto[]>([])
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    codigo: "",
    precio: "",
    marca_id: "",
    categoria: "",
    variable_plano: "",
    imagen_url: "",
    activo: true,
  })

  useEffect(() => {
    if (!user || user.rol !== "admin") {
      return
    }
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      const [productosRes, marcasRes] = await Promise.all([fetch("/api/productos"), fetch("/api/marcas")])

      const productosData = await productosRes.json()
      const marcasData = await marcasRes.json()

      if (productosData.success) setProductos(productosData.data)
      if (marcasData.success) setMarcas(marcasData.data)
    } catch (error) {
      console.error("Error cargando datos:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        if (isEdit) {
          setEditImagePreview(base64)
          setFormData({ ...formData, imagen_url: base64 })
        } else {
          setImagePreview(base64)
          setFormData({ ...formData, imagen_url: base64 })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          precio: Number.parseFloat(formData.precio),
          marca_id: Number.parseInt(formData.marca_id),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setProductos([data.data, ...productos])
        setShowCreateDialog(false)
        resetForm()
        alert("Producto creado exitosamente")
      } else {
        alert(data.message || "Error al crear producto")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error de conexión")
    }
  }

  const handleEditProduct = (producto: Producto) => {
    setEditingId(producto.id)
    setFormData({
      nombre: producto.nombre || "",
      descripcion: producto.descripcion || "",
      codigo: producto.codigo || "",
      precio: producto.precio_base?.toString() || "",
      marca_id: producto.marca_id?.toString() || "",
      categoria: producto.categoria || "",
      variable_plano: producto.variable_plano || "",
      imagen_url: producto.imagen_url || "",
      activo: producto.activo,
    })
    setEditImagePreview(producto.imagen_url || null)
    setShowEditDialog(true)
  }

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingId) return

    try {
      const response = await fetch(`/api/productos/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          precio_base: Number.parseFloat(formData.precio),
          marca_id: Number.parseInt(formData.marca_id),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setProductos(productos.map((p) => (p.id === editingId ? data.data : p)))
        setShowEditDialog(false)
        resetForm()
        alert("Producto actualizado exitosamente")
      } else {
        alert(data.message || "Error al actualizar producto")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error de conexión")
    }
  }

  const handleDeleteProduct = async () => {
    if (!deleteId) return

    try {
      const response = await fetch(`/api/productos/${deleteId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        setProductos(productos.filter((p) => p.id !== deleteId))
        setShowDeleteDialog(false)
        setDeleteId(null)
        alert("Producto eliminado exitosamente")
      } else {
        alert(data.message || "Error al eliminar producto")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error de conexión")
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      codigo: "",
      precio: "",
      marca_id: "",
      categoria: "",
      variable_plano: "",
      imagen_url: "",
      activo: true,
    })
    setImagePreview(null)
    setEditImagePreview(null)
    setEditingId(null)
  }

  if (!user || user.rol !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Acceso Denegado</h1>
          <p className="text-sm text-muted-foreground">No tienes permisos para acceder al panel de administración.</p>
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
              <Package className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">Gestión de Productos</h1>
              <p className="text-sm text-muted-foreground">Administra el catálogo de luminarias</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Catálogo de Productos
                </CardTitle>

                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Nuevo Producto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Crear Nuevo Producto</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateProduct} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nombre">Nombre del Producto</Label>
                          <Input
                            id="nombre"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="codigo">Código</Label>
                          <Input
                            id="codigo"
                            value={formData.codigo}
                            onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="descripcion">Descripción</Label>
                        <Textarea
                          id="descripcion"
                          value={formData.descripcion}
                          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="precio">Precio</Label>
                          <Input
                            id="precio"
                            type="number"
                            step="0.01"
                            value={formData.precio}
                            onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="marca">Marca</Label>
                          <Select
                            value={formData.marca_id}
                            onValueChange={(value) => setFormData({ ...formData, marca_id: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar marca" />
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
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="categoria">Categoría</Label>
                          <Input
                            id="categoria"
                            value={formData.categoria}
                            onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="variable_plano">Variable de Plano</Label>
                          <Input
                            id="variable_plano"
                            value={formData.variable_plano}
                            onChange={(e) => setFormData({ ...formData, variable_plano: e.target.value })}
                            placeholder="Ej: L1, L2, etc."
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="imagen">Imagen del Producto</Label>
                        <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition">
                          <input
                            id="imagen"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, false)}
                            className="hidden"
                          />
                          <label htmlFor="imagen" className="cursor-pointer">
                            {imagePreview ? (
                              <div className="space-y-2">
                                <img src={imagePreview || "/placeholder.svg"} alt="preview" className="h-32 mx-auto object-contain" />
                                <p className="text-sm text-muted-foreground">Haz clic para cambiar imagen</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                                <p className="text-sm">Arrastra o haz clic para seleccionar imagen</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit">Crear Producto</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Marca</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Variable Plano</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Cargando productos...
                        </TableCell>
                      </TableRow>
                    ) : productos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No hay productos registrados
                        </TableCell>
                      </TableRow>
                    ) : (
                      productos.map((producto) => (
                        <TableRow key={producto.id}>
                          <TableCell className="font-medium">{producto.nombre}</TableCell>
                          <TableCell>{producto.marca_nombre}</TableCell>
                          <TableCell>{producto.categoria}</TableCell>
                          <TableCell>${producto.precio_base ? producto.precio_base.toLocaleString() : "0.00"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{producto.variable_plano}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={producto.activo ? "default" : "destructive"}>
                              {producto.activo ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Dialog open={showEditDialog && editingId === producto.id} onOpenChange={(open) => {
                                if (!open) {
                                  resetForm()
                                  setShowEditDialog(false)
                                }
                              }}>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleEditProduct(producto)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Editar Producto</DialogTitle>
                                  </DialogHeader>
                                  <form onSubmit={handleUpdateProduct} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-nombre">Nombre del Producto</Label>
                                        <Input
                                          id="edit-nombre"
                                          value={formData.nombre}
                                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                          required
                                        />
                                      </div>

                                      <div className="space-y-2">
                                        <Label htmlFor="edit-codigo">Código</Label>
                                        <Input
                                          id="edit-codigo"
                                          value={formData.codigo}
                                          onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                                        />
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="edit-descripcion">Descripción</Label>
                                      <Textarea
                                        id="edit-descripcion"
                                        value={formData.descripcion}
                                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                        rows={3}
                                      />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-precio">Precio</Label>
                                        <Input
                                          id="edit-precio"
                                          type="number"
                                          step="0.01"
                                          value={formData.precio}
                                          onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                                          required
                                        />
                                      </div>

                                      <div className="space-y-2">
                                        <Label htmlFor="edit-marca">Marca</Label>
                                        <Select
                                          value={formData.marca_id}
                                          onValueChange={(value) => setFormData({ ...formData, marca_id: value })}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar marca" />
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
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-categoria">Categoría</Label>
                                        <Input
                                          id="edit-categoria"
                                          value={formData.categoria}
                                          onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                                        />
                                      </div>

                                      <div className="space-y-2">
                                        <Label htmlFor="edit-variable_plano">Variable de Plano</Label>
                                        <Input
                                          id="edit-variable_plano"
                                          value={formData.variable_plano}
                                          onChange={(e) => setFormData({ ...formData, variable_plano: e.target.value })}
                                          placeholder="Ej: L1, L2, etc."
                                        />
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <Label htmlFor="edit-imagen">Imagen del Producto</Label>
                                      <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition">
                                        <input
                                          id="edit-imagen"
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => handleImageChange(e, true)}
                                          className="hidden"
                                        />
                                        <label htmlFor="edit-imagen" className="cursor-pointer">
                                          {editImagePreview ? (
                                            <div className="space-y-2">
                                              <img src={editImagePreview || "/placeholder.svg"} alt="preview" className="h-32 mx-auto object-contain" />
                                              <p className="text-sm text-muted-foreground">Haz clic para cambiar imagen</p>
                                            </div>
                                          ) : (
                                            <div className="space-y-2">
                                              <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                                              <p className="text-sm">Arrastra o haz clic para seleccionar imagen</p>
                                            </div>
                                          )}
                                        </label>
                                      </div>
                                    </div>

                                    <div className="flex justify-end gap-2">
                                      <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => {
                                          resetForm()
                                          setShowEditDialog(false)
                                        }}
                                      >
                                        Cancelar
                                      </Button>
                                      <Button type="submit">Guardar Cambios</Button>
                                    </div>
                                  </form>
                                </DialogContent>
                              </Dialog>

                              <Dialog open={showDeleteDialog && deleteId === producto.id} onOpenChange={(open) => {
                                if (!open) {
                                  setDeleteId(null)
                                  setShowDeleteDialog(false)
                                }
                              }}>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0"
                                    onClick={() => {
                                      setDeleteId(producto.id)
                                      setShowDeleteDialog(true)
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Confirmar Eliminación</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                      ¿Estás seguro de que deseas eliminar el producto <span className="font-semibold">{producto.nombre}</span>? Esta acción no se puede deshacer.
                                    </p>
                                    <div className="flex justify-end gap-2">
                                      <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => {
                                          setDeleteId(null)
                                          setShowDeleteDialog(false)
                                        }}
                                      >
                                        Cancelar
                                      </Button>
                                      <Button 
                                        type="button" 
                                        variant="destructive"
                                        onClick={handleDeleteProduct}
                                      >
                                        Eliminar
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
