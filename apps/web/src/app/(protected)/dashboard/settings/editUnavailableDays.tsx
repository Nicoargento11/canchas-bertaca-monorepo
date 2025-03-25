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
import {
  deleteUnavailableDay,
  UnavailableDay,
} from "@/services/unavailableDay/unavailableDay";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface DisabledDaysProps {
  initialData: UnavailableDay[];
}

const EditUnavailableDays = ({ initialData }: DisabledDaysProps) => {
  const { toast } = useToast();

  const [deleteDate, setDeleteDate] = useState<Date | null>(null); // Estado para controlar la fecha a reactivar
  const [disabledDays, setDisabledDays] = useState<Date[]>([]); // Estado para fechas deshabilitadas

  useEffect(() => {
    setDisabledDays(initialData.map((date) => new Date(date.date))); // Convertir strings a Date
  }, [initialData]);

  const handleEnableDay = async () => {
    if (!deleteDate) return;

    try {
      deleteUnavailableDay(deleteDate.toISOString());
      // Enviar la fecha a reactivar a la API

      // Actualizar el estado local eliminando la fecha reactivada
      setDisabledDays((prev) =>
        prev.filter((date) => date.toISOString() !== deleteDate.toISOString())
      );
      toast({
        title: "Fecha reactivada",
        description: `La fecha ${deleteDate.toLocaleDateString()} se ha reactivado correctamente.`,
      });
      setDeleteDate(null); // Cerrar el diálogo
    } catch {
      toast({
        title: "Error",
        description: "No se pudo reactivar la fecha.",
        variant: "destructive",
      });
    }
  };
  return (
    <div>
      {/* Sección: Ver días deshabilitados */}
      <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl ">
        {disabledDays.length === 0 ? (
          <p className="text-Primary-dark">No hay días deshabilitados.</p>
        ) : (
          <div className="space-y-4">
            {disabledDays.map((date) => (
              <div
                key={date.toISOString()}
                className="flex justify-between items-center p-4 border border-Primary-extraLight rounded-lg"
              >
                <p className="text-Primary-dark font-medium">
                  {date.toLocaleDateString()}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-500 border-red-300 hover:bg-red-50"
                  onClick={() => setDeleteDate(date)} // Abrir el diálogo de confirmación
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Diálogo de confirmación para reactivar días */}
      <AlertDialog
        open={!!deleteDate}
        onOpenChange={(open) => !open && setDeleteDate(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción reactivará la fecha seleccionada. ¿Deseas continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-500 hover:bg-green-600"
              onClick={handleEnableDay}
            >
              Reactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditUnavailableDays;
