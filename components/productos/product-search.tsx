"use client"

// Componente de búsqueda de productos para cotizaciones
import { useState, useEffect, useRef } from "react"
import { Search, Package, Tag, DollarSign } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import type { ProductoConMarca } from "@/lib/services/productos"

interface ProductSearchProps {
  onProductSelect: (producto: ProductoConMarca) => void
  placeholder?: string
  className?: string
}

export function ProductSearch({ onProductSelect, placeholder = "Buscar productos...", className }: ProductSearchProps) {
  const [query, setQuery] = useState("")
  const [productos, setProductos] = useState<ProductoConMarca[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showNewProductForm, setShowNewProductForm] = useState(false)
  const [newProductData, setNewProductData] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    marca_id: "",
    precio_base: "",
    categoria: "",
    tiempo_entrega: "",
  })
  const [marcas, setMarcas] = useState<any[]>([])
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
        setShowNewProductForm(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const searchProducts = async () => {
      if (query.trim().length < 2) {
        setProductos([])
        setShowResults(false)
        setShowNewProductForm(false)
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`/api/productos/search?q=${encodeURIComponent(query)}&limit=10`)
        const data = await response.json()

        if (data.success) {
          setProductos(data.data)
          setShowResults(true)
          setShowNewProductForm(data.data.length === 0)
        }
      } catch (error) {
        console.error("Error buscando productos:", error)
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchProducts, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  useEffect(() => {
    loadMarcas()
  }, [])

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

  const handleProductSelect = (producto: ProductoConMarca) => {
    onProductSelect(producto)
    setQuery("")
    setShowResults(false)
    setShowNewProductForm(false)
  }

  const handleCreateNewProduct = async () => {
    try {
      const response = await fetch("/api/productos/solicitar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...newProductData,
          precio_base: Number.parseFloat(newProductData.precio_base),
          marca_id: Number.parseInt(newProductData.marca_id),
        }),
      })

      const data = await response.json()
      if (data.success) {
        const productoTemporal: ProductoConMarca = {
          id: -Date.now(),
          codigo: newProductData.codigo,
          nombre: newProductData.nombre,
          descripcion: newProductData.descripcion,
          marca_id: Number.parseInt(newProductData.marca_id),
          precio_base: Number.parseFloat(newProductData.precio_base),
          categoria: newProductData.categoria,
          activo: true,
          fecha_creacion: new Date(),
          fecha_actualizacion: new Date(),
          marca_nombre: marcas.find((m) => m.id === Number.parseInt(newProductData.marca_id))?.nombre || "",
          tiempo_entrega: newProductData.tiempo_entrega,
        }

        onProductSelect(productoTemporal)
        setQuery("")
        setShowResults(false)
        setShowNewProductForm(false)
        setNewProductData({
          codigo: "",
          nombre: "",
          descripcion: "",
          marca_id: "",
          precio_base: "",
          categoria: "",
          tiempo_entrega: "",
        })

        alert("Producto solicitado correctamente. Se ha enviado una notificación al administrador para su aprobación.")
      }
    } catch (error) {
      console.error("Error creando producto:", error)
      alert("Error al solicitar el producto")
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(price)
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setShowResults(true)}
          className="pl-10"
        />
      </div>

      {showResults && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">Buscando productos...</div>
            ) : productos.length > 0 ? (
              <div className="divide-y">
                {productos.map((producto) => (
                  <div
                    key={producto.id}
                    className="p-4 hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => handleProductSelect(producto)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="font-medium text-sm truncate">{producto.nombre}</span>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {producto.codigo}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {producto.marca_nombre}
                          </Badge>
                          {producto.variable_plano && (
                            <Badge variant="outline" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {producto.variable_plano}
                            </Badge>
                          )}
                        </div>

                        {producto.descripcion && (
                          <p className="text-xs text-muted-foreground truncate">{producto.descripcion}</p>
                        )}
                      </div>

                      <div className="flex flex-col items-end ml-4">
                        <div className="flex items-center text-sm font-medium">
                          <DollarSign className="h-4 w-4" />
                          {formatPrice(producto.precio_base)}
                        </div>
                        {producto.descuento_porcentaje && producto.descuento_porcentaje > 0 && (
                          <Badge variant="destructive" className="text-xs mt-1">
                            -{producto.descuento_porcentaje}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : showNewProductForm ? (
              <div className="p-4 space-y-4">
                <div className="text-sm font-medium text-center mb-4">
                  No se encontró "{query}". ¿Deseas solicitar este producto?
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Código *</Label>
                    <Input
                      placeholder="Código del producto"
                      value={newProductData.codigo}
                      onChange={(e) => setNewProductData({ ...newProductData, codigo: e.target.value })}
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Nombre *</Label>
                    <Input
                      placeholder="Nombre del producto"
                      value={newProductData.nombre}
                      onChange={(e) => setNewProductData({ ...newProductData, nombre: e.target.value })}
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Marca *</Label>
                    <Select
                      value={newProductData.marca_id}
                      onValueChange={(value) => setNewProductData({ ...newProductData, marca_id: value })}
                    >
                      <SelectTrigger className="text-sm">
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

                  <div>
                    <Label className="text-xs">Precio Base *</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={newProductData.precio_base}
                      onChange={(e) => setNewProductData({ ...newProductData, precio_base: e.target.value })}
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Categoría</Label>
                    <Input
                      placeholder="Categoría"
                      value={newProductData.categoria}
                      onChange={(e) => setNewProductData({ ...newProductData, categoria: e.target.value })}
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Tiempo de Entrega</Label>
                    <Input
                      placeholder="ej: 3-4 semanas"
                      value={newProductData.tiempo_entrega}
                      onChange={(e) => setNewProductData({ ...newProductData, tiempo_entrega: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Descripción</Label>
                  <Textarea
                    placeholder="Descripción del producto"
                    value={newProductData.descripcion}
                    onChange={(e) => setNewProductData({ ...newProductData, descripcion: e.target.value })}
                    className="text-sm"
                    rows={2}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateNewProduct}
                    disabled={
                      !newProductData.codigo ||
                      !newProductData.nombre ||
                      !newProductData.marca_id ||
                      !newProductData.precio_base
                    }
                    className="flex-1"
                  >
                    Solicitar Producto
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowNewProductForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">No se encontraron productos para "{query}"</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
