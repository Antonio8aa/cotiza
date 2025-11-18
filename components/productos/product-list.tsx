"use client"

// Componente para listar y gestionar productos
import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, Package, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ProductoConMarca } from "@/lib/services/productos"
import type { Marca } from "@/lib/types"

interface ProductListProps {
  onEditProduct?: (producto: ProductoConMarca) => void
  onDeleteProduct?: (id: number) => void
  onAddProduct?: () => void
  showActions?: boolean
}

export function ProductList({ onEditProduct, onDeleteProduct, onAddProduct, showActions = true }: ProductListProps) {
  const [productos, setProductos] = useState<ProductoConMarca[]>([])
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMarca, setSelectedMarca] = useState<string>("all")
  const [selectedCategoria, setSelectedCategoria] = useState<string>("all")

  useEffect(() => {
    loadMarcas()
    loadProductos()
  }, [])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadProductos()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery, selectedMarca, selectedCategoria])

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

  const loadProductos = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append("query", searchQuery)
      if (selectedMarca !== "all") params.append("marca_id", selectedMarca)
      if (selectedCategoria !== "all") params.append("categoria", selectedCategoria)

      const response = await fetch(`/api/productos?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setProductos(data.data)
      }
    } catch (error) {
      console.error("Error cargando productos:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(price)
  }

  const categorias = [...new Set(productos.map((p) => p.categoria).filter(Boolean))]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Gestión de Productos
          </CardTitle>
          {showActions && onAddProduct && (
            <Button onClick={onAddProduct} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Agregar Producto
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, código o descripción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedMarca} onValueChange={setSelectedMarca}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Todas las marcas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las marcas</SelectItem>
              {marcas.map((marca) => (
                <SelectItem key={marca.id} value={marca.id.toString()}>
                  {marca.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categorias.map((categoria) => (
                <SelectItem key={categoria} value={categoria!}>
                  {categoria}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabla de productos */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Variable</TableHead>
                <TableHead>Precio Base</TableHead>
                <TableHead>Descuento</TableHead>
                {showActions && <TableHead className="text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={showActions ? 8 : 7} className="text-center py-8">
                    Cargando productos...
                  </TableCell>
                </TableRow>
              ) : productos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={showActions ? 8 : 7} className="text-center py-8 text-muted-foreground">
                    No se encontraron productos
                  </TableCell>
                </TableRow>
              ) : (
                productos.map((producto) => (
                  <TableRow key={producto.id}>
                    <TableCell>
                      <Badge variant="outline">{producto.codigo}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{producto.nombre}</div>
                        {producto.descripcion && (
                          <div className="text-sm text-muted-foreground truncate max-w-xs">{producto.descripcion}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{producto.marca_nombre}</Badge>
                    </TableCell>
                    <TableCell>{producto.categoria || "-"}</TableCell>
                    <TableCell>
                      {producto.variable_plano ? (
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          <Tag className="h-3 w-3" />
                          {producto.variable_plano}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{formatPrice(producto.precio_base)}</TableCell>
                    <TableCell>
                      {producto.descuento_porcentaje && producto.descuento_porcentaje > 0 ? (
                        <Badge variant="destructive">-{producto.descuento_porcentaje}%</Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    {showActions && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {onEditProduct && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditProduct(producto)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {onDeleteProduct && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteProduct(producto.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
