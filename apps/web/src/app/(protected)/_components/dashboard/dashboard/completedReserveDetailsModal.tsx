"use client";

import { Button } from "@/components/ui/button";
import {
  Receipt,
  UserCircle2,
  Coins,
  Clock9,
  CalendarDays,
  Mail,
  AlertCircle,
  Phone,
  Icon,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  DollarSign,
  CheckCircle2,
  History,
} from "lucide-react";
import { soccerPitch } from "@lucide/lab";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { useCompletedReserveDetailsModalStore } from "@/store/completedReserveDetailsModalStore";
import { Modal } from "@/components/modals/modal";
import { useDashboardDataStore } from "@/store/dashboardDataStore";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PaymentMethod } from "@/services/payment/payment";

const CompletedReserveDetailsModal = () => {
  const { isOpen, handleChangeCompletedDetails } = useCompletedReserveDetailsModalStore(
    (state) => state
  );
  const { reserve } = useDashboardDataStore((state) => state);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APROBADO":
        return <Badge className="bg-Success text-white">Aprobado</Badge>;
      case "PENDIENTE":
        return <Badge className="bg-Warning text-white">Pendiente</Badge>;
      case "RECHAZADO":
        return <Badge className="bg-Error text-white">Rechazado</Badge>;
      case "CANCELADO":
        return <Badge className="bg-Error text-white">Cancelado</Badge>;
      case "COMPLETADO":
        return <Badge className="bg-Success text-white">Completado</Badge>;
      default:
        return <Badge className="bg-Neutral-dark text-white">Desconocido</Badge>;
    }
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case "EFECTIVO":
        return <Banknote className="text-green-400" size={16} />;
      case "TARJETA_CREDITO":
        return <CreditCard className="text-blue-400" size={16} />;
      case "TRANSFERENCIA":
        return <ArrowRightLeft className="text-purple-400" size={16} />;
      case "MERCADOPAGO":
        return <DollarSign className="text-blue-400" size={16} />;
      default:
        return <Receipt className="text-white/60" size={16} />;
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case "EFECTIVO":
        return "Efectivo";
      case "TARJETA_CREDITO":
        return "Tarjeta de Crédito";
      case "TRANSFERENCIA":
        return "Transferencia";
      case "MERCADOPAGO":
        return "MercadoPago";
      default:
        return method;
    }
  };

  const getTotalPaid = () => {
    if (!reserve?.payment) return 0;
    return reserve.payment.reduce((total, payment) => total + payment.amount, 0);
  };

  const reserveDetails = reserve ? (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      {/* Información del Cliente */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="p-4 border-b border-white/10 bg-white/5">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <UserCircle2 size={20} />
            Información del Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <div className="flex items-center gap-4">
            <UserCircle2 className="text-Primary" size={20} />
            <div>
              <p className="text-sm text-white/60 font-medium">Nombre</p>
              <p className="font-semibold text-white">
                {reserve.clientName || reserve.user?.name || "No especificado"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Mail className="text-Primary" size={20} />
            <div>
              <p className="text-sm text-white/60 font-medium">Email</p>
              <p className="font-semibold text-white">{reserve.user?.email || "No especificado"}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Phone className="text-Primary" size={20} />
            <div>
              <p className="text-sm text-white/60 font-medium">Teléfono</p>
              <p className="font-semibold text-white">{reserve.phone || "No especificado"}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <AlertCircle className="text-Primary" size={20} />
            <div>
              <p className="text-sm text-white/60 font-medium">Estado</p>
              {getStatusBadge(reserve.status)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalles de la Reserva */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="p-4 border-b border-white/10 bg-white/5">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <CalendarDays size={20} />
            Detalles de la Reserva
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <div className="flex items-center gap-4">
            <CalendarDays className="text-Primary" size={20} />
            <div>
              <p className="text-sm text-white/60 font-medium">Fecha</p>
              <p className="font-semibold text-white">
                {format(new Date(reserve.date), "PPP", { locale: es })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Clock9 className="text-Primary" size={20} />
            <div>
              <p className="text-sm text-white/60 font-medium">Horario</p>
              <p className="font-semibold text-white">{reserve.schedule}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Icon iconNode={soccerPitch} className="text-Primary" size={20} />
            <div>
              <p className="text-sm text-white/60 font-medium">Cancha</p>
              <p className="font-semibold text-white">
                {reserve.court?.name || `Cancha ${reserve.court?.courtNumber}` || "No especificado"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Receipt className="text-Primary" size={20} />
            <div>
              <p className="text-sm text-white/60 font-medium">Precio Total</p>
              <p className="font-semibold text-white">
                {(reserve.price ?? 0).toLocaleString("es-AR", {
                  style: "currency",
                  currency: "ARS",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de Pagos */}
      <Card className="border border-green-900/30 bg-green-900/20">
        <CardHeader className="p-4 border-b border-green-900/30 bg-green-900/30">
          <CardTitle className="text-lg font-semibold text-green-400 flex items-center gap-2">
            <CheckCircle2 size={20} />
            Resumen de Pagos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white/5 rounded-lg border border-green-900/30">
              <p className="text-sm text-white/60 font-medium">Total Pagado</p>
              <p className="text-2xl font-bold text-green-400">
                {getTotalPaid().toLocaleString("es-AR", {
                  style: "currency",
                  currency: "ARS",
                })}
              </p>
            </div>

            <div className="text-center p-3 bg-white/5 rounded-lg border border-green-900/30">
              <p className="text-sm text-white/60 font-medium">Cantidad de Pagos</p>
              <p className="text-2xl font-bold text-green-400">{reserve.payment?.length || 0}</p>
            </div>

            <div className="text-center p-3 bg-white/5 rounded-lg border border-green-900/30">
              <p className="text-sm text-white/60 font-medium">Estado</p>
              <p className="text-lg font-bold text-green-400 flex items-center justify-center gap-2">
                <CheckCircle2 size={20} />
                Completado
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historial de Pagos */}
      {reserve.payment && reserve.payment.length > 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="p-4 border-b border-white/10 bg-white/5">
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <History size={20} />
              Historial de Pagos ({reserve.payment.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-60 overflow-y-auto">
              {reserve.payment.map((payment, index) => (
                <div
                  key={payment.id}
                  className={`p-4 ${index !== reserve.payment!.length - 1 ? "border-b border-white/10" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getPaymentMethodIcon(payment.method)}
                      <div>
                        <p className="font-semibold text-white">
                          {getPaymentMethodLabel(payment.method)}
                        </p>
                        <p className="text-sm text-white/60">
                          {format(new Date(payment.createdAt), "PPp", { locale: es })}
                        </p>
                        {payment.CashSession && (
                          <p className="text-xs text-blue-400 bg-blue-900/20 px-2 py-1 rounded mt-1 inline-block">
                            Sesión de Caja:{" "}
                            {format(new Date(payment.CashSession.startAt), "dd/MM/yyyy HH:mm")}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-400">
                        {payment.amount.toLocaleString("es-AR", {
                          style: "currency",
                          currency: "ARS",
                        })}
                      </p>
                      <p className="text-xs text-white/50">{payment.transactionType}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información Adicional */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/60">
            <div>
              <p className="font-medium">Reserva creada:</p>
              <p>{format(new Date(reserve.createdAt), "PPp", { locale: es })}</p>
            </div>
            <div>
              <p className="font-medium">Última actualización:</p>
              <p>{format(new Date(reserve.updatedAt), "PPp", { locale: es })}</p>
            </div>
            {reserve.paymentIdExt && (
              <div className="md:col-span-2">
                <p className="font-medium">ID de Pago Externo:</p>
                <p className="font-mono text-xs bg-white/10 px-2 py-1 rounded border border-white/10 text-white">
                  {reserve.paymentIdExt}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  ) : (
    <div className="flex justify-center items-center h-32">
      <p className="text-white/60">Cargando información...</p>
    </div>
  );

  return (
    <Modal
      title="Detalles de Reserva Completada"
      isOpen={isOpen}
      onClose={handleChangeCompletedDetails}
      body={reserveDetails}
    />
  );
};

export default CompletedReserveDetailsModal;
