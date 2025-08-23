"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OpenCashRegister } from "./OpenCashRegister";
import { CloseCashRegister } from "./CloseCashRegister";
import { CreateCashRegister } from "./CreateCashRegister";
import { useCashRegisterStore } from "@/store/cash-register";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  exportDailySummaryPDF,
  exportDailySummaryExcel,
  downloadFile,
  formatReportDate,
} from "@/services/reports/reports";
import { toast } from "sonner";
import { FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { CashSession } from "@/services/cash-session/cash-session";
import { CashRegister } from "@/services/cash-register/cash-register";

interface CashRegisterStatusProps {
  complexId: string;
  userId: string;
}

export function CashRegisterStatus({ complexId, userId }: CashRegisterStatusProps) {
  const { registers, activeRegister, activeSession, setActiveRegister } = useCashRegisterStore();
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  const handleRegisterChange = (value: string) => {
    const register = registers.find((r) => r.id === value);
    setActiveRegister(register || null);
  };

  const handleExportPDF = async () => {
    if (!activeRegister) {
      toast.error("Selecciona una caja para exportar reportes");
      return;
    }

    setExportingPDF(true);
    try {
      const today = formatReportDate(new Date());
      const blob = await exportDailySummaryPDF(today, complexId);
      const filename = `resumen-diario-${today}-${activeRegister.name.replace(/\s+/g, "-")}.pdf`;
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

  const handleExportExcel = async () => {
    if (!activeRegister) {
      toast.error("Selecciona una caja para exportar reportes");
      return;
    }

    setExportingExcel(true);
    try {
      const today = formatReportDate(new Date());
      const blob = await exportDailySummaryExcel(today, complexId);
      const filename = `resumen-diario-${today}-${activeRegister.name.replace(/\s+/g, "-")}.xlsx`;
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

  return (
    <Card className="w-full">
      <CardHeader className="w-full flex justify-between">
        <CardTitle>Gestión de Caja</CardTitle>
        <CreateCashRegister complexId={complexId} />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Caja Física</Label>
            {registers.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {registers.length} caja(s) disponible(s)
              </span>
            )}
          </div>
          {registers.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              <Select
                value={activeRegister?.id || ""}
                onValueChange={handleRegisterChange}
                disabled={!!activeSession}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione una caja" />
                </SelectTrigger>
                <SelectContent>
                  {registers.map((register) => (
                    <SelectItem key={register.id} value={register.id}>
                      {register.name} ({register.location || "Sin ubicación"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {activeSession && (
                <p className="text-xs text-amber-600 mt-1">
                  Debes cerrar la caja antes de cambiar de caja.
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No hay cajas registradas disponibles, crea una para comenzar.
            </p>
          )}
        </div>

        {activeRegister ? (
          activeSession ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Inicio</p>
                  <p className="font-medium">{new Date(activeSession.startAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monto inicial</p>
                  <p className="font-medium">${activeSession.initialAmount.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <CloseCashRegister session={activeSession} complexId={complexId} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-4">
              <p className="text-sm text-muted-foreground">{activeRegister.name} no está abierta</p>
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <OpenCashRegister
                  complexId={complexId}
                  // userId={userId}
                  cashRegisterId={activeRegister.id}
                />
                {/* Botones de exportación cuando no hay sesión activa */}
                {/* <div className="flex gap-2 flex-1">
                  <Button
                    onClick={handleExportPDF}
                    disabled={exportingPDF}
                    variant="outline"
                    className="flex-1 flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {exportingPDF ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    {exportingPDF ? "Generando..." : "Reporte PDF"}
                  </Button>
                  <Button
                    onClick={handleExportExcel}
                    disabled={exportingExcel}
                    variant="outline"
                    className="flex-1 flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    {exportingExcel ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="h-4 w-4" />
                    )}
                    {exportingExcel ? "Generando..." : "Reporte Excel"}
                  </Button>
                </div> */}
              </div>
            </div>
          )
        ) : (
          <div className="text-center py-4 text-sm text-muted-foreground">
            {registers.length === 0
              ? "No hay cajas registradas. Crea una para comenzar."
              : "Selecciona una caja para gestionar"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
