import { useState } from "react";
import { Plus, ShoppingBasket, X, Gift } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Product } from "@/services/product/product";
import { ProductSale } from "@/services/product-sale/product-sale";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface ProductSaleFormProps {
  productSales: ProductSale[];
  products: Product[];
  onAddProductSale: (
    productSale: Omit<ProductSale, "id" | "createdAt" | "product" | "Reserves">
  ) => Promise<void>;
  onRemoveProductSale: (productSaleId: string) => Promise<void>;
  isLoadingProducts?: boolean;
  onProductSaleSuccess?: () => void;
}

export default function ProductSaleForm({
  productSales,
  products,
  onAddProductSale,
  onRemoveProductSale,
  isLoadingProducts = false,
  onProductSaleSuccess,
}: ProductSaleFormProps) {
  const { toast } = useToast();
  const [newProductSale, setNewProductSale] = useState<
    Omit<ProductSale, "id" | "createdAt" | "product" | "Reserves"> & {
      productId: string;
    }
  >({
    productId: "",
    quantity: 1,
    price: 0,
    discount: 0,
    isGift: false,
    reserveId: "",
  });

  const [processing, setProcessing] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleAddProductSale = async () => {
    if (!newProductSale.productId) {
      toast({
        title: "Error",
        description: "Debes seleccionar un producto",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      await onAddProductSale({
        productId: newProductSale.productId,
        quantity: newProductSale.quantity,
        price: newProductSale.isGift ? 0 : newProductSale.price,
        discount: newProductSale.discount,
        isGift: newProductSale.isGift,
        reserveId: "",
      });

      setNewProductSale({
        productId: "",
        quantity: 1,
        price: 0,
        discount: 0,
        isGift: false,
        reserveId: "",
      });

      toast({
        title: "Éxito",
        description: "Producto agregado correctamente",
      });

      if (onProductSaleSuccess) {
        onProductSaleSuccess();
      }
    } catch {
      toast({
        title: "Error",
        description: "No se pudo agregar el producto",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveProductSale = async (productSaleId: string) => {
    setRemovingId(productSaleId);
    try {
      await onRemoveProductSale(productSaleId);
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
    } finally {
      setRemovingId(null);
    }
  };

  const totalConsumption = productSales.reduce(
    (sum, ps) => sum + ps.quantity * ps.price,
    0
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium flex items-center gap-2 text-lg">
          <ShoppingBasket className="h-5 w-5" />
          Consumos Registrados
        </h4>
        <Badge variant="outline" className="px-3 py-1">
          Total: ${totalConsumption.toLocaleString()}
        </Badge>
      </div>

      {/* Lista de consumos */}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {productSales.length === 0 ? (
          <div className="text-center py-4 text-sm text-gray-500">
            No hay consumos registrados
          </div>
        ) : (
          productSales.map((productSale) => (
            <div
              key={productSale.id}
              className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {productSale.isGift ? (
                      <Gift className="h-5 w-5 text-pink-500" />
                    ) : (
                      <div className="h-5 w-5 flex items-center justify-center text-sm">
                        {productSale.product.category === "BEBIDA" && "🥤"}
                        {productSale.product.category === "COMIDA" && "🍔"}
                        {productSale.product.category === "SNACK" && "🍿"}
                        {productSale.product.category === "EQUIPAMIENTO" &&
                          "⚽"}
                        {productSale.product.category === "OTRO" && "📦"}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {productSale.quantity}x {productSale.product.name}
                      {productSale.discount !== 0 && (
                        <span className="ml-2 text-xs text-orange-600">
                          {productSale.discount} % desc.
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      ${productSale.price.toLocaleString()} c/u • Total: $
                      {(
                        productSale.quantity * productSale.price
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                  onClick={() => handleRemoveProductSale(productSale.id)}
                  disabled={removingId === productSale.id}
                >
                  {removingId === productSale.id ? (
                    <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Formulario para nuevo consumo */}
      <div className="space-y-4 border-t pt-4">
        <h5 className="font-medium flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Agregar Nuevo Consumo
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1 md:col-span-2">
            <Label>Producto</Label>
            {isLoadingProducts ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={newProductSale.productId}
                onValueChange={(value) => {
                  const product = products.find((p) => p.id === value);
                  setNewProductSale({
                    ...newProductSale,
                    productId: value,
                    price: product?.salePrice || 0,
                  });
                }}
                disabled={isLoadingProducts}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar producto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {product.category === "BEBIDA" && "🥤"}
                          {product.category === "COMIDA" && "🍔"}
                          {product.category === "SNACK" && "🍿"}
                          {product.category === "EQUIPAMIENTO" && "⚽"}
                          {product.category === "OTRO" && "📦"}
                        </span>
                        <span>
                          {product.name} (${product.salePrice})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-1">
            <Label>Cantidad</Label>
            <Input
              type="number"
              min="1"
              value={newProductSale.quantity}
              onChange={(e) =>
                setNewProductSale({
                  ...newProductSale,
                  quantity: Number(e.target.value),
                })
              }
              disabled={processing}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label>Precio Unitario</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <Input
                type="number"
                min="0"
                value={newProductSale.price}
                onChange={(e) =>
                  setNewProductSale({
                    ...newProductSale,
                    price: Number(e.target.value),
                  })
                }
                className="pl-8"
                disabled={newProductSale.isGift || processing}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Descuento (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={newProductSale.discount || 0}
              onChange={(e) =>
                setNewProductSale({
                  ...newProductSale,
                  discount: Number(e.target.value),
                })
              }
              disabled={processing}
            />
          </div>

          <div className="flex items-end space-x-2">
            <div className="flex items-center space-x-2">
              <input
                id="isGift"
                type="checkbox"
                checked={newProductSale.isGift}
                onChange={(e) =>
                  setNewProductSale({
                    ...newProductSale,
                    isGift: e.target.checked,
                    price: e.target.checked ? 0 : newProductSale.price,
                  })
                }
                className="h-4 w-4"
                disabled={processing}
              />
              <Label htmlFor="isGift">Es regalo</Label>
            </div>
          </div>
        </div>

        <Button
          className="w-full mt-2"
          onClick={handleAddProductSale}
          disabled={!newProductSale.productId || processing}
        >
          {processing ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Procesando...
            </>
          ) : (
            <>
              <ShoppingBasket className="mr-2 h-4 w-4" />
              Agregar Consumo
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
