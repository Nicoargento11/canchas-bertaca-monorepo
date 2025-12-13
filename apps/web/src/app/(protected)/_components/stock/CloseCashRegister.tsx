"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { closeCashSession } from "@/services/cash-session/cash-session";
import { useCashRegisterStore } from "@/store/cash-register";
import {
  exportDailySummaryPDF,
  exportDailySummaryExcel,
  downloadFile,
  formatReportDate,
} from "@/services/reports/reports";
import { toast } from "sonner";
import { FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { getCashSessionHistory, CashSession } from "@/services/cash-session/cash-session";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CloseCashRegister({ session, complexId }: { session: any; complexId: string }) {
  // Estados principales
  const [amount, setAmount] = useState("");
  const [observations, setObservations] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [sessionClosed, setSessionClosed] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [reportDate, setReportDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [cashSessions, setCashSessions] = useState<CashSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(session?.id || "");
  const [loadingSessions, setLoadingSessions] = useState(false);
  const { setActiveSession, clearCashRegister } = useCashRegisterStore();

  // Cargar historial de sesiones de caja
  useEffect(() => {
    const fetchSessions = async () => {
      if (!session?.cashRegisterId) return;
      setLoadingSessions(true);
      const res = await getCashSessionHistory(session.cashRegisterId, 30);
      if (res.success && Array.isArray(res.data)) {
        setCashSessions(res.data);
        // Selecciona la sesión actual si está abierta, si no la última cerrada
        if (session?.id) {
          setSelectedSessionId(session.id);
        } else if (res.data.length > 0) {
          setSelectedSessionId(res.data[0].id);
        }
      }
      setLoadingSessions(false);
    };
    fetchSessions();
  }, [session?.cashRegisterId, session?.id]);

  // Obtener la sesión seleccionada para mostrar detalles
  const selectedSession = cashSessions.find((s) => s.id === selectedSessionId);

  // Helper para limpiar el monto
  const parseAmount = (value: string) => {
    if (!value) return 0;
    // Permitimos cualquier caracter, pero limpiamos para el parseo
    let clean = value.replace(/[^\d.,]/g, "");

    // Estrategia simplificada:
    // 1. Si tiene coma, reemplazamos por punto (asumimos decimal o separador universal)
    // 2. Si tiene puntos y comas, intentamos deducir.

    if (clean.indexOf(",") !== -1 && clean.indexOf(".") !== -1) {
      if (clean.lastIndexOf(",") > clean.lastIndexOf(".")) {
        // 1.000,50 -> 1000.50
        clean = clean.replace(/\./g, "").replace(",", ".");
      } else {
        // 1,000.50 -> 1000.50
        clean = clean.replace(/,/g, "");
      }
    } else if (clean.indexOf(",") !== -1) {
      // Solo comas
      if ((clean.match(/,/g) || []).length > 1) {
        // 1,000,000 -> 1000000
        clean = clean.replace(/,/g, "");
      } else {
        // 10,50 -> 10.50
        clean = clean.replace(",", ".");
      }
    } else if (clean.indexOf(".") !== -1) {
      // Solo puntos
      if ((clean.match(/\./g) || []).length > 1) {
        // 1.000.000 -> 1000000
        clean = clean.replace(/\./g, "");
      } else {
        // Un solo punto. Aquí está la ambigüedad.
        // Si el usuario escribe 1000.00, es 1000.
        // Si escribe 1.000, puede ser 1000.
        // Asumiremos que si es un solo punto, es decimal (estándar JS),
        // A MENOS que tenga exactamente 3 decimales, que suele ser miles en ES.
        // Pero para evitar errores con "1.000" (mil), vamos a ser permisivos.
        // Si el usuario pone "100", funciona.
        // Si pone "100.50", funciona.
        // Si pone "1.000", será 1.
        // Vamos a asumir comportamiento estándar de JS para un solo punto: es decimal.
      }
    }

    const result = parseFloat(clean);
    return isNaN(result) ? 0 : result;
  };

  // Cierre de caja
  const handleCloseSession = async () => {
    const finalAmount = parseAmount(amount);

    if (!amount || isNaN(finalAmount)) {
      toast.error("Debes ingresar un monto final válido para cerrar la caja.");
      return;
    }
    setIsLoading(true);
    try {
      const result = await closeCashSession(session.id, {
        finalAmount,
        observations,
      });
      if (result.success) {
        setSessionClosed(true);
        clearCashRegister();
        toast.success("Caja cerrada exitosamente");
      } else {
        toast.error(result.error || "Error al cerrar la caja");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Finalizar y limpiar
  const handleFinalClose = () => {
    setActiveSession(null);
    setIsOpen(false);
    setSessionClosed(false);
    setAmount("");
    setObservations("");
  };

  // Exportar PDF
  const handleExportPDF = async () => {
    if (!complexId) {
      toast.error("No se puede exportar: información de complejo no disponible");
      return;
    }
    setExportingPDF(true);
    try {
      const blob = await exportDailySummaryPDF(
        reportDate,
        complexId,
        selectedSessionId || undefined
      );
      const filename = `resumen-diario-${reportDate}.pdf`;
      downloadFile(blob, filename);
      toast.success("Reporte PDF descargado exitosamente");
    } catch (error) {
      toast.error("Error al generar el reporte PDF", {
        description: error instanceof Error ? error.message : "Error desconocido",
      });
    } finally {
      setExportingPDF(false);
    }
  };

  // Exportar Excel
  const handleExportExcel = async () => {
    if (!complexId) {
      toast.error("No se puede exportar: información de complejo no disponible");
      return;
    }
    setExportingExcel(true);
    try {
      const blob = await exportDailySummaryExcel(
        reportDate,
        complexId,
        selectedSessionId || undefined
      );
      const filename = `resumen-diario-${reportDate}.xlsx`;
      downloadFile(blob, filename);
      toast.success("Reporte Excel descargado exitosamente");
    } catch (error) {
      toast.error("Error al generar el reporte Excel", {
        description: error instanceof Error ? error.message : "Error desconocido",
      });
    } finally {
      setExportingExcel(false);
    }
  };

  // Render principal
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && sessionClosed) return;
        setIsOpen(open);
        if (!open && !sessionClosed) {
          setAmount("");
          setObservations("");
          setShowConfirm(false); // Reset confirm state on close
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="destructive" onClick={() => setIsOpen(true)}>
          Cerrar Caja
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle>
            {sessionClosed
              ? "Exportar Reportes"
              : showConfirm
                ? "Confirmar Cierre"
                : "Cierre de Caja"}
          </DialogTitle>
          <DialogDescription>
            {sessionClosed
              ? "La caja ha sido cerrada correctamente. Puedes descargar los reportes."
              : showConfirm
                ? "Verifica los datos antes de confirmar el cierre definitivo."
                : "Ingresa el monto final y observaciones para cerrar la sesión actual."}
          </DialogDescription>
        </DialogHeader>

        {/* Selector de sesión y fecha de reporte - Solo mostrar si no estamos confirmando */}
        {!showConfirm && (
          <div className="flex flex-col gap-2 mb-4">
            <Label>Sesión de caja</Label>
            <Select
              value={selectedSessionId}
              onValueChange={setSelectedSessionId}
              disabled={loadingSessions || cashSessions.length === 0}
            >
              <SelectTrigger className="max-w-full">
                <SelectValue placeholder="Selecciona una sesión" />
              </SelectTrigger>
              <SelectContent>
                {cashSessions.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    <span className="truncate block max-w-[260px] sm:max-w-full">
                      {`${s.cashRegister?.name || "Caja"} | ${new Date(s.startAt).toLocaleString()}${s.endAt ? " - " + new Date(s.endAt).toLocaleString() : ""} | ${s.status === "ACTIVE" ? "Abierta" : "Cerrada"}`}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Label>Fecha del reporte</Label>
            <Input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="max-w-xs"
            />
          </div>
        )}

        {/* Detalles de la sesión seleccionada - Solo mostrar si no estamos confirmando */}
        {!showConfirm && selectedSession && (
          <div className="mb-2 p-3 rounded bg-gray-50 border text-xs text-gray-700">
            <div>
              <b>Caja:</b> {selectedSession.cashRegister?.name || "-"}
            </div>
            <div>
              <b>Fecha de apertura:</b>{" "}
              {selectedSession.startAt ? new Date(selectedSession.startAt).toLocaleString() : "-"}
            </div>
            <div>
              <b>Fecha de cierre:</b>{" "}
              {selectedSession.endAt ? new Date(selectedSession.endAt).toLocaleString() : "-"}
            </div>
            <div>
              <b>Monto inicial:</b> ${selectedSession.initialAmount?.toFixed(2) ?? "-"}
            </div>
            <div>
              <b>Observaciones:</b> {selectedSession.observations || "Sin observaciones"}
            </div>
            <div>
              <b>Estado:</b> {selectedSession.status === "ACTIVE" ? "Abierta" : "Cerrada"}
            </div>
          </div>
        )}

        {/* Estado de Confirmación */}
        {showConfirm && !sessionClosed ? (
          <div className="space-y-4 py-4">
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800 text-sm">
              <p className="font-medium mb-1">¿Estás seguro que quieres cerrar la caja?</p>
              <p>
                Esta acción es importante. Una vez cerrada, no podrás registrar más ventas ni
                movimientos en esta sesión.
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Monto Final Declarado:</span>
                <span className="font-medium">${parseAmount(amount).toFixed(2)}</span>
              </div>
              {observations && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Observaciones:</span>
                  <span className="font-medium truncate max-w-[200px]">{observations}</span>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowConfirm(false)}>
                Volver
              </Button>
              <Button
                onClick={handleCloseSession}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isLoading ? "Cerrando..." : "Confirmar Cierre"}
              </Button>
            </div>
          </div>
        ) : !sessionClosed ? (
          /* Formulario de Cierre */
          <>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2 sm:grid sm:grid-cols-4 sm:items-center sm:gap-4">
                <Label htmlFor="amount" className="text-left sm:text-right">
                  Monto Final
                </Label>
                <Input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="col-span-1 sm:col-span-3"
                  placeholder="Ingrese el monto final en efectivo"
                />
              </div>
              <div className="flex flex-col gap-2 sm:grid sm:grid-cols-4 sm:items-center sm:gap-4">
                <Label htmlFor="observations" className="text-left sm:text-right">
                  Observaciones
                </Label>
                <Input
                  id="observations"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="col-span-3"
                  placeholder="Ingrese observaciones (opcional)"
                />
              </div>
            </div>
            {/* Botones de exportación de reporte */}
            <div className="flex gap-3 mb-4">
              <Button
                onClick={handleExportPDF}
                disabled={exportingPDF || !selectedSessionId}
                variant="outline"
                className="flex-1 flex items-center gap-2"
              >
                {exportingPDF ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                {exportingPDF ? "Generando PDF..." : "Exportar PDF"}
              </Button>
              <Button
                onClick={handleExportExcel}
                disabled={exportingExcel || !selectedSessionId}
                variant="outline"
                className="flex-1 flex items-center gap-2"
              >
                {exportingExcel ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4" />
                )}
                {exportingExcel ? "Generando Excel..." : "Exportar Excel"}
              </Button>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  const finalAmount = parseAmount(amount);

                  // Validamos que haya un monto escrito (aunque sea 0)
                  if (amount.trim() === "" || isNaN(finalAmount)) {
                    toast.error("Debes ingresar un monto final válido para cerrar la caja.");
                    return;
                  }
                  setShowConfirm(true);
                }}
                disabled={isLoading}
                variant="destructive"
              >
                Continuar
              </Button>
            </div>
          </>
        ) : (
          /* Estado de Éxito */
          <div className="space-y-6">
            <div className="text-center py-2">
              <p className="text-green-600 font-medium">¡Caja cerrada exitosamente!</p>
              <p className="text-sm text-muted-foreground mt-2">
                Exporta los reportes del día antes de continuar
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleExportPDF}
                disabled={exportingPDF || !selectedSessionId}
                variant="outline"
                className="flex-1 flex items-center gap-2"
              >
                {exportingPDF ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                {exportingPDF ? "Generando PDF..." : "Exportar PDF"}
              </Button>
              <Button
                onClick={handleExportExcel}
                disabled={exportingExcel || !selectedSessionId}
                variant="outline"
                className="flex-1 flex items-center gap-2"
              >
                {exportingExcel ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4" />
                )}
                {exportingExcel ? "Generando Excel..." : "Exportar Excel"}
              </Button>
            </div>
            <div className="flex justify-center pt-4">
              <Button onClick={handleFinalClose} variant="default" className="px-8">
                Finalizar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
