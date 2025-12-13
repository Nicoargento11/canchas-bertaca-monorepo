"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  MapPin,
  CalendarDays,
  Loader2,
  Clock9,
  Power,
  Pencil,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Complex } from "@/services/complex/complex";
import {
  getFixedReserves,
  toggleFixedReserveStatus,
  FixedReserve,
} from "@/services/fixed-reserve/fixed-reserve";
import { CreateFixedReserveModal } from "@/components/modals/CreateFixedReserveModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { GiSoccerField } from "@react-icons/all-files/gi/GiSoccerField";

interface FijosGridViewProps {
  complex: Complex;
}

const DAYS = [
  { id: 1, label: "Lunes" },
  { id: 2, label: "Martes" },
  { id: 3, label: "Miércoles" },
  { id: 4, label: "Jueves" },
  { id: 5, label: "Viernes" },
  { id: 6, label: "Sábado" },
  { id: 0, label: "Domingo" },
];

export function FijosGridView({ complex }: FijosGridViewProps) {
  const { toast } = useToast();
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const [fixedReserves, setFixedReserves] = useState<FixedReserve[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState<{
    courtId: string;
    startTime: string;
    endTime: string;
    dayOfWeek: number;
    sportType: any; // TODO: Type properly
  } | null>(null);
  const [editingReserve, setEditingReserve] = useState<FixedReserve | null>(null);

  const fetchFixedReserves = async () => {
    setIsLoading(true);
    try {
      const result = await getFixedReserves(complex.id, selectedDay);
      if (result.success && result.data) {
        setFixedReserves(result.data);
      } else {
        toast({
          title: "Error",
          description: "No se pudieron cargar los turnos fijos",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFixedReserves();
  }, [selectedDay, complex.id]);

  const timeSlots = useMemo(() => {
    if (!complex.schedules || complex.schedules.length === 0) {
      // Fallback default hours
      const slots = [];
      for (let i = 8; i < 24; i++) {
        slots.push(`${String(i).padStart(2, "0")}:00 - ${String(i + 1).padStart(2, "0")}:00`);
      }
      return slots;
    }

    let minHour = 24;
    let maxHour = 0;

    complex.schedules.forEach((s) => {
      const start = parseInt(s.startTime.split(":")[0]);
      const end = parseInt(s.endTime.split(":")[0]);
      if (start < minHour) minHour = start;
      if (end > maxHour) maxHour = end;
    });

    // Ensure reasonable bounds if data is weird
    if (minHour > maxHour) {
      minHour = 8;
      maxHour = 23;
    }

    const slots = [];
    for (let i = minHour; i < maxHour; i++) {
      slots.push(`${String(i).padStart(2, "0")}:00 - ${String(i + 1).padStart(2, "0")}:00`);
    }
    return slots;
  }, [complex.schedules]);

  const handleToggleStatus = async (id: string) => {
    const result = await toggleFixedReserveStatus(id, true);
    if (result.success) {
      toast({ title: "Éxito", description: "Estado actualizado correctamente." });
      fetchFixedReserves();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  const handleCellClick = (timeSlot: string, courtId: string) => {
    const [startTime, endTime] = timeSlot.split(" - ");

    // Check if occupied by ANY reserve covering this slot
    const slotStartHour = parseInt(startTime.split(":")[0]);

    const occupied = fixedReserves.find((fr) => {
      if (fr.courtId !== courtId) return false;
      const rStart = parseInt(fr.startTime.split(":")[0]);
      const rEnd = parseInt(fr.endTime.split(":")[0]);
      return slotStartHour >= rStart && slotStartHour < rEnd;
    });

    if (occupied) {
      // Open edit/details modal (TODO)
      toast({ title: "Info", description: "Este turno ya está ocupado. Edición próximamente." });
    } else {
      // Open create modal
      setModalInitialData({
        courtId,
        startTime,
        endTime,
        dayOfWeek: selectedDay,
        sportType: complex.sportTypes[0], // Default to first sport type for now
      });
      setIsModalOpen(true);
    }
  };

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-6 pb-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Turnos Fijos Activos</h2>
            <p className="text-sm text-gray-500 mt-1">
              Gestiona los turnos recurrentes de tus clientes
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Select
              value={selectedDay.toString()}
              onValueChange={(val) => setSelectedDay(parseInt(val))}
            >
              <SelectTrigger className="w-[180px]">
                <CalendarDays className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Seleccionar día" />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((day) => (
                  <SelectItem key={day.id} value={day.id.toString()}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="🔍 Buscar por cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors rounded-xl"
          />
        </div>
      </div>

      {/* Grid Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-300 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed border-separate border-spacing-0">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-500">
                  <th className="border-b border-blue-700 p-4 sticky top-0 z-10">
                    <h6 className="font-semibold leading-none text-white text-center hidden md:block">
                      Horarios
                    </h6>
                    <div className="flex justify-center">
                      <Clock9 className="block md:hidden text-white" size={24} />
                    </div>
                  </th>
                  {complex.courts
                    .slice()
                    .sort((a, b) => (a.courtNumber || 0) - (b.courtNumber || 0))
                    .map((court) => (
                      <th
                        key={court.id}
                        className="border-b border-blue-700 p-2 sticky top-0 z-10 text-center"
                      >
                        <div className="flex flex-col items-center md:hidden">
                          <div className="relative text-white">
                            <GiSoccerField size={40} />
                          </div>
                          <div className="pt-2 absolute">
                            <p className="font-extrabold text-white">{court.courtNumber ?? "-"}</p>
                          </div>
                        </div>
                        <h6 className="font-semibold leading-none text-white hidden md:block">
                          {court.courtNumber ? `Cancha ${court.courtNumber}` : court.name}
                        </h6>
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((timeSlot) => {
                  const [startTime] = timeSlot.split(" - ");
                  const slotStartHour = parseInt(startTime.split(":")[0]);

                  return (
                    <tr key={timeSlot} className="hover:bg-gray-50 transition-colors">
                      {/* Horario Label */}
                      <td className="h-[80px] text-center font-semibold hidden md:flex md:justify-center md:items-center text-gray-700 bg-gray-50 border-r border-b border-gray-300">
                        {timeSlot}
                      </td>
                      <td className="h-[80px] text-center font-semibold flex justify-center md:hidden items-center text-gray-700 bg-gray-50 border-r border-b border-gray-300">
                        {startTime}
                      </td>

                      {/* Cells */}
                      {complex.courts
                        .slice()
                        .sort((a, b) => (a.courtNumber || 0) - (b.courtNumber || 0))
                        .map((court) => {
                          // Find if any reserve covers this slot
                          const fixedReserve = fixedReserves.find((fr) => {
                            if (fr.courtId !== court.id) return false;
                            const rStart = parseInt(fr.startTime.split(":")[0]);
                            const rEnd = parseInt(fr.endTime.split(":")[0]);
                            // Check if this slot is within the reserve duration
                            return slotStartHour >= rStart && slotStartHour < rEnd;
                          });

                          // If this slot is covered by a reserve
                          if (fixedReserve) {
                            const rStart = parseInt(fixedReserve.startTime.split(":")[0]);
                            const rEnd = parseInt(fixedReserve.endTime.split(":")[0]);

                            // Only render the cell if it's the START of the reserve
                            if (slotStartHour === rStart) {
                              const duration = rEnd - rStart;

                              // Filter by search term
                              if (searchTerm) {
                                const matches = fixedReserve.user.name
                                  .toLowerCase()
                                  .includes(searchTerm.toLowerCase());
                                if (!matches)
                                  return (
                                    <td
                                      key={`${timeSlot}-${court.id}`}
                                      rowSpan={duration}
                                      className="border-r border-b border-gray-300 bg-gray-50/50 opacity-20 pointer-events-none"
                                    ></td>
                                  );
                              }

                              return (
                                <td
                                  key={fixedReserve.id}
                                  rowSpan={duration}
                                  onClick={() => handleCellClick(timeSlot, court.id)}
                                  className="border-r border-b border-gray-300 p-1 cursor-pointer align-top bg-white"
                                >
                                  <div className="h-full w-full bg-white border border-gray-200 rounded-md p-2 hover:border-blue-400 hover:shadow-md transition-all flex flex-col relative overflow-hidden">
                                    <div
                                      className={`absolute top-0 left-0 w-1 h-full ${fixedReserve.isActive ? "bg-green-500" : "bg-red-500"}`}
                                    />

                                    <div className="absolute top-1 right-1 z-10 flex gap-1">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingReserve(fixedReserve);
                                          setModalInitialData({
                                            courtId: fixedReserve.courtId,
                                            startTime: fixedReserve.startTime,
                                            endTime: fixedReserve.endTime,
                                            dayOfWeek: selectedDay,
                                            sportType: complex.sportTypes[0],
                                          });
                                          setIsModalOpen(true);
                                        }}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className={`h-8 w-8 ${fixedReserve.isActive ? "text-green-600 hover:text-red-600 hover:bg-red-50" : "text-red-600 hover:text-green-600 hover:bg-green-50"}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleToggleStatus(fixedReserve.id);
                                        }}
                                      >
                                        <Power className="h-5 w-5" />
                                      </Button>
                                    </div>

                                    <div className="pl-2 flex-1">
                                      <div className="flex justify-between items-start">
                                        <p className="font-semibold text-gray-900 text-sm truncate">
                                          {fixedReserve.user.name}
                                        </p>
                                        {fixedReserve.isActive && (
                                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-500 truncate mt-1">
                                        {fixedReserve.user.phone || "-"}
                                      </p>

                                      <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-1 rounded">
                                        <Clock9 className="w-3 h-3 inline mr-1" />
                                        {fixedReserve.startTime.slice(0, 5)} -{" "}
                                        {fixedReserve.endTime.slice(0, 5)}
                                      </div>
                                    </div>

                                    <div className="pl-2 mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                                      <span className="text-xs font-bold text-gray-700">
                                        ${fixedReserve.rate?.price || "-"}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                              );
                            } else {
                              // This slot is covered by a reserve starting earlier
                              // Do NOT render a cell here, as the previous one has rowSpan
                              return null;
                            }
                          }

                          // Empty cell (no reserve covers this slot)
                          return (
                            <td
                              key={`${timeSlot}-${court.id}`}
                              onClick={() => handleCellClick(timeSlot, court.id)}
                              className="border-r border-b border-gray-300 cursor-pointer hover:bg-blue-50 transition-all group relative p-0 bg-white"
                            >
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <Plus className="w-6 h-6 text-blue-400" />
                              </div>
                            </td>
                          );
                        })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateFixedReserveModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingReserve(null);
        }}
        onSuccess={() => {
          fetchFixedReserves();
          setIsModalOpen(false);
          setEditingReserve(null);
        }}
        complex={complex}
        initialData={modalInitialData}
        editingReserve={editingReserve}
      />
    </div>
  );
}
