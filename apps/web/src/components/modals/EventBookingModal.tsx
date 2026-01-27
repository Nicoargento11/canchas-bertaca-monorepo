"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PartyPopper, Calendar, Clock, Phone, User, Lightbulb } from "lucide-react";
import { Complex } from "@/services/complex/complex";
import { EventPackage, getActiveEventPackages } from "@/services/event-package/event-package";
import { createReserve } from "@/services/reserve/reserve";
import { createPayment, PaymentMethod } from "@/services/payment/payment";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { getActiveCashSession } from "@/services/cash-session/cash-session";
import { getAllCashRegisters } from "@/services/cash-register/cash-register";

interface EventBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  complex: Complex;
  userId: string;
}

const PAYMENT_METHODS = [
  { value: "EFECTIVO", label: "Efectivo", icon: "💵" },
  { value: "TARJETA_CREDITO", label: "Tarjeta", icon: "💳" },
  { value: "TRANSFERENCIA", label: "Transferencia", icon: "↗️" },
  { value: "MERCADOPAGO", label: "MercadoPago", icon: "🔵" },
] as const;

export const EventBookingModal = ({
  isOpen,
  onClose,
  onSuccess,
  complex,
  userId,
}: EventBookingModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPackages, setIsLoadingPackages] = useState(false);
  const [eventPackages, setEventPackages] = useState<EventPackage[]>([]);

  // Form state
  const [selectedPackage, setSelectedPackage] = useState<EventPackage | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("15:00");
  const [withLight, setWithLight] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("EFECTIVO");
  const [reservationAmount, setReservationAmount] = useState(0);
  const [extras, setExtras] = useState("");
  const [selectedCourtIds, setSelectedCourtIds] = useState<string[]>([]);

  // Load packages when modal opens
  useEffect(() => {
    if (isOpen && complex.id) {
      loadPackages();
    }
  }, [isOpen, complex.id]);

  const loadPackages = async () => {
    setIsLoadingPackages(true);
    const { success, data, error } = await getActiveEventPackages(complex.id);
    if (success && data) {
      setEventPackages(data);
    } else {
      toast({
        title: "Error",
        description: error || "Error cargando paquetes",
        variant: "destructive",
      });
    }
    setIsLoadingPackages(false);
  };

  // Calculated values
  const finalPrice = useMemo(() => {
    if (!selectedPackage) return 0;
    return withLight ? selectedPackage.lightPrice : selectedPackage.basePrice;
  }, [selectedPackage, withLight]);

  const endTime = useMemo(() => {
    if (!selectedPackage) return "";
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalEndHour = hours + selectedPackage.durationHours;
    const endHour = totalEndHour % 24;
    return `${String(endHour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }, [startTime, selectedPackage]);

  const crossesMidnight = useMemo(() => {
    if (!selectedPackage) return false;
    const [hours] = startTime.split(":").map(Number);
    const totalEndHour = hours + selectedPackage.durationHours;
    return totalEndHour >= 24;
  }, [startTime, selectedPackage]);

  const schedule = useMemo(() => {
    if (!endTime) return "";
    return `${startTime} - ${endTime}`;
  }, [startTime, endTime]);

  // Get available courts based on package configuration
  const availableCourts = useMemo(() => {
    if (!selectedPackage) return [];

    const courtType = selectedPackage.courtType;

    // Filter active courts
    const activeCourts = complex.courts?.filter((c) => c.isActive) || [];

    // If courtType is null, "all", or empty, include all active courts
    if (!courtType || courtType === "all" || courtType === "") {
      return activeCourts;
    }

    // Filter by sport type name
    return activeCourts.filter((c) => c.sportType?.name === courtType);
  }, [selectedPackage, complex.courts]);

  // Get courts to reserve - use manually selected or auto-assign
  const courtsToReserve = useMemo(() => {
    if (!selectedPackage) return [];

    // If manually selected courts, use those
    if (selectedCourtIds.length > 0) {
      return complex.courts?.filter((c) => selectedCourtIds.includes(c.id)) || [];
    }

    // Auto-assign based on package
    const requiredCount = selectedPackage.courtCount || availableCourts.length;
    return availableCourts.slice(0, requiredCount);
  }, [selectedPackage, complex.courts, selectedCourtIds, availableCourts]);

  // Validation: check if form is complete
  const isFormValid = useMemo(() => {
    // Basic validations
    if (!selectedPackage || !selectedDate || !startTime) return false;
    if (!clientName.trim()) return false;

    // Phone validation - more flexible, just check it's not empty
    if (!clientPhone || clientPhone.trim().length < 8) return false;

    // Check courts are available
    if (courtsToReserve.length === 0) return false;

    return true;
  }, [selectedPackage, selectedDate, startTime, clientName, clientPhone, courtsToReserve]);

  const handleReset = () => {
    setSelectedPackage(null);
    setSelectedDate("");
    setStartTime("15:00");
    setWithLight(false);
    setClientName("");
    setClientPhone("");
    setPaymentMethod("EFECTIVO");
    setReservationAmount(0);
    setExtras("");
    setSelectedCourtIds([]);
  };

  // Reset selected courts when package changes
  useEffect(() => {
    setSelectedCourtIds([]);
  }, [selectedPackage?.id]);

  const handlePayment = async (reserveIds: string[]) => {
    try {
      let cashSessionId: string | undefined;

      // Get active cash session if exists
      const { success: registersSuccess, data: cashRegisters } = await getAllCashRegisters(
        complex.id
      );

      if (registersSuccess && cashRegisters && cashRegisters.length > 0) {
        const activeCashRegister = cashRegisters.find((register) => register.isActive);

        if (activeCashRegister) {
          const { success, data: activeCashSession } = await getActiveCashSession(
            activeCashRegister.id
          );
          if (success && activeCashSession) {
            cashSessionId = activeCashSession.id;
          }
        }
      }

      // Create payment linked to first reserve (they're all part of same event)
      await createPayment({
        amount: reservationAmount,
        method: paymentMethod,
        isPartial: reservationAmount < finalPrice,
        reserveId: reserveIds[0],
        transactionType: "EVENTO",
        complexId: complex.id,
        cashSessionId,
      });

      return true;
    } catch (error) {
      console.error("Payment error:", error);
      return false;
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedPackage) {
      toast({ title: "Error", description: "Selecciona un paquete", variant: "destructive" });
      return;
    }
    if (!selectedDate) {
      toast({ title: "Error", description: "Selecciona una fecha", variant: "destructive" });
      return;
    }
    if (!clientName || !clientPhone) {
      toast({
        title: "Error",
        description: "Completa los datos del cliente",
        variant: "destructive",
      });
      return;
    }
    if (courtsToReserve.length === 0) {
      toast({
        title: "Error",
        description:
          selectedCourtIds.length === 0
            ? "Selecciona al menos una cancha para el evento"
            : "No hay canchas disponibles para este paquete",
        variant: "destructive",
      });
      return;
    }

    const requiredCount = selectedPackage.courtCount || availableCourts.length;
    if (selectedCourtIds.length > 0 && selectedCourtIds.length < requiredCount) {
      toast({
        title: "Error",
        description: `Debes seleccionar ${requiredCount} cancha${requiredCount > 1 ? "s" : ""} para este paquete`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const eventGroupId = `event-${Date.now()}`;
      const eventDate = new Date(selectedDate + "T" + startTime);

      // Create reserves for all courts in the package
      const reservePromises = courtsToReserve.map(async (court, index) => {
        const pricePerCourt = Math.floor(finalPrice / courtsToReserve.length);
        // Distribuir la seña proporcionalmente entre las canchas
        const reservationAmountPerCourt =
          index === 0
            ? reservationAmount // La primera cancha lleva toda la seña
            : 0; // Las demás canchas no llevan seña (ya está en la primera)

        try {
          const result = await createReserve({
            date: eventDate,
            schedule,
            price: pricePerCourt,
            reservationAmount: reservationAmountPerCourt,
            status: "APROBADO",
            phone: clientPhone,
            clientName,
            courtId: court.id,
            complexId: complex.id,
            userId,
            reserveType: "EVENTO",
            eventPackageId: selectedPackage.id,
            // Store event metadata in notes as JSON
            notes: JSON.stringify({
              eventGroupId,
              packageId: selectedPackage.id,
              packageName: selectedPackage.name,
              withLight,
              extras: extras || undefined,
              totalPrice: finalPrice,
            }),
          });

          if (!result.success || !result.data) {
            // Incluir información de la cancha en el error
            const courtInfo = `Cancha ${court.courtNumber || court.name}`;
            throw new Error(
              result.error
                ? `${courtInfo}: ${result.error}`
                : `Error creando reserva en ${courtInfo}`
            );
          }
          return result.data.id;
        } catch (error: any) {
          // Propagar el error con información de la cancha
          throw new Error(error.message || `Error en Cancha ${court.courtNumber || court.name}`);
        }
      });

      const reserveIds = await Promise.all(reservePromises);

      // Create payment if amount > 0
      if (reservationAmount > 0) {
        const paymentSuccess = await handlePayment(reserveIds);
        if (!paymentSuccess) {
          toast({
            title: "Advertencia",
            description: "Reservas creadas pero error en el pago",
            variant: "destructive",
          });
        }
      }

      // Success message with details
      const courtNames = courtsToReserve.map((c) => `Cancha ${c.courtNumber || c.name}`).join(", ");

      toast({
        title: "✅ ¡Evento creado exitosamente!",
        description: (
          <div className="space-y-1">
            <p className="font-semibold">{selectedPackage.name}</p>
            <p className="text-sm">{courtNames}</p>
            <p className="text-sm">
              {format(new Date(selectedDate), "dd/MM/yyyy")} • {schedule}
            </p>
            <p className="text-sm font-semibold mt-2">Total: ${finalPrice.toLocaleString()}</p>
          </div>
        ),
        duration: 6000,
      });

      onSuccess();
      handleReset();
      onClose();
    } catch (error: any) {
      console.error("Error creating event:", error);

      // Extraer mensaje de error más específico
      let errorMessage = "Error al crear el evento";

      if (error.message) {
        if (error.message.includes("Conflicto de reserva")) {
          errorMessage = error.message.replace("Error:", "").trim();
        } else if (error.message.includes("Cancha")) {
          errorMessage = error.message;
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "No se pudo crear el evento",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PartyPopper className="text-purple-500" size={24} />
            Reserva de Evento / Cumpleaños
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Package Selection */}
          <div className="space-y-2">
            <Label>Seleccionar Paquete</Label>
            {isLoadingPackages ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            ) : eventPackages.length === 0 ? (
              <div className="text-center p-8 border-2 border-dashed rounded-lg">
                <p className="text-gray-500">No hay paquetes configurados</p>
                <p className="text-sm text-gray-400 mt-1">
                  Configurá paquetes desde el panel de administración
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {eventPackages.map((pkg) => (
                  <Card
                    key={pkg.id}
                    className={`cursor-pointer transition-all ${
                      selectedPackage?.id === pkg.id
                        ? "border-purple-500 bg-purple-50"
                        : "hover:border-gray-400"
                    }`}
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg">{pkg.name}</h3>
                          {pkg.description && (
                            <p className="text-sm text-gray-600">{pkg.description}</p>
                          )}
                          <ul className="text-xs text-gray-500 mt-2 space-y-1">
                            {pkg.includes.map((item, idx) => (
                              <li key={idx}>+ {item}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Sin luz</p>
                          <p className="font-bold">${pkg.basePrice.toLocaleString()}</p>
                          <p className="text-sm text-gray-500 mt-1">Con luz</p>
                          <p className="font-bold text-amber-600">
                            ${pkg.lightPrice.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {selectedPackage && (
            <>
              {/* Warning Banner */}
              {selectedCourtIds.length === 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-amber-700">
                    ⚠️ Selecciona manualmente la(s) cancha(s) para evitar conflictos de horario
                  </p>
                </div>
              )}

              {/* Light Switch */}
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2">
                  <Lightbulb className={withLight ? "text-amber-500" : "text-gray-400"} size={20} />
                  <div>
                    <p className="font-medium">Con Luz</p>
                    <p className="text-sm text-gray-600">
                      {withLight
                        ? `+$${(selectedPackage.lightPrice - selectedPackage.basePrice).toLocaleString()}`
                        : "Agregar iluminación"}
                    </p>
                  </div>
                </div>
                <Switch checked={withLight} onCheckedChange={setWithLight} />
              </div>

              {/* Court Selection */}
              <div className="space-y-3">
                <Label>
                  Seleccionar Cancha(s) *
                  <span className="text-xs text-gray-500 ml-2">
                    ({selectedPackage.courtCount || availableCourts.length} cancha
                    {(selectedPackage.courtCount || availableCourts.length) !== 1 ? "s" : ""}{" "}
                    requerida
                    {(selectedPackage.courtCount || availableCourts.length) !== 1 ? "s" : ""})
                  </span>
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {availableCourts.map((court) => {
                    const isSelected = selectedCourtIds.includes(court.id);
                    const requiredCount = selectedPackage.courtCount || availableCourts.length;
                    const canSelect = isSelected || selectedCourtIds.length < requiredCount;

                    return (
                      <button
                        key={court.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedCourtIds(selectedCourtIds.filter((id) => id !== court.id));
                          } else if (canSelect) {
                            setSelectedCourtIds([...selectedCourtIds, court.id]);
                          }
                        }}
                        disabled={!canSelect}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          isSelected
                            ? "border-purple-500 bg-purple-50"
                            : canSelect
                              ? "border-gray-200 hover:border-purple-300 bg-white"
                              : "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sm">
                              Cancha {court.courtNumber || court.name}
                            </p>
                            {court.sportType && (
                              <p className="text-xs text-gray-600">{court.sportType.name}</p>
                            )}
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {availableCourts.length === 0 && (
                  <p className="text-sm text-red-500">
                    ⚠️ No hay canchas disponibles para este paquete
                  </p>
                )}
              </div>

              {/* Price Display */}
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-gray-600">Precio Total</p>
                <p className="text-3xl font-bold text-purple-600">${finalPrice.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {courtsToReserve.length} cancha(s) • {selectedPackage.durationHours} horas
                </p>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar size={16} />
                    Fecha del Evento
                  </Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={format(new Date(), "yyyy-MM-dd")}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock size={16} />
                    Hora de Inicio
                  </Label>
                  <Select value={startTime} onValueChange={setStartTime}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 16 }, (_, i) => i + 8).map((hour) => {
                        const timeStr = `${String(hour).padStart(2, "0")}:00`;
                        return (
                          <SelectItem key={timeStr} value={timeStr}>
                            {timeStr}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {endTime && (
                    <p className="text-xs text-gray-500">
                      Termina a las {endTime}
                      {crossesMidnight && (
                        <span className="text-amber-600 font-medium ml-1">(día siguiente)</span>
                      )}
                    </p>
                  )}
                </div>
              </div>

              {/* Client Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User size={16} />
                    Nombre del Cliente *
                  </Label>
                  <Input
                    placeholder="Nombre completo"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone size={16} />
                    Teléfono *
                  </Label>
                  <PhoneInput
                    international
                    defaultCountry="AR"
                    value={clientPhone}
                    onChange={(val) => setClientPhone(val || "")}
                    placeholder="Ingrese el teléfono"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                  />
                  {clientPhone && clientPhone.length < 10 && (
                    <p className="text-xs text-amber-500">El teléfono debe ser válido</p>
                  )}
                </div>
              </div>

              {/* Extras (for packages that allow it) */}
              {selectedPackage.allowExtras && (
                <div className="space-y-2">
                  <Label>Extras / Observaciones</Label>
                  <Input
                    placeholder="Ej: 2 castillitos, trampolín..."
                    value={extras}
                    onChange={(e) => setExtras(e.target.value)}
                  />
                </div>
              )}

              {/* Payment */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold">Información de Pago</h3>
                <div className="space-y-2">
                  <Label>Método de Pago</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          <span className="mr-2">{method.icon}</span>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Monto de Seña / Anticipo</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <Input
                      type="number"
                      className="pl-8"
                      value={reservationAmount}
                      onChange={(e) => setReservationAmount(Number(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Restante: ${(finalPrice - reservationAmount).toLocaleString()}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !isFormValid} className="relative">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              "Confirmar Evento"
            )}
          </Button>
          {!isFormValid && selectedPackage && (
            <p className="text-xs text-red-500 w-full text-center">
              {!selectedDate && "Seleccioná una fecha"}
              {selectedDate && !clientName.trim() && "Ingresá el nombre del cliente"}
              {selectedDate && clientName.trim() && !clientPhone && "Ingresá el teléfono"}
              {selectedDate &&
                clientName.trim() &&
                clientPhone &&
                courtsToReserve.length === 0 &&
                "No hay canchas disponibles"}
            </p>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
