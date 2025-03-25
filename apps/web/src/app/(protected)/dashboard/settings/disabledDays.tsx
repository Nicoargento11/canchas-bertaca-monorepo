"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

import { useToast } from "@/hooks/use-toast";

import {
  createUnavailableDay,
  UnavailableDay,
} from "@/services/unavailableDay/unavailableDay";

type Value = Date[] | undefined;

interface DisabledDaysProps {
  initialData: UnavailableDay[];
}

const DisabledDays = ({ initialData }: DisabledDaysProps) => {
  const { toast } = useToast();
  const [disabledDays, setDisabledDays] = useState<Date[]>([]); // Estado para fechas deshabilitadas
  const [selectedDates, setSelectedDates] = useState<Value>(undefined); // Fechas seleccionadas en el calendario

  // Obtener días deshabilitados al cargar el componente
  useEffect(() => {
    setDisabledDays(initialData.map((date) => new Date(date.date))); // Convertir strings a Date
  }, [initialData]);

  const handleDisableDays = async () => {
    if (!selectedDates || selectedDates.length === 0) return;

    try {
      // Filtrar fechas que ya están deshabilitadas
      const newDisabledDays = selectedDates.filter(
        (date) =>
          !disabledDays.some(
            (disabledDate) => disabledDate.toISOString() === date.toISOString()
          )
      );

      if (newDisabledDays.length === 0) {
        toast({
          title: "Error",
          description: "Las fechas seleccionadas ya están deshabilitadas.",
          variant: "destructive",
        });
        return;
      }
      // Enviar las fechas seleccionadas a la API
      const requests = newDisabledDays.map((day) =>
        createUnavailableDay({ date: day })
      );
      await Promise.all(requests);

      //   if (!response.ok) throw new Error("Error al deshabilitar fechas");

      // Actualizar el estado local con las nuevas fechas deshabilitadas
      setDisabledDays((prev) => [...prev, ...newDisabledDays]);
      toast({
        title: "Fechas deshabilitadas",
        description:
          "Las fechas seleccionadas se han deshabilitado correctamente.",
      });
      setSelectedDates(undefined); // Resetear el calendario
    } catch {
      toast({
        title: "Error",
        description: "No se pudieron deshabilitar las fechas.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Sección: Deshabilitar días */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl text-center font-bold text-Primary-dark mb-4">
          Deshabilitar Días
        </h2>
        <div className="flex flex-col items-center space-y-4">
          <Calendar
            mode="multiple" // Permitir selección de múltiples fechas
            selected={selectedDates}
            onSelect={setSelectedDates}
            className="border border-blue-200 rounded-lg"
          />
          <Button
            onClick={handleDisableDays}
            disabled={!selectedDates || selectedDates.length === 0}
            className="bg-Complementary hover:bg-Accent-1 text-white"
          >
            Deshabilitar Fechas Seleccionadas
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DisabledDays;
