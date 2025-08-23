"use client";

import { Trash } from "lucide-react";
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
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUnavailableDayStore } from "@/store/settings/UnavailableDay";
import {
  deleteUnavailableDayFetch,
  UnavailableDay,
} from "@/services/unavailable-day/unavailable-day";
import { Loader2 } from "lucide-react";

interface EditUnavailableDaysProps {
  initialData: UnavailableDay[];
}

const EditUnavailableDays = ({ initialData }: EditUnavailableDaysProps) => {
  const [dateToEnable, setDateToEnable] = useState<UnavailableDay | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { unavailableDays, initializeUnavailableDays, deleteUnavailableDay } =
    useUnavailableDayStore();

  useEffect(() => {
    initializeUnavailableDays(initialData);
  }, [initialData, initializeUnavailableDays]);

  const handleEnableDay = async () => {
    if (!dateToEnable) return;

    setIsProcessing(true);
    try {
      const response = await deleteUnavailableDayFetch(dateToEnable.id);

      if (!response.success) {
        throw new Error(response.error || "Error al reactivar la fecha");
      }

      deleteUnavailableDay(dateToEnable.id);

      toast.success(
        `La fecha ${new Date(dateToEnable.date).toLocaleDateString()} se ha reactivado correctamente.`
      );
    } catch (error) {
      console.error("Error al reactivar fecha:", error);
      toast.error(error instanceof Error ? error.message : "No se pudo reactivar la fecha");
    } finally {
      setIsProcessing(false);
      setDateToEnable(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Días deshabilitados</h3>
          <p className="text-sm text-gray-500">Lista de fechas no disponibles para reservas</p>
        </div>

        {unavailableDays.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-gray-500">No hay días deshabilitados actualmente</p>
          </div>
        ) : (
          <div className="space-y-2">
            {unavailableDays.map((day) => (
              <div
                key={day.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-md border border-gray-200"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {new Date(day.date).toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  {day.reason && (
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">Motivo:</span> {day.reason}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                  onClick={() => setDateToEnable(day)}
                  aria-label="Reactivar fecha"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!dateToEnable} onOpenChange={(open) => !open && setDateToEnable(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-800">Confirmar reactivación</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              {dateToEnable && (
                <div className="space-y-2">
                  <div>
                    ¿Estás seguro de reactivar el día
                    <span className="font-semibold text-gray-800">
                      {" "}
                      {new Date(dateToEnable.date).toLocaleDateString()}{" "}
                    </span>
                    ?
                  </div>
                  <div>Esta acción permitirá que esta fecha esté disponible para reservas.</div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-gray-800 hover:bg-gray-700"
              onClick={handleEnableDay}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Confirmar Reactivación"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditUnavailableDays;
