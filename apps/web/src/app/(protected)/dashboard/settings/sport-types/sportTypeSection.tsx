"use client";
import React, { useEffect, useState } from "react";
import { CreateSportType, SportTypeFormValues } from "./createSportType";
import { SportTypesList } from "./sportTypesTable";
import { Complex } from "@/services/complex/complex";
import {
  createSportType,
  deleteSportTypeFetch,
  SportType,
  SportTypeKey,
  toggleSportTypeStatusFetch,
  updateSportTypeFetch,
} from "@/services/sport-types/sport-types";
import { toast } from "sonner";
import { useSportTypeStore } from "@/store/settings/sportTypeStore";

interface SportTypeSectionProps {
  complex: Complex;
}
export const SportTypeSection = ({ complex }: SportTypeSectionProps) => {
  const {
    sportTypes,
    updateSportType,
    addSportType,
    deleteSportType,
    toggleSportTypeStatus,
    initializeSportTypes,
  } = useSportTypeStore();
  const [editingSportType, setEditingSportType] = useState<SportType | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);

  useEffect(() => {
    initializeSportTypes(complex.sportTypes);
  }, [complex.id, initializeSportTypes]);

  const handleSubmitSportType = async (formValues: SportTypeFormValues) => {
    setIsFormLoading(true);
    try {
      if (editingSportType) {
        // Actualizar tipo de deporte existente
        const updateResponse = await updateSportTypeFetch(editingSportType.id, formValues);

        if (updateResponse.success && updateResponse.data) {
          const updatedSportType = {
            ...editingSportType,
            ...updateResponse.data,
            name: formValues.name as SportTypeKey,
            isActive: formValues.isActive,
          };
          updateSportType(updatedSportType.id, updatedSportType);
          // setSportTypes(
          //   sportTypes.map((st) => (st.id === updatedSportType.id ? updatedSportType : st))
          // );
          toast.success(`Tipo de deporte "${formValues.name}" actualizado correctamente`);
        } else {
          throw new Error(updateResponse.error || "Error al actualizar el tipo de deporte");
        }
      } else {
        // Crear nuevo tipo de deporte
        const createResponse = await createSportType({
          ...formValues,
          complexId: complex.id,
          name: formValues.name as SportTypeKey,
        });

        if (createResponse.success && createResponse.data) {
          addSportType(createResponse.data);
          // setSportTypes([...sportTypes, createResponse.data]);
          toast.success(`Tipo de deporte "${formValues.name}" creado correctamente`);
        } else {
          throw new Error(createResponse.error || "Error al crear el tipo de deporte");
        }
      }
      setEditingSportType(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar el tipo de deporte");
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleEditSportType = (id: string) => {
    const sportTypeToEdit = sportTypes.find((st) => st.id === id);
    if (sportTypeToEdit) {
      setEditingSportType(sportTypeToEdit);
    }
  };

  const handleDeleteSportType = async (id: string) => {
    try {
      const deleteResponse = await deleteSportTypeFetch(id);

      if (deleteResponse.success) {
        deleteSportType(id);
        // setSportTypes(sportTypes.filter((st) => st.id !== id));
        toast.success("Tipo de deporte eliminado correctamente");
      } else {
        throw new Error(deleteResponse.error || "Error al eliminar el tipo de deporte");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al eliminar el tipo de deporte");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const response = await toggleSportTypeStatusFetch(id);
      if (response.success && response.data) {
        toggleSportTypeStatus(id);
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
        <CreateSportType
          sportType={editingSportType}
          onSubmit={handleSubmitSportType}
          onCancel={() => setEditingSportType(null)}
          isLoading={isFormLoading}
        />
      </div>

      {/* Sección: Listado de Tipos de Deporte (opcional) */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold text-Primary-dark mb-3 md:mb-4">
          Tipos de Deporte Disponibles
        </h2>
        <SportTypesList
          initialData={sportTypes}
          onEdit={handleEditSportType}
          onDelete={handleDeleteSportType}
          onStatusChange={handleToggleStatus}
        />
        {/* Aquí podrías agregar un componente para listar/editarlos */}
      </div>
    </>
  );
};
