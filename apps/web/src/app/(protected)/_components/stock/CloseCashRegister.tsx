"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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

  // Cierre de caja
  const handleCloseSession = async () => {
    if (!amount || isNaN(Number(amount))) {
      toast.error("Debes ingresar un monto final válido para cerrar la caja.");
      return;
    }
    setIsLoading(true);
    try {
      const result = await closeCashSession(session.id, {
        finalAmount: Number(amount),
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
      console.error("Error exporting PDF:", error);
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
      console.error("Error exporting Excel:", error);
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
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="destructive" onClick={() => setIsOpen(true)}>
          Cerrar Caja
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{sessionClosed ? "Exportar Reportes" : "Cierre de Caja"}</DialogTitle>
        </DialogHeader>

        {/* Selector de sesión y fecha de reporte */}
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
                  {`${s.cashRegister?.name || "Caja"} | ${new Date(s.startAt).toLocaleString()}${s.endAt ? " - " + new Date(s.endAt).toLocaleString() : ""} | ${s.status === "ACTIVE" ? "Abierta" : "Cerrada"}`}
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

        {/* Detalles de la sesión seleccionada */}
        {selectedSession && (
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

        {/* Acciones según estado de cierre */}
        {!sessionClosed ? (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Monto Final
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="col-span-3"
                  placeholder="Ingrese el monto final en efectivo"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="observations" className="text-right">
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
                  if (!amount || isNaN(Number(amount))) {
                    toast.error("Debes ingresar un monto final válido para cerrar la caja.");
                    return;
                  }
                  setShowConfirm(true);
                }}
                disabled={isLoading}
                variant="destructive"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isLoading ? "Cerrando..." : "Confirmar Cierre"}
              </Button>
            </div>
          </>
        ) : (
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
      {/* Diálogo de confirmación importante */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro que quieres cerrar la caja?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es importante. Antes de cerrar la caja, puedes exportar el reporte del
              día. Una vez cerrada, no podrás registrar más ventas ni movimientos en esta sesión.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowConfirm(false);
                handleCloseSession();
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Continuar con el cierre
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
