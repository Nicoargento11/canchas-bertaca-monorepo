"use client";

import { useState } from "react";
import { Schedule } from "@/services/schedule/schedule";
import { Rate } from "@/services/rate/rate";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteSchedule, updateSchedule } from "@/services/schedule/schedule";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { generateTimeOptions } from "@/utils/generateTimeOptions";

const daysOfWeek = [
  { id: 0, name: "Domingo" },
  { id: 1, name: "Lunes" },
  { id: 2, name: "Martes" },
  { id: 3, name: "Miércoles" },
  { id: 4, name: "Jueves" },
  { id: 5, name: "Viernes" },
  { id: 6, name: "Sábado" },
];

interface EditSchedulesProps {
  schedules: Schedule[];
  rates: Rate[];
}

const EditSchedules = ({ schedules, rates }: EditSchedulesProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<{
    startTime: string;
    endTime: string;
    scheduleDay: number;
    rates?: string;
    benefits?: string;
  }>({
    startTime: "",
    endTime: "",
    scheduleDay: 0,
  });
  const [deleteId, setDeleteId] = useState<string | null>(null); // Estado para controlar el ID a eliminar

  const handleEdit = (schedule: Schedule) => {
    setEditingId(schedule.id);
    setEditedData({
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      scheduleDay: schedule.scheduleDay.dayOfWeek,
      rates: schedule.rates[0]?.id, // Tomar la primera tarifa (opcional)
      // agregar benefits si es necesario
    });
  };

  const handleSave = async (id: string) => {
    try {
      await updateSchedule(id, editedData);
      toast({
        title: "Horario actualizado",
        description: "El horario se ha actualizado correctamente.",
      });
      setEditingId(null);
      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: "No se pudo actualizar el horario.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedData({
      startTime: "",
      endTime: "",
      scheduleDay: 0,
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return; // Si no hay ID, no hacer nada

    try {
      await deleteSchedule(deleteId);
      toast({
        title: "Horario eliminado",
        description: "El horario se ha eliminado correctamente.",
      });
      setDeleteId(null); // Cerrar el diálogo
      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: "No se pudo eliminar el horario.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {schedules.length > 0 ? (
        schedules.map((schedule) => (
          <div
            key={schedule.id}
            className="flex justify-between items-center p-4 border border-blue-200 rounded-lg"
          >
            {editingId === schedule.id ? (
              // Modo edición
              <div className="space-y-4 w-full">
                {/* Selector de hora de inicio */}
                <Select
                  value={editedData.startTime}
                  onValueChange={(value) =>
                    setEditedData({ ...editedData, startTime: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Hora de inicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateTimeOptions().map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Selector de hora de fin */}
                <Select
                  value={editedData.endTime}
                  onValueChange={(value) =>
                    setEditedData({ ...editedData, endTime: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Hora de fin" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateTimeOptions().map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Selector de días */}
                <Select
                  value={editedData.scheduleDay.toString()}
                  onValueChange={(value) =>
                    setEditedData({ ...editedData, scheduleDay: Number(value) })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un día" />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map((day) => (
                      <SelectItem key={day.id} value={day.id.toString()}>
                        {day.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Selector de tarifas (opcional) */}
                <Select
                  value={editedData.rates || ""}
                  onValueChange={(value) =>
                    setEditedData({ ...editedData, rates: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona una tarifa" />
                  </SelectTrigger>
                  <SelectContent>
                    {rates.map((rate) => (
                      <SelectItem key={rate.id} value={rate.id}>
                        {rate.name} - ${rate.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Botones de guardar y cancelar */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-green-500 hover:bg-green-600"
                    onClick={() => handleSave(schedule.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-500 border-red-300 hover:bg-red-50"
                    onClick={handleCancel}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              // Modo visualización
              <div>
                <p className="text-Primary-dark font-medium">
                  {schedule.startTime} - {schedule.endTime}
                </p>
                <p className="text-sm text-Primary">
                  Día:{" "}
                  {
                    daysOfWeek.find(
                      (day) => day.id === schedule.scheduleDay.dayOfWeek
                    )?.name
                  }
                </p>
                <p className="text-sm text-Primary">
                  Tarifa:{" "}
                  {schedule.rates.map(
                    (rate) =>
                      `${rate.name} - $${rate.price} - ${rate.reservationAmount}`
                  )}
                </p>
              </div>
            )}

            {/* Botones de editar y eliminar */}
            {editingId !== schedule.id && (
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-Primary-light border-Primary-extraLight hover:bg-blue-50"
                  onClick={() => handleEdit(schedule)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-500 border-red-300 hover:bg-red-50"
                  onClick={() => setDeleteId(schedule.id)} // Abrir el diálogo de confirmación
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))
      ) : (
        <p>No hay horarios disponibles</p>
      )}

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El horario se eliminará
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDelete}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditSchedules;
