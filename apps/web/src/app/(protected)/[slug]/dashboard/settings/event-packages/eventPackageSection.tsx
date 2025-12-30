"use client";

import { Complex } from "@/services/complex/complex";
import CreateEventPackage from "./createEventPackage";
import EditEventPackages from "./editEventPackages";
import { EventPackage, getAllEventPackages } from "@/services/event-package/event-package";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EventPackageSectionProps {
  complex: Complex;
}

export const EventPackageSection = ({ complex }: EventPackageSectionProps) => {
  const [eventPackages, setEventPackages] = useState<EventPackage[]>([]);
  const [editingPackage, setEditingPackage] = useState<EventPackage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadEventPackages = async () => {
    setIsLoading(true);
    try {
      const result = await getAllEventPackages(complex.id);
      if (result.success && result.data) {
        setEventPackages(result.data);
      } else {
        toast.error(result.error || "Error al cargar paquetes de eventos");
      }
    } catch (error) {
      toast.error("Error al cargar paquetes de eventos");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEventPackages();
  }, [complex.id]);

  const handleSuccess = async () => {
    setEditingPackage(null);
    await loadEventPackages();
  };

  const handleEdit = (eventPackage: EventPackage) => {
    setEditingPackage(eventPackage);
    // Scroll to top to show the form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingPackage(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Formulario para crear/editar */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
        <CreateEventPackage
          complex={complex}
          eventPackage={editingPackage}
          onSuccess={handleSuccess}
          onCancel={editingPackage ? handleCancelEdit : undefined}
        />
      </div>

      {/* Lista de paquetes existentes */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
          Paquetes de Eventos Creados
        </h2>
        <EditEventPackages initialData={eventPackages} onEdit={handleEdit} />
      </div>
    </div>
  );
};
