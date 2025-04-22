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
import { X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/services/product/product";
import { createSale } from "@/services/product-sale/product-sale";

interface ProductSaleItem {
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  discount?: number;
  isGift?: boolean;
}

interface DirectSalesProps {
  products: Product[];
}

export function DirectSales({ products }: DirectSalesProps) {
  const { toast } = useToast();
  const [selectedProducts, setSelectedProducts] = useState<ProductSaleItem[]>(
    []
  );
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleAddProduct = () => {
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    const existingIndex = selectedProducts.findIndex(
      (p) => p.productId === product.id
    );

    if (existingIndex >= 0) {
      const updated = [...selectedProducts];
      updated[existingIndex].quantity += quantity;
      setSelectedProducts(updated);
    } else {
      setSelectedProducts([
        ...selectedProducts,
        {
          productId: product.id,
          product: product,
          quantity,
          price: product.salePrice, // Usamos el precio de venta del producto
          discount: 0,
          isGift: false,
        },
      ]);
    }

    setSelectedProductId("");
    setQuantity(1);
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(
      selectedProducts.filter((p) => p.productId !== productId)
    );
  };

  const handleSubmit = async () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "Error",
        description: "Debe agregar al menos un producto",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Crear un array de promesas para cada producto vendido
      const salesPromises = selectedProducts.map((product) =>
        createSale({
          productId: product.productId,
          quantity: product.quantity,
          price: product.price,
          discount: product.discount || 0,
          isGift: product.isGift || false,
          reserveId: null, // Venta directa sin reserva
        })
      );

      // Esperar a que todas las ventas se completen
      await Promise.all(salesPromises);

      toast({
        title: "Venta registrada",
        description: `Se registraron ${selectedProducts.length} productos vendidos`,
      });
      setSelectedProducts([]);
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Ocurrió un error al registrar la venta",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const total = selectedProducts.reduce((sum, product) => {
    const subtotal = product.price * product.quantity;
    const discount = product.discount || 0;
    return sum + (subtotal - discount);
  }, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Venta Directa de Productos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Producto *</Label>
              <Select
                value={selectedProductId}
                onValueChange={setSelectedProductId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione producto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - ${product.salePrice.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cantidad *</Label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || 1)}
              />
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                onClick={handleAddProduct}
                disabled={!selectedProductId}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" /> Agregar
              </Button>
            </div>
          </div>

          {selectedProducts.length > 0 && (
            <>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Precio Unit.</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Descuento</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedProducts.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell>{item.product.name}</TableCell>
                        <TableCell className="text-right">
                          ${item.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          ${item.discount?.toFixed(2) || "0.00"}
                        </TableCell>
                        <TableCell className="text-right">
                          $
                          {(
                            item.price * item.quantity -
                            (item.discount || 0)
                          ).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveProduct(item.productId)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-lg font-semibold">
                  Total: ${total.toFixed(2)}
                </div>
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? "Procesando..." : "Confirmar Venta"}
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
