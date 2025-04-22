"use client";

import { useState } from "react";
import { Rate } from "@/services/rate/rate";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  deleteFixedSchedule,
  updateFixedSchedule,
  toggleFixedSchedule,
  FixedSchedule,
} from "@/services/fixed-schedules/fixedSchedules";
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
import { Switch } from "@/components/ui/switch";
import { generateTimeOptions } from "@/utils/generateTimeOptions";
import { Label } from "@/components/ui/label";
import { daysOfWeek } from "@/constants";

interface EditFixedSchedulesProps {
  fixedSchedules: FixedSchedule[];
  rates: Rate[];
}

const EditFixedSchedules = ({
  fixedSchedules,
  rates,
}: EditFixedSchedulesProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<{
    id: string;
    startTime: string;
    endTime: string;
    scheduleDay: number;
    rate: string;
    user: string;
    court: number;
  }>({
    id: "",
    startTime: "",
    endTime: "",
    scheduleDay: 0,
    rate: "",
    user: "",
    court: 0,
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Función para manejar el toggle de activo/inactivo
  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await toggleFixedSchedule(id, isActive);
      toast({
        title: "Estado actualizado",
        description: `El turno fijo ha sido ${isActive ? "activado" : "desactivado"}.`,
      });
      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del turno fijo.",
        variant: "destructive",
      });
    }
  };

  // Función para manejar la edición de un turno fijo
  const handleEdit = (schedule: FixedSchedule) => {
    setEditingId(schedule.id);
    setEditedData({
      id: schedule.id,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      scheduleDay: schedule.scheduleDay.dayOfWeek,
      rate: schedule.rate.id,
      user: schedule.user.id,
      court: schedule.court,
    });
  };

  // Función para guardar los cambios de un turno fijo
  const handleSave = async (id: string) => {
    try {
      await updateFixedSchedule(id, editedData);
      toast({
        title: "Turno fijo actualizado",
        description: "El turno fijo se ha actualizado correctamente.",
      });
      setEditingId(null);
      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: "No se pudo actualizar el turno fijo.",
        variant: "destructive",
      });
    }
  };

  // Función para cancelar la edición
  const handleCancel = () => {
    setEditingId(null);
    setEditedData({
      id: "",
      startTime: "",
      endTime: "",
      scheduleDay: 0,
      rate: "",
      user: "",
      court: 0,
    });
  };

  // Función para eliminar un turno fijo
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteFixedSchedule(deleteId);
      toast({
        title: "Turno fijo eliminado",
        description: "El turno fijo se ha eliminado correctamente.",
      });
      setDeleteId(null);
      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: "No se pudo eliminar el turno fijo.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {fixedSchedules.length > 0 ? (
        fixedSchedules.map((schedule) => (
          <div
            key={schedule.id}
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            {editingId === schedule.id ? (
              // Modo edición
              <div className="space-y-4">
                {/* Selector de hora de inicio */}
                <div className="space-y-2">
                  <Label className="text-Primary font-semibold">
                    Hora de inicio
                  </Label>
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
                </div>

                {/* Selector de hora de fin */}
                <div className="space-y-2">
                  <Label className="text-Primary font-semibold">
                    Hora de fin
                  </Label>
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
                </div>

                {/* Selector de días */}
                <div className="space-y-2">
                  <Label className="text-Primary font-semibold">Día</Label>
                  <Select
                    value={editedData.scheduleDay.toString()}
                    onValueChange={(value) =>
                      setEditedData({
                        ...editedData,
                        scheduleDay: Number(value),
                      })
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
                </div>

                {/* Selector de tarifas */}
                <div className="space-y-2">
                  <Label className="text-Primary font-semibold">Tarifa</Label>
                  <Select
                    value={editedData.rate}
                    onValueChange={(value) =>
                      setEditedData({ ...editedData, rate: value })
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
                </div>

                {/* Botones de guardar y cancelar */}
                <div className="flex gap-2 mt-4">
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
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-lg font-semibold text-Primary-dark">
                      {schedule.startTime} - {schedule.endTime}
                    </p>
                    <p className="text-sm text-gray-600">
                      Día:{" "}
                      {
                        daysOfWeek.find(
                          (day) => day.id === schedule.scheduleDay.dayOfWeek
                        )?.name
                      }
                    </p>
                    <p className="text-sm text-gray-600">
                      Tarifa: {schedule.rate.name} - ${schedule.rate.price}
                    </p>
                    <p className="text-sm text-gray-600">
                      Cancha: {schedule.court}
                    </p>
                    <p className="text-sm text-gray-600">
                      Usuario: {schedule.user.name} ({schedule.user.email})
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={schedule.isActive}
                      onCheckedChange={(checked) =>
                        handleToggle(schedule.id, checked)
                      }
                      className="data-[state=checked]:bg-green-500"
                    />
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
                      onClick={() => setDeleteId(schedule.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p
                  className={`text-sm ${
                    schedule.isActive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  Estado: {schedule.isActive ? "Activo" : "Inactivo"}
                </p>
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-600">No hay turnos fijos disponibles</p>
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
              Esta acción no se puede deshacer. El turno fijo se eliminará
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

export default EditFixedSchedules;
