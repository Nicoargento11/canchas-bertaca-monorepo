"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomForm } from "../../_components/customForm";
import { DataTable } from "../../_components/customDataTable";
import { productSchema } from "@/schemas";
import { inventoryColumns } from "../../_components/columns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  createProduct,
  deleteProduct,
  getProducts,
  Product,
  ProductCategory,
  ProductFormValues,
} from "@/services/product/product";

const defaultProductValues = {
  name: "",
  description: "",
  barcode: "",
  category: ProductCategory.BEBIDA, // Valor por defecto para el enum
  stock: 0,
  costPrice: 0,
  salePrice: 0,
  minStock: 5,
  supplier: "",
  isActive: true,
};

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch {
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (values: ProductFormValues) => {
    try {
      await createProduct(values);
      await loadProducts();
      toast({
        title: "Éxito",
        description: "Producto creado correctamente",
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo crear el producto",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id);
      await loadProducts();
      toast({
        title: "Éxito",
        description: "Producto eliminado correctamente",
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      });
    }
  };

  const enhancedColumns = [
    ...inventoryColumns,
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }: { row: { original: Product } }) => (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => handleDeleteProduct(row.original.id)}
        >
          Eliminar
        </Button>
      ),
    },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Gestión de Inventario</h1>

      {/* Sección de formulario */}
      <Card>
        <CardHeader>
          <CardTitle>Agregar Producto</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomForm
            schema={productSchema}
            fields={[
              { name: "name", label: "Nombre", type: "input" },
              { name: "description", label: "Descripción", type: "textarea" },
              { name: "barcode", label: "Código de barras", type: "input" },
              {
                name: "category",
                label: "Categoría",
                type: "select",
                options: Object.values(ProductCategory).map((value) => ({
                  value,
                  label: value,
                })),
              },
              { name: "stock", label: "Stock inicial", type: "number" },
              { name: "costPrice", label: "Precio de costo", type: "number" },
              { name: "salePrice", label: "Precio de venta", type: "number" },
              { name: "minStock", label: "Stock mínimo", type: "number" },
              { name: "supplier", label: "Proveedor", type: "input" },
              {
                name: "isActive",
                label: "Activo",
                type: "select",
                options: [
                  { value: "true", label: "Sí" },
                  { value: "false", label: "No" },
                ],
              },
            ]}
            onSubmit={handleCreateProduct}
            submitText="Agregar Producto"
            defaultValues={defaultProductValues}
          />
        </CardContent>
      </Card>

      {/* Tabla de productos */}
      <Card>
        <CardHeader>
          <CardTitle>Productos en Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={enhancedColumns}
            data={products}
            filterColumn="name"
            filterPlaceholder="Buscar productos..."
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
