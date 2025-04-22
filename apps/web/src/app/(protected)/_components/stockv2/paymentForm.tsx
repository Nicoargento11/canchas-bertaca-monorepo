import { useState } from "react";
import { CreditCard, Plus, X, DollarSign } from "lucide-react";
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
import { Payment, PaymentMethod } from "@/services/payments/payments";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export const METODOS_PAGO = {
  EFECTIVO: { icono: "💵", nombre: "Efectivo" },
  TARJETA_CREDITO: { icono: "💳", nombre: "Tarjeta" },
  TRANSFERENCIA: { icono: "↗️", nombre: "Transferencia" },
  MERCADOPAGO: { icono: "🔵", nombre: "MercadoPago" },
  OTRO: { icono: "❔", nombre: "Otro" },
} as const;

interface PaymentFormProps {
  payments?: Payment[];
  onAddPayment: (payment: Omit<Payment, "id" | "createdAt">) => Promise<void>;
  onRemovePayment: (paymentId: string) => Promise<void>;
  isLoadingPayments?: boolean;
  onPaymentSuccess?: () => void;
}

export default function PaymentForm({
  payments,
  onAddPayment,
  onRemovePayment,
  isLoadingPayments = false,
  onPaymentSuccess,
}: PaymentFormProps) {
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [newPayment, setNewPayment] = useState<
    Omit<Payment, "id" | "createdAt">
  >({
    amount: 0,
    method: PaymentMethod.EFECTIVO,
    isPartial: false,
    reserveId: "",
  });

  const handleAddPayment = async () => {
    if (newPayment.amount <= 0) {
      toast({
        title: "Error",
        description: "El monto debe ser mayor a cero",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      await onAddPayment(newPayment);
      setNewPayment({
        amount: 0,
        method: PaymentMethod.EFECTIVO,
        isPartial: false,
        reserveId: "",
      });
      toast({
        title: "Éxito",
        description: "Pago registrado correctamente",
      });

      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    } catch {
      toast({
        title: "Error",
        description: "No se pudo registrar el pago",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRemovePayment = async (paymentId: string) => {
    setRemovingId(paymentId);
    try {
      await onRemovePayment(paymentId);
      toast({
        title: "Éxito",
        description: "Pago eliminado correctamente",
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo eliminar el pago",
        variant: "destructive",
      });
    } finally {
      setRemovingId(null);
    }
  };

  const totalPayments = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium flex items-center gap-2 text-lg">
          <CreditCard className="h-5 w-5" />
          Pagos Registrados
        </h4>
        <Badge variant="outline" className="px-3 py-1">
          Total: ${totalPayments.toLocaleString()}
        </Badge>
      </div>

      {/* Lista de pagos */}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {isLoadingPayments ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 w-full">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-3 w-[80px]" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          ))
        ) : payments?.length === 0 ? (
          <div className="text-center py-4 text-sm text-gray-500">
            No hay pagos registrados
          </div>
        ) : (
          payments?.map((payment) => (
            <div
              key={payment.id}
              className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {METODOS_PAGO[payment.method].icono}
                  </span>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      ${payment.amount.toLocaleString()}
                      {payment.isPartial && (
                        <Badge variant="secondary" className="text-xs">
                          Parcial
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 capitalize">
                      {payment.method.toLowerCase().replace("_", " ")}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                  onClick={() => handleRemovePayment(payment.id)}
                  disabled={removingId === payment.id}
                >
                  {removingId === payment.id ? (
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

      {/* Formulario para nuevo pago */}
      <div className="space-y-4 border-t pt-4">
        <h5 className="font-medium flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Agregar Nuevo Pago
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label>Método de Pago</Label>
            <Select
              value={newPayment.method}
              onValueChange={(value) =>
                setNewPayment({
                  ...newPayment,
                  method: value as PaymentMethod,
                })
              }
              disabled={processing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(METODOS_PAGO).map(
                  ([key, { icono, nombre }]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center">
                        <span className="mr-2">{icono}</span>
                        {nombre}
                      </div>
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Monto</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <Input
                type="number"
                min="0"
                value={newPayment.amount}
                onChange={(e) =>
                  setNewPayment({
                    ...newPayment,
                    amount: Number(e.target.value),
                  })
                }
                className="pl-8"
                disabled={processing}
              />
            </div>
          </div>

          <div className="flex items-end space-x-2">
            <div className="flex items-center space-x-2">
              <input
                id="isPartial"
                type="checkbox"
                checked={newPayment.isPartial}
                onChange={(e) =>
                  setNewPayment({
                    ...newPayment,
                    isPartial: e.target.checked,
                  })
                }
                className="h-4 w-4"
                disabled={processing}
              />
              <Label htmlFor="isPartial">Pago Parcial</Label>
            </div>
          </div>
        </div>

        <Button
          className="w-full mt-2"
          onClick={handleAddPayment}
          disabled={newPayment.amount <= 0 || processing}
        >
          {processing ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Procesando...
            </>
          ) : (
            <>
              <DollarSign className="mr-2 h-4 w-4" />
              Registrar Pago
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
