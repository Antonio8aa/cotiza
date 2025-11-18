"use client"

import { useState } from "react"
import { MainNav } from "@/components/layout/main-nav"
import { ProductList } from "@/components/productos/product-list"
import { useAuth } from "@/contexts/auth-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload } from 'lucide-react'
import type { ProductoConMarca, Marca } from "@/lib/services/productos"

export default function ProductosPage() {
  const { user } = useAuth()
  const [selectedProduct, setSelectedProduct] = useState<ProductoConMarca | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    codigo: "",
    precio: "",
    marca_id: "",
    categoria: "",
    variable_plano: "",
    imagen_url: "",
  })

  const loadMarcas = async () => {
    try {
      const response = await fetch("/api/marcas")
      const data = await response.json()
      if (data.success) {
        setMarcas(data.data)
      }
    } catch (error) {
      console.error("Error cargando marcas:", error)
    }
  }

  const handleEditProduct = (producto: ProductoConMarca) => {
    setSelectedProduct(producto)
    setFormData({
      nombre: producto.nombre || "",
      descripcion: producto.descripcion || "",
      codigo: producto.codigo || "",
      precio: producto.precio_base?.toString() || "",
      marca_id: producto.marca_id?.toString() || "",
      categoria: producto.categoria || "",
      variable_plano: producto.variable_plano || "",
      imagen_url: producto.imagen_url || "",
    })
    setImagePreview(producto.imagen_url || null)
    loadMarcas()
    setShowEditDialog(true)
  }

  const handleDeleteProduct = (id: number) => {
    const producto = selectedProduct
    setShowDeleteDialog(true)
  }

  const handleAddProduct = () => {
    setSelectedProduct(null)
    setFormData({
      nombre: "",
      descripcion: "",
      codigo: "",
      precio: "",
      marca_id: "",
      categoria: "",
      variable_plano: "",
      imagen_url: "",
    })
    setImagePreview(null)
    loadMarcas()
    setShowCreateDialog(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setImagePreview(base64)
        setFormData({ ...formData, imagen_url: base64 })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = selectedProduct ? "PUT" : "POST"
      const url = selectedProduct ? `/api/productos/${selectedProduct.id}` : "/api/productos"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          precio_base: Number.parseFloat(formData.precio),
          marca_id: Number.parseInt(formData.marca_id),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setShowEditDialog(false)
        setShowCreateDialog(false)
        setFormData({
          nombre: "",
          descripcion: "",
          codigo: "",
          precio: "",
          marca_id: "",
          categoria: "",
          variable_plano: "",
          imagen_url: "",
        })
        setImagePreview(null)
        window.location.reload()
      } else {
        alert(data.message || "Error al guardar producto")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error de conexión")
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return

    try {
      const response = await fetch(`/api/productos/${selectedProduct.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        setShowDeleteDialog(false)
        window.location.reload()
      } else {
        alert(data.message || "Error al eliminar producto")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error de conexión")
    }
  }

  if (!user) {
    return <div>Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Catálogo de Productos</h1>
          <p className="text-muted-foreground">
            Explora nuestro catálogo completo de luminarias y productos de iluminación
          </p>
        </div>

        <ProductList
          onEditProduct={user.rol === "admin" ? handleEditProduct : undefined}
          onDeleteProduct={user.rol === "admin" ? handleDeleteProduct : undefined}
          onAddProduct={user.rol === "admin" ? handleAddProduct : undefined}
          showActions={user.rol === "admin"}
        />
      </main>

      <Dialog open={showEditDialog || showCreateDialog} onOpenChange={(open) => {
        if (!open) {
          setShowEditDialog(false)
          setShowCreateDialog(false)
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProduct ? "Editar Producto" : "Crear Nuevo Producto"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  onChange={handleImageChange}
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
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false)
                  setShowCreateDialog(false)
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">{selectedProduct ? "Guardar Cambios" : "Crear Producto"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              ¿Estás seguro de que deseas eliminar el producto <span className="font-semibold">{selectedProduct?.nombre}</span>? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="button" 
                variant="destructive"
                onClick={handleConfirmDelete}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
