"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createProduct, Product } from "@/services/product/product";
import { useProductStore } from "@/store/stockManagementStore";
import { Complex } from "@/services/complex/complex";

// Define form schema using Zod
const productFormSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  description: z.string().optional(),
  barcode: z.string().optional(),
  category: z.enum(["BEBIDA", "COMIDA", "SNACK", "EQUIPAMIENTO", "OTRO"], {
    message: "Debe seleccionar una categoría válida.",
  }),
  stock: z.number().min(0, {
    message: "El stock no puede ser negativo.",
  }),
  costPrice: z.number().min(0, {
    message: "El precio de costo no puede ser negativo.",
  }),
  salePrice: z.number().min(0, {
    message: "El precio de venta no puede ser negativo.",
  }),
  minStock: z.number().min(0, {
    message: "El stock mínimo no puede ser negativo.",
  }),
  supplier: z.string().optional(),
  isActive: z.boolean(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  complex: Complex;
}

export function ProductForm({ complex }: ProductFormProps) {
  const { addProduct, products } = useProductStore();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      barcode: "",
      category: "BEBIDA",
      stock: 0,
      costPrice: 0,
      salePrice: 0,
      minStock: 0,
      supplier: "",
      isActive: true,
    },
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      // Limpiar campos opcionales vacíos para evitar conflictos de unique constraint
      const cleanedData = {
        ...data,
        barcode: data.barcode?.trim() || undefined,
        description: data.description?.trim() || undefined,
        supplier: data.supplier?.trim() || undefined,
      };

      const {
        success,
        data: newProduct,
        error,
      } = await createProduct({ complexId: complex.id, ...cleanedData });
      if (!success || !newProduct) {
        toast.error("Error al agregar producto", {
          description: error || "Ocurrió un error al intentar agregar el producto.",
        });
        return;
      }

      // Add to global state
      addProduct(newProduct);

      // Show success toast
      toast.success("Producto agregado", {
        description: `${data.name} ha sido agregado al inventario.`,
      });

      // Reset form
      form.reset();
    } catch (error) {
      toast.error("Error al agregar producto", {
        description: "Ocurrió un error al intentar agregar el producto.",
      });
    }
  };

  // Calculate profit margin
  const costPrice = form.watch("costPrice");
  const salePrice = form.watch("salePrice");
  const unitMargin = salePrice - costPrice;
  const marginPercentage = salePrice > 0 ? (unitMargin / salePrice) * 100 : 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Balón de fútbol" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Barcode Field */}
          <FormField
            control={form.control}
            name="barcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código de barras</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: 123456789" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category Field */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="COMIDA">Alimentos</SelectItem>
                    <SelectItem value="BEBIDA">Bebidas</SelectItem>
                    <SelectItem value="SNACK">Snacks</SelectItem>
                    <SelectItem value="EQUIPAMIENTO">Equipamento</SelectItem>
                    <SelectItem value="OTRO">Otros</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Stock Fields */}
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minStock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock mínimo *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Price Fields */}
          <FormField
            control={form.control}
            name="costPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio de costo *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="salePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio de venta *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Profit Margin Display */}
          <div className="space-y-2">
            <Label>Margen de Ganancia</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 border rounded-md">
                <p className="text-xs text-muted-foreground">Unitario</p>
                <p className={`font-medium ${unitMargin < 0 ? "text-red-500" : "text-green-600"}`}>
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

          {/* Supplier Field */}
          <FormField
            control={form.control}
            name="supplier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proveedor</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del proveedor" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description Field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea placeholder="Descripción detallada del producto..." {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full sm:w-auto">
          {form.formState.isSubmitting ? "Agregando..." : "Agregar Producto"}
        </Button>
      </form>
    </Form>
  );
}
