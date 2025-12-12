"use client";

import { useState } from "react";
import { deleteScheduleFetch, Schedule, updateScheduleFetch } from "@/services/schedule/schedule";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X, Trash } from "lucide-react";
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
import { filterValidEndTimeOptions } from "@/utils/timeValidation";
import { toast } from "sonner";
import { Complex } from "@/services/complex/complex";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatSportType } from "../courts/cancha-form";
import { SportTypeKey } from "@/services/sport-types/sport-types";
import { useScheduleStore } from "@/store/settings/scheduleStore";
import { useRateStore } from "@/store/settings/rateStore";

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
  complex: Complex;
}

const EditSchedules = ({ complex }: EditSchedulesProps) => {
  const router = useRouter();
  const { deleteSchedule, updateSchedule, schedules } = useScheduleStore();
  const { rates } = useRateStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<{
    startTime: string;
    endTime: string;
    scheduleDayId: string;
    rateId: string;
    sportTypeId: string;
  }>({
    startTime: "",
    endTime: "",
    scheduleDayId: "",
    rateId: "",
    sportTypeId: "",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Organizar horarios por deporte, cancha y día
  const groupedBySport = schedules.reduce(
    (acc, schedule) => {
      const sportType = schedule.court?.sportType?.name || "Sin deporte";
      const courtName = schedule.court?.name || `Cancha ${schedule.court?.courtNumber || "N/A"}`;
      const dayName =
        daysOfWeek.find((d) => d.id === schedule.scheduleDay.dayOfWeek)?.name || "Desconocido";

      if (!acc[sportType]) {
        acc[sportType] = {};
      }

      if (!acc[sportType][courtName]) {
        acc[sportType][courtName] = {};
      }

      if (!acc[sportType][courtName][dayName]) {
        acc[sportType][courtName][dayName] = [];
      }

      acc[sportType][courtName][dayName].push(schedule);

      return acc;
    },
    {} as Record<string, Record<string, Record<string, Schedule[]>>>
  );

  // Ordenar los horarios por hora de inicio
  Object.keys(groupedBySport).forEach((sport) => {
    Object.keys(groupedBySport[sport]).forEach((court) => {
      Object.keys(groupedBySport[sport][court]).forEach((day) => {
        groupedBySport[sport][court][day].sort((a, b) => a.startTime.localeCompare(b.startTime));
      });
    });
  });

  const handleEdit = (schedule: Schedule) => {
    setEditingId(schedule.id);
    setEditedData({
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      scheduleDayId: schedule.scheduleDay.id,
      rateId: schedule.rates[0]?.id || "",
      sportTypeId: schedule.sportTypeId || "",
    });
  };

  const handleSave = async (id: string) => {
    try {
      const { success, data, error } = await updateScheduleFetch(id, {
        ...editedData,
        complexId: complex.id,
      });
      if (!success || !data) {
        toast.error(error || "Error al actualizar el horario");
        return;
      }
      updateSchedule(id, editedData);
      toast.success("Horario actualizado correctamente");
      setEditingId(null);
      router.refresh();
    } catch (error) {
      toast.error("Error al actualizar el horario");
      console.error(error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { success, data, error } = await deleteScheduleFetch(deleteId);
      if (!success || !data) {
        toast.error(error || "Error al eliminar el horario");
        return;
      }
      deleteSchedule(deleteId);
      toast.success("Horario eliminado correctamente");
      setDeleteId(null);
      router.refresh();
    } catch (error) {
      toast.error("Error al eliminar el horario");
      console.error(error);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {Object.keys(groupedBySport).length > 0 ? (
        Object.entries(groupedBySport).map(([sportName, courts]) => (
          <Card key={sportName} className="border-none shadow-sm">
            <CardHeader className="pb-3 px-4 md:px-6">
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg md:text-xl font-semibold">
                  {formatSportType(sportName as SportTypeKey)}
                </span>
                <Badge variant="secondary" className="px-2 py-1 text-sm">
                  {Object.keys(courts).length} cancha(s)
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-2 md:px-4">
              <div className="space-y-3 md:space-y-4">
                <Accordion type="multiple" className="w-full">
                  {Object.entries(courts).map(([courtName, days]) => (
                    <AccordionItem key={courtName} value={courtName} className="border-b-0">
                      <AccordionTrigger className="hover:no-underline px-3 py-3 md:px-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium text-base md:text-lg">{courtName}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-0 py-2">
                        <div className="mt-1 space-y-3 md:space-y-4">
                          {Object.entries(days).map(([dayName, daySchedules]) => (
                            <div key={dayName} className="space-y-2 md:space-y-3">
                              <h4 className="text-sm md:text-base font-medium text-gray-700 px-3 md:px-4">
                                {dayName}
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 px-3 md:px-4">
                                {daySchedules.map((schedule) => (
                                  <div
                                    key={schedule.id}
                                    className={`relative rounded-lg border p-3 transition-all ${
                                      editingId === schedule.id
                                        ? "border-blue-300 bg-blue-50"
                                        : "border-gray-200 bg-white hover:border-gray-300"
                                    }`}
                                  >
                                    {editingId === schedule.id ? (
                                      <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-2">
                                          <div className="space-y-1">
                                            <label className="text-xs md:text-sm font-medium text-gray-500">
                                              Inicio
                                            </label>
                                            <Select
                                              value={editedData.startTime}
                                              onValueChange={(value) =>
                                                setEditedData({ ...editedData, startTime: value })
                                              }
                                            >
                                              <SelectTrigger className="h-9 md:h-10 text-sm">
                                                <SelectValue placeholder="Inicio" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {generateTimeOptions().map((time) => (
                                                  <SelectItem
                                                    key={time}
                                                    value={time}
                                                    className="text-sm"
                                                  >
                                                    {time}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </div>

                                          <div className="space-y-1">
                                            <label className="text-xs md:text-sm font-medium text-gray-500">
                                              Fin
                                            </label>
                                            <Select
                                              value={editedData.endTime}
                                              onValueChange={(value) =>
                                                setEditedData({ ...editedData, endTime: value })
                                              }
                                            >
                                              <SelectTrigger className="h-9 md:h-10 text-sm">
                                                <SelectValue placeholder="Fin" />
                                              </SelectTrigger>{" "}
                                              <SelectContent>
                                                {filterValidEndTimeOptions(
                                                  generateTimeOptions(),
                                                  editedData.startTime
                                                ).map((time) => (
                                                  <SelectItem
                                                    key={time}
                                                    value={time}
                                                    className="text-sm"
                                                  >
                                                    {time}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </div>
                                        </div>

                                        <div className="space-y-1">
                                          <label className="text-xs md:text-sm font-medium text-gray-500">
                                            Tarifa
                                          </label>
                                          <Select
                                            value={editedData.rateId}
                                            onValueChange={(value) =>
                                              setEditedData({ ...editedData, rateId: value })
                                            }
                                          >
                                            <SelectTrigger className="h-9 md:h-10 text-sm">
                                              <SelectValue placeholder="Tarifa" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {rates.map((rate) => (
                                                <SelectItem
                                                  key={rate.id}
                                                  value={rate.id}
                                                  className="text-sm"
                                                >
                                                  {rate.name} (${rate.price})
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>

                                        <div className="flex gap-2 pt-1">
                                          <Button
                                            size="icon"
                                            className="h-9 md:h-10 flex-1 text-sm"
                                            onClick={() => handleSave(schedule.id)}
                                          >
                                            <Check className="h-4 w-4 mr-1" />
                                          </Button>
                                          <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-9 md:h-10 flex-1 text-sm"
                                            onClick={handleCancel}
                                          >
                                            <X className="h-4 w-4 mr-1" />
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <div className="flex justify-between items-center">
                                          <div>
                                            <p className="font-medium text-sm md:text-base">
                                              {schedule.startTime} - {schedule.endTime}
                                            </p>
                                            <p className="text-xs md:text-sm text-gray-600 mt-1">
                                              {schedule.rates[0]?.name} (${schedule.rates[0]?.price}
                                              )
                                            </p>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
                                              onClick={() => handleEdit(schedule)}
                                            >
                                              <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                                              onClick={() => setDeleteId(schedule.id)}
                                            >
                                              <Trash className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500 text-base md:text-lg">
          No hay horarios programados
        </div>
      )}

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar horario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el horario
              seleccionado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditSchedules;
