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

import { useReservationDashboard } from "@/contexts/ReserveDashboardContext";

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
  const { state, fetchReservationsByDay } = useReservationDashboard();
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
    sportType: any;
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
    // Also fetch all reservations to get available time slots
    const today = new Date();
    // Find next occurrence of selectedDay
    const daysUntil = (selectedDay - today.getDay() + 7) % 7;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + (daysUntil === 0 ? 0 : daysUntil));
    const dateStr = targetDate.toISOString().split('T')[0];

    if (complex.sportTypes && complex.sportTypes.length > 0) {
      fetchReservationsByDay(dateStr, complex.id, complex.sportTypes[0].id);
    }
  }, [selectedDay, complex.id]);

  // Use schedules from backend (like biTableDay)
  const timeSlots = useMemo(() => {
    if (state.reservationsByDay && state.reservationsByDay.length > 0) {
      return state.reservationsByDay.map(r => r.schedule);
    }
    // Fallback
    const slots = [];
    for (let i = 8; i < 24; i++) {
      slots.push(`${String(i).padStart(2, "0")}:00 - ${String(i + 1).padStart(2, "0")}:00`);
    }
    return slots;
  }, [state.reservationsByDay]);

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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed border-separate border-spacing-0">
              <thead>
                <tr className="bg-gray-900 text-white">
                  {/* Columna horario - angosta en mobile */}
                  <th className="w-[50px] md:w-[120px] p-2 md:p-3 sticky top-0 z-10 bg-gray-900">
                    <span className="text-xs font-semibold uppercase tracking-wider hidden md:block text-center">
                      Horario
                    </span>
                    <div className="flex justify-center md:hidden">
                      <Clock9 className="text-gray-300" size={16} />
                    </div>
                  </th>
                  {complex.courts
                    .slice()
                    .sort((a, b) => (a.courtNumber || 0) - (b.courtNumber || 0))
                    .map((court) => (
                      <th
                        key={court.id}
                        className="p-2 md:p-3 sticky top-0 z-10 text-center bg-gray-900"
                      >
                        <span className="text-xs font-semibold uppercase tracking-wider hidden md:block">
                          Cancha {court.courtNumber ?? "-"}
                        </span>
                        <span className="text-xs font-semibold md:hidden">
                          C{court.courtNumber ?? "-"}
                        </span>
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((timeSlot) => {
                  const [startTime] = timeSlot.split(" - ");
                  const slotStartHour = parseInt(startTime.split(":")[0]);

                  return (
                    <tr key={timeSlot} className="border-b border-gray-100">
                      {/* Horario Label - Desktop */}
                      <td className="w-[50px] md:w-[120px] min-h-[48px] md:h-[56px] text-center font-medium text-gray-800 bg-gray-50 border-r border-gray-100 hidden md:table-cell align-middle">
                        {timeSlot}
                      </td>
                      {/* Horario Label - Mobile: solo hora */}
                      <td className="w-[50px] min-h-[48px] text-center font-semibold text-gray-700 bg-gray-50 border-r border-gray-100 text-xs md:hidden align-middle py-2">
                        {startTime.replace(":00", "")}
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
                                      className="bg-gray-50/50 opacity-20 pointer-events-none p-1"
                                    ></td>
                                  );
                              }

                              return (
                                <td
                                  key={fixedReserve.id}
                                  rowSpan={duration}
                                  onClick={() => handleCellClick(timeSlot, court.id)}
                                  className="p-1 cursor-pointer align-top"
                                >
                                  <div className={`h-full w-full bg-white rounded-lg p-2 md:p-3 hover:shadow-md transition-all flex flex-col relative overflow-hidden border-l-4 ${fixedReserve.isActive ? "border-l-violet-500" : "border-l-gray-400"}`}>

                                    {/* Contenido principal - compacto */}
                                    <div className="flex-1">
                                      <p className="font-semibold text-gray-900 text-xs md:text-sm truncate leading-tight">
                                        {fixedReserve.user.name.split(" ")[0]}
                                      </p>
                                      <p className="text-[10px] md:text-xs text-gray-500 truncate mt-0.5">
                                        {fixedReserve.startTime.slice(0, 5)} - {fixedReserve.endTime.slice(0, 5)}
                                      </p>
                                    </div>

                                    {/* Footer: Precio + Botones */}
                                    <div className="mt-1 pt-1 border-t border-gray-100 flex items-center justify-between">
                                      <span className="text-[10px] md:text-xs font-bold text-gray-700">
                                        ${fixedReserve.rate?.price?.toLocaleString() || "-"}
                                      </span>
                                      <div className="flex gap-0.5">
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-6 w-6 text-gray-400 hover:text-gray-600"
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
                                          <Pencil className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className={`h-6 w-6 ${fixedReserve.isActive ? "text-green-500" : "text-gray-400"}`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleStatus(fixedReserve.id);
                                          }}
                                        >
                                          <Power className="h-3 w-3" />
                                        </Button>
                                      </div>
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
                              className="h-[52px] p-1 cursor-pointer transition-all group"
                            >
                              <div className="w-full h-full min-h-[48px] rounded-lg border border-dashed border-gray-200 flex items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-all">
                                <span className="text-gray-300 text-lg font-light group-hover:text-gray-500 transition-colors">+</span>
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
