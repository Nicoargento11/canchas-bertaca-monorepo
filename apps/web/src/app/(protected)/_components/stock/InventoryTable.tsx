"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, MoreVertical, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  deleteProductFetch,
  Product,
  ProductCategory,
  updateProductFetch,
} from "@/services/product/product";
import { useProductStore } from "@/store/stockManagementStore";
import { Complex } from "@/services/complex/complex";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

// Esquema de validación con Zod
const productFormSchema = z.object({
  id: z.string().optional(),
  barcode: z.string().optional(),
  name: z.string().min(1, "El nombre es requerido"),
  category: z.enum(["BEBIDA", "COMIDA", "SNACK", "EQUIPAMIENTO", "OTRO"]),
  stock: z.number().min(0, "El stock no puede ser negativo"),
  costPrice: z.number().min(0, "El costo no puede ser negativo"),
  salePrice: z.number().min(0, "El precio no puede ser negativo"),
  supplier: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface InventoryTableProps {
  complex: Complex;
}

export function InventoryTable({ complex }: InventoryTableProps) {
  const { products, updateProduct, deleteProduct, initializeProducts } = useProductStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    initializeProducts(complex.products || []);
  }, [complex.products, initializeProducts]);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      id: "",
      barcode: "",
      name: "",
      category: "BEBIDA",
      stock: 0,
      costPrice: 0,
      salePrice: 0,
      supplier: "",
    },
  });

  // Filtrar productos según término de búsqueda
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (product: Product) => {
    form.reset({
      ...product,
      costPrice: product.costPrice || 0,
      salePrice: product.salePrice || 0,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      const { success, data, error } = await deleteProductFetch(productToDelete.id);
      if (!success || !data || error) {
        toast.error("Error al eliminar el producto", {
          description: "Ocurrió un error al eliminar el producto.",
        });
      }

      deleteProduct(productToDelete.id);
      toast.success("Producto eliminado", {
        description: `${productToDelete.name} ha sido eliminado del inventario.`,
      });
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    if (data.id) {
      const { success, data: dataProduct, error } = await updateProductFetch(data?.id, data);
      if (!success || !dataProduct || error) {
        toast.error("Error al actualizar el producto", {
          description: "Ocurrió un error al actualizar el producto.",
        });
        return;
      }
      // Actualizar producto existente
      updateProduct(data.id, data);
      toast.success("Producto actualizado", {
        description: "Los cambios han sido guardados correctamente.",
      });
    }
    setIsEditDialogOpen(false);
    form.reset();
  };

  // Calcular margen
  const watchSalePrice = form.watch("salePrice");
  const watchCostPrice = form.watch("costPrice");
  const unitMargin = watchSalePrice - watchCostPrice;
  const marginPercentage = watchSalePrice ? (unitMargin / watchSalePrice) * 100 : 0;

  // Carga inicial solo una vez
  useEffect(() => {
    initializeProducts(complex.products);
  }, [complex.products, initializeProducts]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-9"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Costo</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="text-right">Margen</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No hay productos que coincidan con la búsqueda.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => {
                const margin = (product.salePrice || 0) - (product.costPrice || 0);
                const marginPct = product.salePrice ? (margin / (product.salePrice || 1)) * 100 : 0;

                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.barcode || "-"}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-right">{product.stock}</TableCell>
                    <TableCell className="text-right">
                      ${(product.costPrice || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      ${(product.salePrice || 0).toFixed(2)}
                    </TableCell>
                    <TableCell
                      className={`text-right ${margin < 0 ? "text-red-500" : "text-green-600"}`}
                    >
                      ${margin.toFixed(2)} ({marginPct.toFixed(0)}%)
                    </TableCell>
                    <TableCell>
                      <div
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          product.stock > 10
                            ? "bg-green-100 text-green-800"
                            : product.stock > 0
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.stock > 10
                          ? "Disponible"
                          : product.stock > 0
                            ? "Bajo stock"
                            : "Agotado"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Abrir menú</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEdit(product)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(product)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Diálogo de edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{form.getValues("id") ? "Editar Producto" : "Crear Producto"}</DialogTitle>
            <DialogDescription>
              {form.getValues("id")
                ? "Modifica los detalles del producto y guarda los cambios."
                : "Completa los detalles del nuevo producto."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="barcode" className="text-right">
                        Código
                      </Label>
                      <FormControl>
                        <Input id="barcode" className="col-span-3" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage className="text-right" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Nombre
                      </Label>
                      <FormControl>
                        <Input id="name" className="col-span-3" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage className="text-right" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">
                        Categoría
                      </Label>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BEBIDA">Bebidas</SelectItem>
                          <SelectItem value="COMIDA">Alimentos</SelectItem>
                          <SelectItem value="SNACK">Snacks</SelectItem>
                          <SelectItem value="EQUIPAMIENTO">Equipamento</SelectItem>
                          <SelectItem value="OTRO">Otros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <FormMessage className="text-right" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="stock" className="text-right">
                        Stock
                      </Label>
                      <FormControl>
                        <Input
                          id="stock"
                          type="number"
                          className="col-span-3"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="text-right" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="costPrice"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="costPrice" className="text-right">
                        Costo
                      </Label>
                      <FormControl>
                        <Input
                          id="costPrice"
                          type="number"
                          step="0.01"
                          className="col-span-3"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="text-right" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salePrice"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="salePrice" className="text-right">
                        Precio
                      </Label>
                      <FormControl>
                        <Input
                          id="salePrice"
                          type="number"
                          step="0.01"
                          className="col-span-3"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="text-right" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="margin" className="text-right">
                  Margen
                </Label>
                <div className="col-span-3 grid grid-cols-2 gap-2">
                  <div className="p-2 border rounded-md">
                    <p className="text-xs text-muted-foreground">Unitario</p>
                    <p
                      className={`font-medium ${unitMargin < 0 ? "text-red-500" : "text-green-600"}`}
                    >
                      ${unitMargin.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-2 border rounded-md">
                    <p className="text-xs text-muted-foreground">Porcentaje</p>
                    <p
                      className={`font-medium ${marginPercentage < 0 ? "text-red-500" : "text-green-600"}`}
                    >
                      {marginPercentage.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="supplier" className="text-right">
                        Proveedor
                      </Label>
                      <FormControl>
                        <Input id="supplier" className="col-span-3" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage className="text-right" />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => form.reset()}>
                  Cancelar
                </Button>
                <Button type="submit">Guardar cambios</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
