"use client";
import { CheckCircle2, CreditCard, Banknote, UserRound, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useTransition } from "react";
import { Label } from "@/components/ui/label";
import { useDashboardCompleteReserveModalStore } from "@/store/completeReserveDashboardModalStore";
import { useDashboardDataStore } from "@/store/dashboardDataStore";
import { useReservationDashboard } from "@/contexts/ReserveDashboardContext";
import { format } from "date-fns";
import { toast } from "sonner";
import { createPayment, PaymentMethod } from "@/services/payment/payment";
import { getActiveCashSession } from "@/services/cash-session/cash-session";
import { getAllCashRegisters } from "@/services/cash-register/cash-register";
import { updateReserveStatus } from "@/services/reserve/reserve";

export const CompleteReserveForm = () => {
  const [isPending, startTransition] = useTransition(); // Configuración dinámica de métodos de pago
  const PAYMENT_METHODS = [
    {
      key: "efectivo",
      label: "Efectivo",
      method: "EFECTIVO" as PaymentMethod,
      icon: Banknote,
      color: "text-green-600",
    },
    {
      key: "tarjeta",
      label: "Tarjeta",
      method: "TARJETA_CREDITO" as PaymentMethod,
      icon: CreditCard,
      color: "text-orange-600",
    },
    {
      key: "transferencia",
      label: "Transferencia",
      method: "TRANSFERENCIA" as PaymentMethod,
      icon: CreditCard,
      color: "text-purple-600",
    },
    {
      key: "mercadoPago",
      label: "MercadoPago",
      method: "MERCADOPAGO" as PaymentMethod,
      icon: CreditCard,
      color: "text-blue-600",
    },
  ];

  const [paymentData, setPaymentData] = useState<Record<string, string>>(
    PAYMENT_METHODS.reduce(
      (acc, method) => {
        acc[method.key] = "";
        return acc;
      },
      {} as Record<string, string>
    )
  );

  const { handleChangeCompleteReserve } = useDashboardCompleteReserveModalStore((state) => state);
  const { reserve, date } = useDashboardDataStore((state) => state);
  const { fetchReservationsByDay, state } = useReservationDashboard();
  const selectedDate = date && format(date, "yyyy-MM-dd");
  useEffect(() => {
    if (reserve) {
      // Calcular el monto restante (precio total - monto ya pagado)
      const remainingAmount = reserve.price - (reserve.reservationAmount || 0);
      const initialData = PAYMENT_METHODS.reduce(
        (acc, method) => {
          acc[method.key] = method.key === "efectivo" ? remainingAmount.toString() : "";
          return acc;
        },
        {} as Record<string, string>
      );

      setPaymentData(initialData);
    }
  }, [reserve]);

  const handlePaymentChange = (method: string, value: string) => {
    setPaymentData((prev) => ({
      ...prev,
      [method]: value,
    }));
  };

  const calculateTotalPayments = () => {
    return Object.values(paymentData).reduce((total, value) => {
      return total + (parseFloat(value) || 0);
    }, 0);
  };
  const handleCompleteReservation = async () => {
    if (!reserve) return;

    const remainingAmount = reserve.price - (reserve.reservationAmount || 0);
    const totalPayments = calculateTotalPayments();

    if (Math.abs(totalPayments - remainingAmount) > 0.01) {
      toast.error(
        `El total de pagos ($${totalPayments}) debe ser igual al monto restante ($${remainingAmount})`
      );
      return;
    }

    startTransition(async () => {
      try {
        // Obtener cash session activo si hay un complejo seleccionado
        let cashSessionId: string | undefined;

        if (state.currentComplex?.id) {
          // Primero obtener los cash registers del complejo
          const { success: registersSuccess, data: cashRegisters } = await getAllCashRegisters(
            state.currentComplex.id
          );

          if (registersSuccess && cashRegisters && cashRegisters.length > 0) {
            // Tomar el primer cash register activo
            const activeCashRegister = cashRegisters.find((register) => register.isActive);

            if (activeCashRegister) {
              // Buscar cash session activo para este cash register
              const { success, data: activeCashSession } = await getActiveCashSession(
                activeCashRegister.id
              );

              if (success && activeCashSession) {
                cashSessionId = activeCashSession.id;
              }
            }
          }
        } // Crear pagos dinámicamente para cada método utilizado
        const paymentPromises = PAYMENT_METHODS.filter(
          (method) => parseFloat(paymentData[method.key]) > 0
        ).map((method) =>
          createPayment({
            amount: parseFloat(paymentData[method.key]),
            method: method.method,
            isPartial: true,
            reserveId: reserve.id,
            transactionType: "RESERVA",
            complexId: state.currentComplex?.id,
            cashSessionId,
          })
        );

        // Ejecutar todos los pagos en paralelo
        const paymentResults = await Promise.all(paymentPromises);

        // Verificar si todos los pagos fueron exitosos
        const failedPayments = paymentResults.filter((result) => !result.success);
        if (failedPayments.length > 0) {
          toast.error("Error al procesar algunos pagos");
          return;
        }

        // Actualizar el estado de la reserva a "COMPLETADO"
        const { success: updateSuccess } = await updateReserveStatus(reserve.id, "COMPLETADO");

        if (!updateSuccess) {
          toast.error("Error al actualizar el estado de la reserva");
          return;
        }

        toast.success("Reserva marcada como completada y pagos registrados");

        // Refrescar los datos y cerrar modal
        if (selectedDate && state.currentComplex && state.sportType) {
          fetchReservationsByDay(selectedDate, state.currentComplex.id, state.sportType.id);
        }
        handleChangeCompleteReserve();
      } catch (error) {
        console.error("Error completing reservation:", error);
        toast.error("Error al completar la reserva");
      }
    });
  };

  if (!reserve) return null;

  const remainingAmount = reserve.price - (reserve.reservationAmount || 0);
  const totalPayments = calculateTotalPayments();
  const isValidTotal = Math.abs(totalPayments - remainingAmount) < 0.01;

  return (
    <div className="space-y-6">
      {/* Info de la reserva */}
      <div className="bg-white/5 p-4 rounded-lg border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <UserRound className="h-4 w-4 text-white/60" />
          <p className="font-semibold text-sm text-white">
            {reserve.clientName || reserve.user?.name}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-white/60">Precio total:</p>
            <p className="font-semibold text-white">
              {reserve.price?.toLocaleString("es-AR", {
                style: "currency",
                currency: "ARS",
              })}
            </p>
          </div>
          <div>
            <p className="text-white/60">Ya pagado:</p>
            <p className="font-semibold text-white">
              {reserve.reservationAmount?.toLocaleString("es-AR", {
                style: "currency",
                currency: "ARS",
              })}
            </p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-emerald-400" />
            <p className="text-sm text-white/60">Monto restante:</p>
            <p className="text-lg font-bold text-emerald-400">
              {remainingAmount.toLocaleString("es-AR", {
                style: "currency",
                currency: "ARS",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Métodos de pago */}
      <div className="space-y-4">
        <Label className="text-base font-semibold text-white">Métodos de pago utilizados:</Label>{" "}
        <div className="grid grid-cols-2 gap-4">
          {PAYMENT_METHODS.map((method) => {
            const Icon = method.icon;
            return (
              <div key={method.key} className="space-y-2">
                <Label
                  htmlFor={method.key}
                  className="text-sm flex items-center gap-2 text-white/80"
                >
                  <Icon className={`h-4 w-4 ${method.color}`} />
                  {method.label}
                </Label>
                <Input
                  id={method.key}
                  type="number"
                  placeholder="0"
                  value={paymentData[method.key]}
                  onChange={(e) => handlePaymentChange(method.key, e.target.value)}
                  className="text-sm bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
              </div>
            );
          })}
        </div>
        {/* Total */}
        <div
          className={`flex justify-between items-center p-3 rounded-lg border-2 ${
            isValidTotal ? "bg-green-900/20 border-green-900/30" : "bg-red-900/20 border-red-900/30"
          }`}
        >
          <span className="text-base font-semibold text-white">Total pagos:</span>
          <span className={`text-lg font-bold ${isValidTotal ? "text-green-400" : "text-red-400"}`}>
            {totalPayments.toLocaleString("es-AR", {
              style: "currency",
              currency: "ARS",
            })}
          </span>
        </div>
        {!isValidTotal && (
          <p className="text-sm text-red-400 text-center">
            El total debe coincidir exactamente con el monto restante
          </p>
        )}
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={handleChangeCompleteReserve}
          className="flex-1 border-white/10 text-white hover:bg-white/10 bg-transparent"
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleCompleteReservation}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          disabled={!isValidTotal || isPending}
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          {isPending ? "Completando..." : "Completar Reserva"}
        </Button>
      </div>
    </div>
  );
};
