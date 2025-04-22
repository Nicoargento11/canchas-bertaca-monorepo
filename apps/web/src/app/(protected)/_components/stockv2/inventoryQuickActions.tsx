"use client";
import { useState } from "react";
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import { createInventoryMovement } from "@/services/inventory/inventory";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/services/product/product";

interface InventoryQuickActionsProps {
  products: Product[];
}

export function InventoryQuickActions({
  products,
}: InventoryQuickActionsProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    productId: "",
    quantity: "1",
    type: "AJUSTE",
    reason: "",
    documentNumber: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const lowStockProducts = products.filter((p) => p.stock < p.minStock);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      //   await createInventoryMovement({
      //     ...formData,
      //     productId: formData.productId,
      //     quantity:
      //       parseInt(formData.quantity) * (formData.type === "COMPRA" ? 1 : -1),
      //     documentNumber: formData.documentNumber || null,
      //     reason: formData.reason || null,
      //   });

      toast({
        title: "Movimiento registrado",
        description:
          "El movimiento de inventario se ha registrado correctamente",
      });
      setFormData({
        productId: "",
        quantity: "1",
        type: "AJUSTE",
        reason: "",
        documentNumber: "",
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error desconocido",
          description: "Ocurrió un error al registrar el movimiento",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  type Field = keyof typeof formData;
  const handleChange = (field: Field, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Ajuste de Inventario</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Producto *</Label>
              <Select
                value={formData.productId}
                onValueChange={(value) => handleChange("productId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione producto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} (Stock: {product.stock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Movimiento *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPRA">Compra</SelectItem>
                  <SelectItem value="VENTA">Venta</SelectItem>
                  <SelectItem value="AJUSTE">Ajuste</SelectItem>
                  <SelectItem value="PERDIDA">Pérdida</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cantidad *</Label>
              <Input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleChange("quantity", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Motivo (opcional)</Label>
              <Input
                placeholder="Ej: Rotura, Vencimiento, etc."
                value={formData.reason}
                onChange={(e) => handleChange("reason", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>N° Documento (opcional)</Label>
              <Input
                placeholder="N° factura, remito, etc."
                value={formData.documentNumber}
                onChange={(e) => handleChange("documentNumber", e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Procesando..." : "Registrar Movimiento"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Alertas de Stock</CardTitle>
        </CardHeader>
        <CardContent>
          {lowStockProducts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Stock Actual</TableHead>
                  <TableHead>Stock Mínimo</TableHead>
                  <TableHead>Diferencia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>{product.minStock}</TableCell>
                    <TableCell
                      className={
                        product.stock < product.minStock ? "text-red-500" : ""
                      }
                    >
                      {product.minStock - product.stock}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No hay productos con stock bajo
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
