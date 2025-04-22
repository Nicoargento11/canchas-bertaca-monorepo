"use client";
import {
  Clock,
  User,
  CreditCard,
  ShoppingCart,
  DollarSign,
  Calendar,
  List,
  Receipt,
} from "lucide-react";
import { GiSoccerField } from "react-icons/gi";
import { Button } from "@/components/ui/button";
import calculateTotals from "@/utils/calculateTotals";
import PaymentForm from "./paymentForm";
import ProductSaleForm from "./productSaleForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Reserve } from "@/services/reserves/reserves";
import { Product } from "@/services/product/product";
import {
  createPayment,
  deletePayment,
  Payment,
} from "@/services/payments/payments";
import {
  createSale,
  deleteSale,
  ProductSale,
} from "@/services/product-sale/product-sale";
import { useState } from "react";

interface ReserveModalInfoProps {
  products: Product[];
  reserve: Reserve;
  onClose: () => void;
  onPaymentAdded?: () => void;
  onProductSaleAdded?: () => void;
}

export default function ReserveModalInfo({
  reserve: initialReserve,
  products,
  onClose,
}: ReserveModalInfoProps) {
  const [reserve, setReserve] = useState<Reserve>(initialReserve);

  const statusColor = {
    APROBADO: "bg-green-100 text-green-800",
    PENDIENTE: "bg-yellow-100 text-yellow-800",
    RECHAZADO: "bg-red-100 text-red-800",
  }[reserve.status];

  const totals = calculateTotals(reserve);

  const handleAddPayment = async (
    payment: Omit<Payment, "id" | "createdAt">
  ) => {
    try {
      const newPayment = await createPayment({
        ...payment,
        reserveId: reserve.id,
      });

      setReserve((prev) => ({
        ...prev,
        Payment: [...(prev.Payment || []), newPayment],
      }));
    } catch (error) {
      console.error("Error adding payment:", error);
    }
  };

  const handleRemovePayment = async (paymentId: string) => {
    try {
      await deletePayment(paymentId);

      setReserve((prev) => ({
        ...prev,
        Payment: prev.Payment?.filter((p) => p.id !== paymentId) || [],
      }));
    } catch (error) {
      console.error("Error removing payment:", error);
    }
  };

  const handleAddProductSale = async (
    productSale: Omit<ProductSale, "id" | "createdAt" | "updatedAt" | "product">
  ) => {
    try {
      const newSale = await createSale({
        ...productSale,
        reserveId: reserve.id,
      });

      setReserve((prev) => ({
        ...prev,
        consumitions: [...(prev.consumitions || []), newSale],
      }));
    } catch (error) {
      console.error("Error adding product sale:", error);
    }
  };

  const handleRemoveProductSale = async (productSaleId: string) => {
    try {
      await deleteSale(productSaleId);
      setReserve((prev) => ({
        ...prev,
        consumitions:
          prev.consumitions?.filter((c) => c.id !== productSaleId) || [],
      }));
    } catch (error) {
      console.error("Error removing product sale:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con información básica */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Detalles de Reserva
              <Badge className={`${statusColor} text-sm font-medium`}>
                {reserve.status}
              </Badge>
            </h2>

            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <GiSoccerField className="text-primary" size={16} />
                <span>Cancha {reserve.court}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{reserve.schedule}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{format(reserve.date, "PPP")}</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>{reserve.clientName}</span>
              </div>
              {reserve.phone && (
                <div className="flex items-center gap-2">
                  <span>📞</span>
                  <span>{reserve.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sistema de pestañas para organizar la información */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="info">
            <List className="mr-2 h-4 w-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="payments">
            <CreditCard className="mr-2 h-4 w-4" />
            Pagos
          </TabsTrigger>
          <TabsTrigger value="products">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Consumos
          </TabsTrigger>
        </TabsList>

        {/* Pestaña de Información */}
        <TabsContent value="info" className="space-y-6">
          <div className="space-y-4">
            {/* Resumen Financiero */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <DollarSign size={16} />
                Resumen Financiero
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Valor Cancha:</span>
                  <span className="font-medium">
                    ${reserve.price?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Consumos:</span>
                  <span className="font-medium">
                    ${totals.consumitionAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">Total General:</span>
                  <span className="font-medium">
                    $
                    {(
                      (reserve.price ?? 0) + totals.consumitionAmount
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Pagado:</span>
                  <span className="font-medium">
                    ${totals.paidAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">Saldo:</span>
                  <span
                    className={`font-medium ${
                      totals.balance >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    ${Math.abs(totals.balance).toLocaleString()}
                    {totals.balance < 0 && " (debe)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Resumen de Pagos */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <CreditCard size={16} />
                Resumen de Pagos ({reserve.Payment?.length || 0})
              </h4>
              {reserve.Payment?.length ? (
                <div className="space-y-2">
                  {reserve.Payment.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex justify-between items-center py-2 border-b last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {format(payment.createdAt, "HH:mm")} -{" "}
                          {payment.method.replace("_", " ")}
                        </span>
                        {payment.isPartial && (
                          <Badge variant="outline" className="text-xs">
                            Parcial
                          </Badge>
                        )}
                      </div>
                      <span className="font-medium">
                        ${payment.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No hay pagos registrados
                </p>
              )}
            </div>

            {/* Resumen de Consumos */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Receipt size={16} />
                Resumen de Consumos ({reserve.consumitions?.length || 0})
              </h4>
              {reserve.consumitions?.length ? (
                <div className="space-y-2">
                  {reserve.consumitions.map((consumo) => (
                    <div
                      key={consumo.id}
                      className="flex justify-between items-center py-2 border-b last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {consumo.quantity}x {consumo.product.name}
                        </span>
                        {consumo.isGift && (
                          <Badge variant="outline" className="text-xs">
                            Regalo
                          </Badge>
                        )}
                      </div>
                      <span className="font-medium">
                        ${(consumo.quantity * consumo.price).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No hay consumos registrados
                </p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Pestaña de Pagos */}
        <TabsContent value="payments">
          <PaymentForm
            payments={reserve.Payment || []}
            onAddPayment={handleAddPayment}
            onRemovePayment={handleRemovePayment}
          />
        </TabsContent>

        {/* Pestaña de Consumos */}
        <TabsContent value="products">
          <ProductSaleForm
            products={products}
            productSales={reserve.consumitions || []}
            onAddProductSale={handleAddProductSale}
            onRemoveProductSale={handleRemoveProductSale}
          />
        </TabsContent>
      </Tabs>

      {/* Acciones */}
      <div className="flex justify-end items-center pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </div>
  );
}
