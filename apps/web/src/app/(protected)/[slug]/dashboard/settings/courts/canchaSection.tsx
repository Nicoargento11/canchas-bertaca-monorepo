// components/cancha-section.tsx
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CanchasTable } from "./canchas-table";
import {
  Court,
  createCourt,
  deleteCourtFetch,
  toggleCourtStatusFetch,
  updateCourtFetch,
} from "@/services/court/court";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Schedule } from "@/services/schedule/schedule";
import { FixedReserve } from "@/services/fixed-reserve/fixed-reserve";
import { Complex } from "@/services/complex/complex";
import { CanchasForm, CourtFormValues } from "./cancha-form";
import { useCourtStore } from "@/store/settings/courtStore";
import { useSportTypeStore } from "@/store/settings/sportTypeStore";

interface CanchaSectionProps {
  schedules: Schedule[];
  fixedReserves: FixedReserve[];
  complex: Complex;
}

export const CanchaSection = ({ fixedReserves, schedules, complex }: CanchaSectionProps) => {
  const { addCourt, courts, deleteCourt, initializeCourts, updateCourt, toggleCourtStatus } =
    useCourtStore();
  const { sportTypes, initializeSportTypes } = useSportTypeStore();
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);

  useEffect(() => {
    initializeCourts(complex.courts);
    initializeSportTypes(complex.sportTypes);
  }, [complex.id, initializeCourts, initializeSportTypes]);

  const characteristicsOptions = [
    { value: "techada", label: "Techada" },
    { value: "iluminacion", label: "Con iluminación" },
    { value: "cesped_sintetico", label: "Césped sintético" },
    { value: "cesped_natural", label: "Césped natural" },
    { value: "paredes_laterales", label: "Con paredes laterales" },
    { value: "cancha_cercada", label: "Cancha cercada" },
    { value: "cancha_techada", label: "Cancha techada" },
    { value: "medidas_reglamentarias", label: "Medidas reglamentarias" },
    { value: "climatizada", label: "Climatizada" },
    { value: "pintura_demarcada", label: "Con líneas demarcadas" },
    { value: "arcos_reglamentarios", label: "Arcos reglamentarios" },
    { value: "suelo_antideslizante", label: "Piso antideslizante" },
    { value: "redes_laterales", label: "Redes laterales de contención" },
    { value: "drenaje", label: "Con sistema de drenaje" },
  ];
  const handleSubmitCourt = async (formValues: CourtFormValues) => {
    setIsFormLoading(true);
    try {
      if (editingCourt) {
        // Actualizar cancha existente
        const updateResponse = await updateCourtFetch(editingCourt.id, formValues);

        if (updateResponse.success && updateResponse.data) {
          updateCourt(editingCourt.id, formValues);
          toast.success(`Cancha ${formValues.courtNumber} actualizada correctamente`);
          // setCanchas(canchas.map((c) => (c.id === updatedCourt.id ? updatedCourt : c)));
        } else {
          throw new Error(updateResponse.error || "Error al actualizar la cancha");
        }
      } else {
        // Crear nueva cancha
        const createResponse = await createCourt({
          ...formValues,
          complexId: complex.id, // Asumiendo que tienes el complejo en el contexto
        });

        if (createResponse.success && createResponse.data) {
          addCourt(createResponse.data);
          // setCanchas([...canchas, createResponse.data]);
          toast.success(`Cancha ${formValues.courtNumber} creada correctamente`);
        } else {
          throw new Error(createResponse.error || "Error al crear la cancha");
        }
      }
      setEditingCourt(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar la cancha");
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleEditCourt = (id: string) => {
    const courtToEdit = courts.find((c) => c.id === id);
    if (courtToEdit) {
      updateCourt(id, courtToEdit);
      setEditingCourt(courtToEdit);
    }
  };

  const handleDeleteCourt = async (id: string) => {
    try {
      // Verificar si la cancha está en uso
      const courtInUse =
        schedules.some((h) => h.courtId === id) || fixedReserves.some((t) => t.courtId === id);

      if (courtInUse) {
        toast.error("No se puede eliminar: la cancha está en uso en horarios o reservas fijas");
        return;
      }

      const deleteResponse = await deleteCourtFetch(id);

      if (deleteResponse.success) {
        deleteCourt(id);

        // setCanchas(canchas.filter((c) => c.id !== id));
        toast.success("Cancha eliminada correctamente");
      } else {
        throw new Error(deleteResponse.error || "Error al eliminar la cancha");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al eliminar la cancha");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const response = await toggleCourtStatusFetch(id);
      if (response.success && response.data) {
        toggleCourtStatus(id);
        // setSportTypes(
        //   sportTypes.map((st) => (st.id === id ? { ...st, isActive: response.data!.isActive } : st))
        // );
        toast.success("Estado cambiado correctamente");
      }
    } catch (error) {
      toast.error("Error al cambiar el estado");
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
        <CanchasForm
          court={editingCourt}
          sportTypes={sportTypes}
          characteristicsOptions={characteristicsOptions}
          onSubmit={handleSubmitCourt}
          onCancel={() => setEditingCourt(null)}
          isLoading={isFormLoading}
        />
      </div>

      {/* Sección: Listado de Tipos de Deporte (opcional) */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold text-Primary-dark mb-3 md:mb-4">
          Tipos de Deporte Disponibles
        </h2>
        <CanchasTable
          onEdit={handleEditCourt}
          onDelete={handleDeleteCourt}
          onStatusChange={handleToggleStatus}
        />

        {/* Aquí podrías agregar un componente para listar/editarlos */}
      </div>
    </>
  );
};
