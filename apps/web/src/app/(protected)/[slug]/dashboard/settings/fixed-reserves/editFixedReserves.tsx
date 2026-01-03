"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X, Trash, CalendarPlus } from "lucide-react";
import {
  deleteFixedReserve,
  updateFixedReserve,
  toggleFixedReserveStatus,
  createFixedReserveInstance,
  FixedReserve,
} from "@/services/fixed-reserve/fixed-reserve";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { generateTimeOptions } from "@/utils/generateTimeOptions";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Complex } from "@/services/complex/complex";
import { Loader2 } from "lucide-react";

interface EditFixedSchedulesProps {
  complex: Complex;
}

function getDayName(dayOfWeek: number): string {
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  return days[dayOfWeek] || `Día ${dayOfWeek}`;
}

interface EditedData {
  id: string;
  startTime: string;
  endTime: string;
  scheduleDayId: string;
  rateId: string;
  userId: string;
  courtId: string;
}

const timeOptions = generateTimeOptions();
const daysOfWeek = [
  { name: "Todos", value: null },
  { name: "Domingo", value: 0 },
  { name: "Lunes", value: 1 },
  { name: "Martes", value: 2 },
  { name: "Miércoles", value: 3 },
  { name: "Jueves", value: 4 },
  { name: "Viernes", value: 5 },
  { name: "Sábado", value: 6 },
];

const EditFixedSchedules = ({ complex }: EditFixedSchedulesProps) => {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<EditedData>({
    id: "",
    startTime: "",
    endTime: "",
    scheduleDayId: "",
    rateId: "",
    userId: "",
    courtId: "",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [generateInstanceId, setGenerateInstanceId] = useState<string | null>(null);
  const [instanceDate, setInstanceDate] = useState<string>("");

  const handleToggle = async (id: string, isActive: boolean) => {
    setIsProcessing(true);
    try {
      const { success, error } = await toggleFixedReserveStatus(id, isActive);
      if (!success) {
        throw new Error(error);
      }
      toast.success(`Turno fijo ${isActive ? "activado" : "desactivado"}`);
      router.refresh();
    } catch (error) {
      toast.error("Error al cambiar estado del turno");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = (schedule: FixedReserve) => {
    setEditingId(schedule.id);
    setEditedData({
      id: schedule.id,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      scheduleDayId: schedule.scheduleDay.id,
      rateId: schedule.rate.id,
      userId: schedule.user.id,
      courtId: schedule.court.id,
    });
  };

  const handleSave = async (id: string) => {
    setIsProcessing(true);
    try {
      const { success, error } = await updateFixedReserve(id, editedData);
      if (!success) {
        throw new Error(error);
      }
      toast.success("Turno fijo actualizado");
      setEditingId(null);
      router.refresh();
    } catch (error) {
      toast.error("Error al actualizar turno");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsProcessing(true);
    try {
      const { success, error } = await deleteFixedReserve(deleteId);
      if (!success) {
        throw new Error(error);
      }
      toast.success("Turno fijo eliminado");
      setDeleteId(null);
      router.refresh();
    } catch (error) {
      toast.error("Error al eliminar turno");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateInstance = async () => {
    if (!generateInstanceId || !instanceDate) return;

    setIsProcessing(true);
    try {
      const { success, error } = await createFixedReserveInstance(generateInstanceId, instanceDate);
      if (!success) {
        throw new Error(error);
      }
      toast.success("Reserva generada correctamente");
      setGenerateInstanceId(null);
      setInstanceDate("");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al generar reserva");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredReserves = useMemo(() => {
    if (selectedDay === null) {
      return complex.fixedReserves;
    }
    return complex.fixedReserves.filter((reserve) => reserve.scheduleDay.dayOfWeek === selectedDay);
  }, [selectedDay, complex.fixedReserves]);

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white rounded-lg shadow-md">
        <Label className="mb-3 block font-semibold text-gray-700">Filtrar por día</Label>
        <div className="flex flex-wrap gap-2">
          {daysOfWeek.map((day) => (
            <Button
              key={day.name}
              variant={selectedDay === day.value ? "default" : "outline"}
              onClick={() => setSelectedDay(day.value)}
              size="sm"
              className="transition-all"
            >
              {day.name}
            </Button>
          ))}
        </div>
      </div>
      {filteredReserves.length > 0 ? (
        filteredReserves.map((schedule) => (
          <div
            key={schedule.id}
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            {editingId === schedule.id ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Hora de inicio</Label>
                    <Select
                      value={editedData.startTime}
                      onValueChange={(value) => setEditedData({ ...editedData, startTime: value })}
                      disabled={isProcessing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Hora de inicio" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Hora de fin</Label>
                    <Select
                      value={editedData.endTime}
                      onValueChange={(value) => setEditedData({ ...editedData, endTime: value })}
                      disabled={isProcessing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Hora de fin" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions
                          .filter((time) => time > editedData.startTime || !editedData.startTime)
                          .map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Día</Label>
                    <Select
                      value={editedData.scheduleDayId}
                      onValueChange={(value) =>
                        setEditedData({ ...editedData, scheduleDayId: value })
                      }
                      disabled={isProcessing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona día" />
                      </SelectTrigger>
                      <SelectContent>
                        {complex.scheduleDays.map((day) => (
                          <SelectItem key={day.id} value={day.id}>
                            {getDayName(day.dayOfWeek)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tarifa</Label>
                    <Select
                      value={editedData.rateId}
                      onValueChange={(value) => setEditedData({ ...editedData, rateId: value })}
                      disabled={isProcessing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tarifa" />
                      </SelectTrigger>
                      <SelectContent>
                        {complex.rates.map((rate) => (
                          <SelectItem key={rate.id} value={rate.id}>
                            {rate.name} (${rate.price})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end mt-4">
                  <Button size="sm" onClick={() => handleSave(schedule.id)} disabled={isProcessing}>
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isProcessing}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-lg font-semibold">
                      {schedule.startTime} - {schedule.endTime}
                    </p>
                    <div className="text-sm text-gray-600 space-y-1 mt-2">
                      <p>Día: {getDayName(schedule.scheduleDay.dayOfWeek)}</p>
                      <p>
                        Tarifa: {schedule.rate.name} (${schedule.rate.price})
                      </p>
                      <p>Cancha: {schedule.court.name}</p>
                      <p>Usuario: {schedule.user.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={schedule.isActive}
                      onCheckedChange={(checked) => handleToggle(schedule.id, checked)}
                      disabled={isProcessing}
                      className="data-[state=checked]:bg-green-500"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(schedule)}
                      disabled={isProcessing}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setGenerateInstanceId(schedule.id)}
                      disabled={isProcessing}
                      title="Generar reserva manual"
                    >
                      <CalendarPlus className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteId(schedule.id)}
                      disabled={isProcessing}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className={`text-sm ${schedule.isActive ? "text-green-600" : "text-red-600"}`}>
                  Estado: {schedule.isActive ? "Activo" : "Inactivo"}
                </p>
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-600 text-center py-8">No hay turnos fijos registrados</p>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de eliminar este turno fijo? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isProcessing}
              className="bg-red-500 hover:bg-red-600"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={!!generateInstanceId}
        onOpenChange={(open) => {
          if (!open) {
            setGenerateInstanceId(null);
            setInstanceDate("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generar Reserva Manual</DialogTitle>
            <DialogDescription>
              Selecciona la fecha para la cual deseas generar la reserva basada en este turno fijo.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="date" className="mb-2 block">
              Fecha
            </Label>
            <Input
              id="date"
              type="date"
              value={instanceDate}
              onChange={(e) => setInstanceDate(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setGenerateInstanceId(null);
                setInstanceDate("");
              }}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button onClick={handleGenerateInstance} disabled={!instanceDate || isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                "Generar Reserva"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditFixedSchedules;
