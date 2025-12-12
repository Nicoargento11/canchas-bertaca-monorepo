"use client";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  TriangleAlert,
  CircleX,
  UserRound,
  CircleCheck,
  Edit,
  Coins,
  Clock9,
  CalendarDays,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Eye,
} from "lucide-react";
import { GiSoccerField } from "@react-icons/all-files/gi/GiSoccerField";
import { format } from "date-fns";

import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useDashboardReserveModalStore } from "@/store/reserveDashboardModalStore";
import { useDashboardDetailsModalStore } from "@/store/reserveDashboardDetailsModalStore";
import { useDashboardCompleteReserveModalStore } from "@/store/completeReserveDashboardModalStore";
import { useCompletedReserveDetailsModalStore } from "@/store/completedReserveDetailsModalStore";
import { useDashboardDataStore } from "@/store/dashboardDataStore";
import { Schedule } from "@/services/schedule/schedule";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Complex } from "@/services/complex/complex";
import { useReservationDashboard } from "@/contexts/ReserveDashboardContext";
import { ReserveType, Status } from "@/services/reserve/reserve";
import { SportType } from "@/services/sport-types/sport-types";

export interface ReserveData {
  date: Date;
  schedule: string;
  price: number;
  reservationAmount?: number;
  status?: Status;
  phone?: string;
  clientName?: string;
  reserveType?: ReserveType;
  courtId: string;
  complexId?: string;
  userId: string;
  fixedReserveId?: string;
}

interface TableReservesProps {
  userEmail: string | undefined;
  userId: string | undefined;
  schedules: Schedule[];
  complex: Complex;
  sportType: SportType;
}

const BiTableDay: React.FC<TableReservesProps> = ({
  userEmail,
  userId,
  schedules,
  complex,
  sportType,
}) => {
  const { state, fetchReservationsByDay, setCurrentComplex } = useReservationDashboard();
  const { handleChangeReserve } = useDashboardReserveModalStore((state) => state);
  const { handleChangeDetails } = useDashboardDetailsModalStore((state) => state);
  const { handleChangeCompleteReserve } = useDashboardCompleteReserveModalStore((state) => state);
  const { handleChangeCompletedDetails } = useCompletedReserveDetailsModalStore((state) => state);
  const { date, setDate, getReserveById, setCreateReserve, setReserve } = useDashboardDataStore(
    (state) => state
  );
  const selectedDate = date && format(date, "yyyy-MM-dd");
  console.log(process.env.NEXT_PUBLIC_BACKEND_URL);

  // Efecto para inicializar la fecha en el cliente después de la hidratación
  useEffect(() => {
    // Solo actualizar la fecha si estamos en el cliente y no hay fecha establecida
    if (typeof window !== "undefined" && !date) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      setDate(now);
    }
  }, [date, setDate]);

  const handleOpenCompleteModal = (reserve: any) => {
    setReserve(reserve);
    handleChangeCompleteReserve();
  };

  const handleOpenCompletedDetailsModal = (reserve: any) => {
    setReserve(reserve);
    handleChangeCompletedDetails();
  };

  useEffect(() => {
    const fetchData = async () => {
      if (selectedDate && complex) {
        await fetchReservationsByDay(selectedDate, complex.id, sportType.id);
        setCurrentComplex(complex, sportType);
      }
    };

    fetchData();
  }, [selectedDate, sportType]);

  const renderStatusIcon = (status: string) => {
    switch (status) {
      case "APROBADO":
        return <CircleCheck className="text-green-600" size={16} />;
      case "PENDIENTE":
        return <TriangleAlert className="text-amber-500" size={16} />;
      case "RECHAZADO":
        return <CircleX className="text-red-500" size={16} />;
      case "COMPLETADO":
        return <CheckCircle2 className="text-emerald-600" size={16} />;
      default:
        return null;
    }
  };

  const renderSkeletonRows = () => {
    return Array.from({ length: 6 }).map((_, index) => (
      <tr key={`skeleton-${index}`} className="hover:bg-gray-50 border-b transition-colors">
        <td className="h-[61.804px] text-center font-semibold hidden md:flex md:justify-center md:items-center">
          <Skeleton className="h-4 w-20 bg-gray-200" />
        </td>
        <td className="h-[61.804px] text-center font-semibold flex justify-center md:hidden items-center">
          <Skeleton className="h-4 w-10 bg-gray-200" />
        </td>
        {Array.from({ length: 10 }).map((_, indexCourt) => (
          <td key={`skeleton-${index}-${indexCourt}`} className="w-[100px] h-[61.804px]">
            <Skeleton className="w-full h-full rounded-sm bg-gray-200" />
          </td>
        ))}
      </tr>
    ));
  };

  // Validar si hay canchas para este tipo de deporte
  const courtsForSport = complex.courts.filter((court) => court.sportTypeId === sportType.id);
  const hasCourts = courtsForSport.length > 0;

  // Si no hay canchas, mostrar mensaje
  if (!hasCourts) {
    return (
      <div className="flex flex-col w-full h-full">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="max-w-md mx-auto">
            <GiSoccerField className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay canchas configuradas
            </h3>
            <p className="text-gray-600 mb-4">
              Este complejo no tiene canchas configuradas para <strong>{sportType.name}</strong>.
            </p>
            <p className="text-sm text-gray-500">
              Dirígete a <strong>Configuración → Canchas</strong> para crear canchas para este
              deporte.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full">
      {/* Encabezado con selector de fecha y botón de sidebar */}
      <div className="flex justify-between px-2 py-4 gap-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg mb-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[240px] justify-start text-left font-normal border-gray-300 bg-white hover:bg-gray-50",
                !date && "text-gray-500"
              )}
            >
              <CalendarDays className="mr-2 h-4 w-4 text-blue-600" />{" "}
              {date ? format(date, "PPP") : <span>Elige una fecha</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-gray-300 shadow-md" align="start">
            <Calendar
              mode="single"
              selected={date || undefined}
              onSelect={(dateCalendar) => {
                if (dateCalendar) {
                  setDate(dateCalendar);
                }
              }}
              initialFocus
              className="border-2 border-gray-300 rounded-lg shadow-md p-2 bg-white"
              classNames={{
                months: "space-y-4",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-lg font-bold text-gray-800",
                nav: "space-x-1 flex items-center",
                nav_button:
                  "h-7 w-7 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center justify-center",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-gray-600 rounded-md w-9 font-semibold text-sm",
                row: "flex w-full mt-2",
                cell: "text-center p-0 relative [&:has([aria-selected])]:bg-gray-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-9 w-9 p-0 font-medium rounded-md hover:bg-gray-200 transition-colors",
                day_selected:
                  "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700 font-bold",
                day_today: "bg-gray-100 text-gray-900 font-semibold",
                day_outside: "text-gray-400 opacity-50",
                day_disabled: "text-gray-400 opacity-50",
                day_range_middle: "aria-selected:bg-gray-100 aria-selected:text-gray-900",
                day_hidden: "invisible",
              }}
              components={{
                IconLeft: ({ ...props }) => (
                  <ChevronLeft className="h-4 w-4 text-gray-600" {...props} />
                ),
                IconRight: ({ ...props }) => (
                  <ChevronRight className="h-4 w-4 text-gray-600" {...props} />
                ),
              }}
            />
          </PopoverContent>
        </Popover>
        {/* <SideBarButton /> */}
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-300 overflow-hidden">
        <table className="w-full text-left table-fixed border-separate border-spacing-0">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 to-blue-500">
              <th className="border-b border-blue-700 p-4 sticky top-0 z-10">
                <h6 className="font-semibold leading-none text-white text-center hidden md:block">
                  Horarios
                </h6>
                <div className="flex justify-center">
                  <Clock9 className="block md:hidden text-white" size={30} />
                </div>
              </th>
              {complex.courts
                .filter((court) => court.sportTypeId === state.sportType?.id)
                .sort((a, b) => (a.courtNumber || 0) - (b.courtNumber || 0)) // Ordenar por número de cancha
                .map((court, index) => (
                  <th
                    key={court.id}
                    className="border-b border-blue-700 p-2 sticky top-0 z-10 text-center"
                  >
                    <div className="flex flex-col items-center md:hidden">
                      <div className="relative text-white">
                        <GiSoccerField size={40} />
                      </div>
                      <div className="pt-2 absolute">
                        <p className="font-extrabold text-white">{court.courtNumber}</p>
                      </div>
                    </div>
                    <h6 className="font-semibold leading-none text-white hidden md:block">
                      {`Cancha ${court.courtNumber}` || court.name}
                    </h6>
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {state.loading ? (
              renderSkeletonRows()
            ) : state?.reservationsByDay && state?.reservationsByDay.length > 0 ? (
              state?.reservationsByDay.map((scheduleReserve, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 border-b border-gray-200 transition-colors"
                >
                  <td className="h-[61.804px] text-center font-semibold hidden md:flex md:justify-center md:items-center text-gray-700 bg-gray-50">
                    {scheduleReserve.schedule}
                  </td>
                  <td className="h-[61.804px] text-center font-semibold flex justify-center md:hidden items-center text-gray-700 bg-gray-50">
                    {scheduleReserve.schedule.split(" ")[0]}
                  </td>
                  {complex.courts
                    .filter((court) => court.sportTypeId === state.sportType?.id)
                    .sort((a, b) => (a.courtNumber || 0) - (b.courtNumber || 0)) // Ordenar por número de cancha con fallback
                    .map((court) => {
                      const isReserved = scheduleReserve.court.find(
                        (courtData) => courtData.court.courtNumber === court.courtNumber
                      );

                      if (isReserved) {
                        // Lógica de RowSpan basada en ID para mayor robustez
                        // Verificar si la fila anterior tenía la misma reserva
                        let isContinuation = false;
                        if (index > 0) {
                          const prevSchedule = state.reservationsByDay[index - 1];
                          const prevReserved = prevSchedule.court.find(
                            (c) => c.court.courtNumber === court.courtNumber
                          );
                          if (prevReserved && prevReserved.id === isReserved.id) {
                            isContinuation = true;
                          }
                        }

                        if (isContinuation) {
                          return null; // No renderizar celda si es continuación
                        }

                        // Calcular rowSpan contando filas consecutivas con el mismo ID
                        let span = 1;
                        for (let i = index + 1; i < state.reservationsByDay.length; i++) {
                          const nextSchedule = state.reservationsByDay[i];
                          const nextReserved = nextSchedule.court.find(
                            (c) => c.court.courtNumber === court.courtNumber
                          );
                          if (nextReserved && nextReserved.id === isReserved.id) {
                            span++;
                          } else {
                            break;
                          }
                        }

                        return (
                          <td
                            key={`${scheduleReserve.schedule}-${court.courtNumber}`}
                            rowSpan={span}
                            className="w-[100px] gap-1 relative p-0 border-b border-gray-200"
                          >
                            <div
                              onClick={() => {
                                if (isReserved.date) {
                                  if (isReserved.status === "COMPLETADO") {
                                    getReserveById(isReserved.id);
                                    handleOpenCompletedDetailsModal(isReserved);
                                  } else {
                                    getReserveById(isReserved.id);
                                    handleChangeDetails();
                                  }
                                }
                              }}
                              className={`rounded-md w-full h-full flex flex-col p-2 font-bold text-xs relative transition-all ${
                                isReserved.reserveType === "FIJO"
                                  ? `${isReserved.date ? "cursor-pointer" : "cursor-default"} bg-blue-100 border-2 border-dashed border-blue-400`
                                  : isReserved.status === "PENDIENTE"
                                    ? "cursor-default bg-yellow-100 border-2 border-dashed border-yellow-400"
                                    : isReserved.status === "APROBADO"
                                      ? "bg-green-100 border-2 border-dashed border-green-500 hover:bg-green-200 cursor-pointer"
                                      : isReserved.status === "COMPLETADO"
                                        ? "cursor-pointer bg-emerald-100 border-2 border-solid border-emerald-600 hover:bg-emerald-200"
                                        : "bg-green-100 border-2 border-dashed border-green-500 hover:bg-green-200 hover:cursor-pointer"
                              }`}
                            >
                              <div className="flex gap-0.5 items-center text-gray-800">
                                <UserRound className="hidden sm:block text-gray-900" size={14} />
                                <p className="truncate text-xs">
                                  {isReserved.clientName.split(" ")[0] ||
                                    isReserved.user?.name.split(" ")[0]}
                                </p>
                              </div>
                              {isReserved.reserveType !== "FIJO" && (
                                <div className="flex gap-0.5 items-center text-gray-700">
                                  <Coins className="hidden sm:block text-green-600" size={12} />
                                  <p className="text-xs">
                                    {isReserved.reservationAmount?.toLocaleString("es-AR", {
                                      style: "currency",
                                      currency: "ARS",
                                    })}
                                  </p>{" "}
                                </div>
                              )}
                              {/* Botón de completar */}
                              {isReserved.status === "APROBADO" && (
                                <div className="flex gap-1 mt-1">
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenCompleteModal(isReserved);
                                    }}
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white p-1 h-6 text-xs"
                                  >
                                    <CheckCircle2 size={12} />
                                    <span className="hidden md:inline ml-1">Completar</span>
                                  </Button>
                                </div>
                              )}
                              {/* Botón de ver detalles para reservas completadas */}
                              {isReserved.status === "COMPLETADO" && (
                                <div className="flex gap-1 mt-1">
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenCompletedDetailsModal(isReserved);
                                    }}
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white p-1 h-6 text-xs"
                                  >
                                    <Eye size={12} />
                                    <span className="hidden md:inline ml-1">Ver Detalles</span>
                                  </Button>
                                </div>
                              )}
                              {isReserved.reserveType !== "FIJO" && (
                                <div className="absolute top-1 right-1">
                                  {renderStatusIcon(isReserved.status)}{" "}
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td
                          key={`${scheduleReserve.schedule}-${court.courtNumber}`} // Usar court.courtNumber en lugar de index + 1
                          className="w-[100px] h-[61.804px]"
                        >
                          <div className="bg-gray-50 border border-gray-300 text-gray-700 p-4 w-full h-full rounded-sm flex flex-col justify-center items-center font-bold text-lg hover:bg-gray-100 transition-colors">
                            {scheduleReserve.courtInfo.courts.find(
                              (courtData) => courtData.courtId === court.id
                            ) && (
                              <Button
                                onClick={() => {
                                  if (date) {
                                    setCreateReserve({
                                      date: date,
                                      schedule: scheduleReserve.schedule,
                                      userId: userId!,
                                      price:
                                        scheduleReserve.courtInfo.courts.find(
                                          (courtData) => courtData.courtId === court.id
                                        )?.rates[0].price ||
                                        scheduleReserve.courtInfo.rates[0].price,
                                      courtId: court.id,
                                      complexId: complex.id,
                                      reserveType: "MANUAL",
                                    });
                                    handleChangeReserve();
                                  }
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded-md text-xs flex items-center gap-1 shadow-sm"
                              >
                                <Edit size={20} />
                                <p className="hidden md:block">Reservar</p>
                              </Button>
                            )}
                          </div>
                        </td>
                      );
                    })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500 bg-gray-50">
                  No hay reservas para esta fecha
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BiTableDay;
