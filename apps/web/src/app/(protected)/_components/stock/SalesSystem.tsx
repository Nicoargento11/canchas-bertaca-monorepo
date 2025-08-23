"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Search, Plus, Minus, Trash2, ShoppingCart, Gift, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useProductStore } from "@/store/stockManagementStore";
import { useCartStore } from "@/store/cartStore";
import { Product } from "@/services/product/product";
import { createProductSale } from "@/services/product-sale.ts/product-sale";
import { Complex } from "@/services/complex/complex";
import { createInventoryMovement } from "@/services/inventory-movement.ts/inventory-movement";
import { createPayment, PaymentMethod } from "@/services/payment/payment";
import { usePaymentsStore } from "@/store/paymentsStore";
import { useSalesStore } from "@/store/productSaleStore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useCashRegisterStore } from "@/store/cash-register";
import { CashRegisterStatus } from "./CashRegisterStatus";
import { SessionPayload } from "@/services/auth/session";
import { CashRegisterSummary } from "./CashRegisterSummary";
import { CashSession } from "@/services/cash-session/cash-session";
import { CashRegister } from "@/services/cash-register/cash-register";
import { DailySummaryResponse } from "@/services/reports/reports";
import { set } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface SaleSystemProps {
  complex: Complex;
  userSession: SessionPayload;
  activeCashSession: CashSession | null;
  cashRegisters: CashRegister[] | null;
  dailySummaryData?: DailySummaryResponse | null; // Datos del resumen diario, opcional
}

const SalesSystemSkeleton = () => (
  <>
    <div className="grid gap-4 lg:gap-6 lg:grid-cols-2">
      <div className="col-span-full">
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="space-y-3 lg:space-y-4 order-2 lg:order-1">
        <Skeleton className="h-10 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
      <div className="space-y-3 lg:space-y-4 order-1 lg:order-2">
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
    <div className="w-full mt-4 lg:mt-6 space-y-3 lg:space-y-4">
      <Skeleton className="h-48 w-full" />
    </div>
  </>
);

export function SaleSystem({
  complex,
  userSession,
  activeCashSession,
  cashRegisters,
  dailySummaryData,
}: SaleSystemProps) {
  const { products, updateProduct, initializeProducts } = useProductStore();
  const { addPayment, updatePayment } = usePaymentsStore();
  const { addSale } = useSalesStore();
  const { cart, addToCart, updateCartItem, removeFromCart, clearCart, applyDiscount, toggleGift } =
    useCartStore();

  const { activeSession, activeRegister, setRegisters, setActiveSession, setActiveRegister } =
    useCashRegisterStore();

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("EFECTIVO");
  const [customerName, setCustomerName] = useState("");

  useEffect(() => {
    initializeProducts(complex.products);
  }, [complex.products]);

  useEffect(() => {
    // Cargar las cajas registradoras y la sesión activa al montar el componente
    if (cashRegisters) {
      setRegisters(cashRegisters);
    }
    if (activeCashSession) {
      setActiveSession(activeCashSession);
      setActiveRegister(activeCashSession.cashRegister);
    }
    setIsLoading(false);
  }, [activeCashSession, cashRegisters]);

  // Verificar si hay caja activa
  const canProcessSale = useMemo(() => {
    return activeSession && activeRegister && cart.length > 0;
  }, [activeSession, activeRegister, cart]);

  // Filtrar productos disponibles
  const availableProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.stock > 0 &&
        (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.barcode?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [products, searchTerm]);

  const { subtotal, totalDiscount } = useMemo(() => {
    const subtotal = cart.reduce((total, item) => {
      if (item.isGift) return total;
      return total + item.price * item.quantity * (1 - (item.discount || 0) / 100);
    }, 0);

    const totalDiscount = cart.reduce((total, item) => {
      if (item.isGift) return total;
      return total + (item.price * item.quantity * (item.discount || 0)) / 100;
    }, 0);

    return { subtotal, totalDiscount };
  }, [cart]);

  const handleAddToCart = useCallback(
    (product: Product) => {
      const existingItem = cart.find((item) => item.product.id === product.id);

      if (existingItem) {
        if (existingItem.quantity < product.stock) {
          updateCartItem(product.id, existingItem.quantity + 1);
        } else {
          toast.error("Stock insuficiente", {
            description: `Solo hay ${product.stock} unidades disponibles.`,
          });
        }
      } else {
        addToCart({
          product,
          price: product.salePrice,
          discount: 0,
          isGift: false,
        });
      }
    },
    [cart, updateCartItem, addToCart]
  );

  const handleUpdateQuantity = useCallback(
    (productId: string, newQuantity: number) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return;

      if (newQuantity > product.stock) {
        toast.error("Stock insuficiente", {
          description: `Solo hay ${product.stock} unidades disponibles.`,
        });
        return;
      }

      if (newQuantity <= 0) {
        removeFromCart(productId);
      } else {
        updateCartItem(productId, newQuantity);
      }
    },
    [products, updateCartItem, removeFromCart]
  );

  const handleDiscountChange = useCallback(
    (productId: string, discount: number) => {
      if (discount < 0 || discount > 100) {
        toast.error("Descuento inválido", {
          description: "El descuento debe estar entre 0% y 100%",
        });
        return;
      }
      applyDiscount(productId, discount);
    },
    [applyDiscount]
  );

  const processSale = useCallback(async () => {
    if (!activeSession || !activeRegister) {
      toast.error("No hay sesión de caja activa");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Crear el pago asociado a la sesión de caja
      const paymentResponse = await createPayment({
        amount: subtotal,
        method: paymentMethod,
        isPartial: false,
        transactionType: "VENTA_PRODUCTO",
        complexId: complex.id,
        cashSessionId: activeSession.id, // Asociar a la sesión de caja
      });

      if (!paymentResponse.success) {
        throw new Error(paymentResponse.error || "Error al crear el pago");
      }

      addPayment(paymentResponse.data!);

      // 2. Procesar cada producto
      await Promise.all(
        cart.map(async (item) => {
          const finalPrice = item.isGift ? 0 : item.price * (1 - (item.discount || 0) / 100);

          const saleResponse = await createProductSale({
            productId: item.product.id,
            quantity: item.quantity,
            price: finalPrice,
            discount: item.isGift ? 0 : item.discount || 0,
            isGift: item.isGift,
            paymentId: paymentResponse.data!.id,
            complexId: complex.id,
          });

          if (!saleResponse.success) {
            throw new Error(`Error al registrar venta para ${item.product.name}`);
          }

          addSale(saleResponse.data!);

          // Actualizar pago con las ventas asociadas
          updatePayment(paymentResponse.data!.id, {
            productSales: paymentResponse.data!.productSales
              ? [...paymentResponse.data!.productSales, saleResponse.data!]
              : [saleResponse.data!],
          });

          // Actualizar stock localmente
          updateProduct(item.product.id, {
            stock: item.product.stock - item.quantity,
          });

          // Registrar movimiento de inventario
          await createInventoryMovement({
            type: item.isGift ? "REGALO" : "VENTA",
            quantity: item.quantity,
            productId: item.product.id,
            complexId: complex.id,
            reason: item.isGift
              ? `Regalo (Venta ${saleResponse.data!.id})`
              : `Venta ${saleResponse.data!.id}`,
          });
        })
      );

      // Limpiar carrito después de la venta
      clearCart();
      setPaymentMethod("EFECTIVO");
      setCustomerName("");
      setSearchTerm("");

      toast.success("Venta completada", {
        description: `Venta por $${subtotal.toFixed(2)} registrada en ${activeRegister.name}.`,
        duration: 5000,
      });
    } catch (error) {
      console.error("Error en processSale:", error);
      toast.error("Error al procesar venta", {
        description: error instanceof Error ? error.message : "Error inesperado",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [
    cart,
    subtotal,
    paymentMethod,
    complex.id,
    updateProduct,
    clearCart,
    activeSession,
    activeRegister,
  ]);

  if (isLoading) {
    return <SalesSystemSkeleton />;
  }

  // Mostrar alerta si no hay caja activa
  if (!activeSession || !activeRegister) {
    return (
      <>
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Atención</AlertTitle>
          <AlertDescription>
            No hay una sesión de caja activa. Por favor, selecciona una caja y ábrela antes de
            realizar ventas.
          </AlertDescription>
        </Alert>
        <CashRegisterStatus complexId={complex.id} userId={userSession?.user.id || ""} />
      </>
    );
  }
  return (
    <>
      <div className="grid gap-4 lg:gap-6 lg:grid-cols-2">
        {/* Panel de información de caja */}
        <div className="col-span-full">
          <Card className="p-3 lg:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-medium text-sm sm:text-base">Caja: {activeRegister.name}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Sesión iniciada: {new Date(activeSession.startAt).toLocaleString()}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="font-medium text-sm sm:text-base">
                  Monto inicial: ${activeSession.initialAmount.toFixed(2)}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {activeSession.observations || "Sin observaciones"}
                </p>
              </div>
            </div>{" "}
          </Card>
        </div>
        {/* Panel de productos */}
        <div className="space-y-3 lg:space-y-4 order-2 lg:order-1">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-sm"
            />
          </div>

          <div className="max-h-80 lg:max-h-96 overflow-y-auto space-y-2">
            {availableProducts.map((product) => (
              <Card key={product.id} className="p-2 lg:p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm lg:text-base truncate">{product.name}</h4>
                    <p className="text-xs lg:text-sm text-muted-foreground">
                      <span className="hidden sm:inline">{product.barcode} - </span>
                      Stock: {product.stock}
                    </p>
                    <p className="text-sm lg:text-base font-medium">
                      ${product.salePrice.toFixed(2)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className="flex-shrink-0"
                  >
                    <Plus className="h-3 w-3 lg:h-4 lg:w-4" />
                  </Button>
                </div>
              </Card>
            ))}{" "}
          </div>
        </div>
        {/* Panel del carrito */}
        <div className="space-y-3 lg:space-y-4 order-1 lg:order-2">
          <Card>
            <CardHeader className="pb-3 lg:pb-6">
              <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                <ShoppingCart className="h-4 w-4 lg:h-5 lg:w-5" />
                Carrito de Compras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 lg:space-y-4 pt-0">
              {cart.length === 0 ? (
                <p className="text-center text-muted-foreground py-6 lg:py-8 text-sm">
                  El carrito está vacío
                </p>
              ) : (
                <div className="space-y-2 lg:space-y-3">
                  {cart.map((item) => {
                    const itemTotal = item.price * item.quantity;
                    const discountAmount = item.isGift
                      ? 0
                      : (itemTotal * (item.discount || 0)) / 100;
                    const finalPrice = item.isGift ? 0 : itemTotal - discountAmount;

                    return (
                      <div key={item.product.id} className="p-2 lg:p-3 border rounded space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-sm lg:text-base truncate">
                              {item.product.name}
                            </h5>
                            <p className="text-xs lg:text-sm text-muted-foreground">
                              ${item.price.toFixed(2)} c/u
                              <span className="hidden sm:inline">
                                {" "}
                                - Stock: {item.product.stock}
                              </span>
                            </p>
                          </div>

                          <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleGift(item.product.id)}
                              title="Marcar como regalo"
                              className="h-8 w-8 p-0"
                            >
                              <Gift
                                className={`h-3 w-3 lg:h-4 lg:w-4 ${item.isGift ? "text-primary fill-primary" : ""}`}
                              />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeFromCart(item.product.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1 lg:gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleUpdateQuantity(item.product.id, item.quantity - 1)
                              }
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 lg:w-8 text-center text-sm lg:text-base">
                              {item.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleUpdateQuantity(item.product.id, item.quantity + 1)
                              }
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="text-right flex-shrink-0">
                            {!item.isGift && item.discount > 0 && (
                              <p className="text-xs lg:text-sm line-through text-muted-foreground">
                                ${itemTotal.toFixed(2)}
                              </p>
                            )}
                            <p
                              className={`font-medium text-sm lg:text-base ${
                                item.isGift
                                  ? "text-purple-600"
                                  : item.discount > 0
                                    ? "text-green-600"
                                    : ""
                              }`}
                            >
                              {item.isGift ? "GRATIS" : `$${finalPrice.toFixed(2)}`}
                            </p>
                            {item.isGift && (
                              <span className="text-xs bg-purple-600 text-white px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full">
                                Regalo
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <Label
                            htmlFor={`discount-${item.product.id}`}
                            className="text-xs lg:text-sm whitespace-nowrap"
                          >
                            Descuento:
                          </Label>
                          <div className="flex items-center gap-1">
                            <Input
                              id={`discount-${item.product.id}`}
                              type="number"
                              min="0"
                              max="100"
                              className="w-16 lg:w-20 h-8 text-sm"
                              value={item.discount || 0}
                              onChange={(e) =>
                                handleDiscountChange(item.product.id, Number(e.target.value))
                              }
                            />
                            <span className="text-sm">%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}{" "}
              <Separator />
              <div className="space-y-2 lg:space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm lg:text-base">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-red-600 text-sm lg:text-base">
                    <span>Descuento total:</span>
                    <span>-${totalDiscount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base lg:text-lg font-semibold">
                    <span>Total:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cliente" className="text-sm lg:text-base">
                    Cliente (opcional)
                  </Label>
                  <Input
                    id="cliente"
                    placeholder="Nombre del cliente"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="text-sm lg:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metodoPago" className="text-sm lg:text-base">
                    Método de Pago *
                  </Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}
                  >
                    <SelectTrigger className="text-sm lg:text-base">
                      <SelectValue placeholder="Selecciona método de pago" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                      <SelectItem value="TARJETA_CREDITO">Tarjeta</SelectItem>
                      <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                      <SelectItem value="MERCADOPAGO">Mercado Pago</SelectItem>
                      <SelectItem value="OTRO">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full h-10 lg:h-11 text-sm lg:text-base"
                  onClick={processSale}
                  disabled={!canProcessSale}
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Procesando...
                    </div>
                  ) : (
                    "Procesar venta"
                  )}
                </Button>
              </div>
            </CardContent>{" "}
          </Card>
        </div>
      </div>
      <div className="w-full mt-4 lg:mt-6 space-y-3 lg:space-y-4">
        <CashRegisterStatus complexId={complex.id} userId={userSession?.user.id || ""} />
        <CashRegisterSummary dailySummaryData={dailySummaryData} />
      </div>
    </>
  );
}
