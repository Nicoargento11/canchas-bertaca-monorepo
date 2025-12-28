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
  Package,
} from "lucide-react";
import Link from "next/link";
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
import { hasPromotionForSchedule } from "@/hooks/useApplicablePromotions";
import { DashboardKPIs } from "./DashboardKPIs";
import { SideBarButton } from "../sideBarButton";
import { getActiveCashSession } from "@/services/cash-session/cash-session";
import { getAllCashRegisters } from "@/services/cash-register/cash-register";
import { useCashSessionWarningModalStore } from "@/store/cashSessionWarningModalStore";
import { CashSessionWarningModal } from "./cashSessionWarningModal";

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
  const { handleOpen: handleOpenCashWarning } = useCashSessionWarningModalStore();
  const { date, setDate, getReserveById, setCreateReserve, setReserve } = useDashboardDataStore(
    (state) => state
  );
  const selectedDate = date && format(date, "yyyy-MM-dd");

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
    <div className="flex flex-col w-full h-full p-4">
      {/* KPIs Operativos */}
      <DashboardKPIs />

      {/* Encabezado con selector de fecha */}
      <div className="flex justify-between py-3 gap-2 mb-4">
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
        {/* Botón a Stock */}
        <Link href={`/${complex.slug}/dashboard/stock`}>
          <Button variant="outline" className="border-gray-300 bg-white hover:bg-gray-50">
            <Package className="mr-2 h-4 w-4 text-blue-600" />
            Stock
          </Button>
        </Link>
        {/* Botón sidebar */}
        <SideBarButton />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left table-fixed border-separate border-spacing-0">
          <thead>
            <tr className="bg-gray-900 text-white">
              {/* Columna horario - angosta en mobile */}
              <th className="w-[50px] md:w-[120px] p-2 md:p-3 sticky top-0 z-10 bg-slate-900">
                <span className="text-xs font-semibold uppercase tracking-wider hidden md:block text-center text-white">
                  Horario
                </span>
                <div className="flex justify-center md:hidden">
                  <Clock9 className="text-white" size={16} />
                </div>
              </th>
              {complex.courts
                .filter((court) => court.sportTypeId === state.sportType?.id)
                .sort((a, b) => (a.courtNumber || 0) - (b.courtNumber || 0))
                .map((court) => (
                  <th
                    key={court.id}
                    className="p-2 md:p-3 sticky top-0 z-10 text-center bg-slate-900"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wider hidden md:block text-white">
                      Cancha {court.courtNumber}
                    </span>
                    <span className="text-xs font-semibold md:hidden text-white">
                      C{court.courtNumber}
                    </span>
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
                  className="border-b border-gray-100"
                >
                  {/* Celda de horario - desktop */}
                  <td className="w-[50px] md:w-[120px] min-h-[48px] md:h-[56px] text-center font-medium text-slate-900 bg-slate-100 border-r border-slate-200 hidden md:table-cell align-middle">
                    {scheduleReserve.schedule}
                  </td>
                  {/* Celda de horario - mobile: solo hora inicio */}
                  <td className="w-[50px] min-h-[48px] text-center font-semibold text-slate-900 bg-slate-100 border-r border-slate-200 text-xs md:hidden align-middle py-2">
                    {scheduleReserve.schedule.split(" ")[0].replace(":00", "")}
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
                              className={`rounded-lg w-full h-full flex flex-col p-2 md:p-3 relative transition-all cursor-pointer hover:shadow-lg border-l-4 min-h-[48px]
                              ${isReserved.reserveType === "FIJO"
                                  ? "bg-violet-50 border-l-violet-600 hover:bg-violet-100"
                                  : isReserved.status === "PENDIENTE"
                                    ? "bg-amber-50 border-l-amber-600 hover:bg-amber-100"
                                    : isReserved.status === "COMPLETADO"
                                      ? "bg-blue-50 border-l-blue-600 hover:bg-blue-100"
                                      : (isReserved.price || 0) - (isReserved.reservationAmount || 0) > 0
                                        ? "bg-amber-50 border-l-amber-600 hover:bg-amber-100"
                                        : "bg-emerald-50 border-l-emerald-600 hover:bg-emerald-100"
                                }`}
                            >
                              {/* Nombre del cliente */}
                              <p className="font-semibold text-sm md:text-base text-slate-900 truncate leading-tight">
                                {isReserved.clientName?.split(" ")[0] ||
                                  isReserved.user?.name?.split(" ")[0] || "Cliente"}
                              </p>

                              {/* Info de pago o FIJO - compacto */}
                              <div className="flex items-center gap-1 mt-1">
                                {isReserved.reserveType === "FIJO" ? (
                                  <span className="text-xs md:text-sm text-violet-700 font-semibold">FIJO</span>
                                ) : (isReserved.price || 0) - (isReserved.reservationAmount || 0) > 0 ? (
                                  <span className="text-xs md:text-sm text-amber-700 font-semibold">
                                    ${((isReserved.price || 0) - (isReserved.reservationAmount || 0)).toLocaleString()}
                                  </span>
                                ) : (
                                  <span className="text-xs md:text-sm text-emerald-700 font-semibold">✓ Pagado</span>
                                )}
                              </div>
                              {/* Botón de completar */}
                              {isReserved.status === "APROBADO" && (
                                <div className="flex gap-1 mt-1">
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenCompleteModal(isReserved);
                                    }}
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 h-8 text-xs min-w-[44px]"
                                  >
                                    <CheckCircle2 size={14} />
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
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 h-8 text-xs min-w-[44px]"
                                  >
                                    <Eye size={14} />
                                    <span className="hidden md:inline ml-1">Ver</span>
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

                      // Verificar si hay promo para esta cancha/horario
                      const activePromos = complex.promotions?.filter(p => p.isActive) || [];
                      const hasPromoForSchedule = date && hasPromotionForSchedule(activePromos, date, scheduleReserve.schedule);
                      const courtPromo = hasPromoForSchedule && activePromos.find(p => {
                        if (!p.isActive) return false;
                        if (p.courtId && p.courtId !== court.id) return false;
                        if (p.sportTypeId && p.sportTypeId !== sportType.id) return false;
                        return true;
                      });

                      return (
                        <td
                          key={`${scheduleReserve.schedule}-${court.courtNumber}`}
                          className="w-[100px] h-[52px] p-1"
                        >
                          {scheduleReserve.courtInfo.courts.find(
                            (courtData) => courtData.courtId === court.id
                          ) && (
                              <div
                                onClick={async () => {
                                  if (date) {
                                    const reserveData = {
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
                                      reserveType: "MANUAL" as const,
                                    };

                                    // Check if there's an active cash session
                                    let hasActiveCashSession = false;
                                    if (complex?.id) {
                                      const { success: registersSuccess, data: cashRegisters } = await getAllCashRegisters(complex.id);
                                      if (registersSuccess && cashRegisters && cashRegisters.length > 0) {
                                        const activeCashRegister = cashRegisters.find((register) => register.isActive);
                                        if (activeCashRegister) {
                                          const { success, data: activeCashSession } = await getActiveCashSession(activeCashRegister.id);
                                          if (success && activeCashSession) {
                                            hasActiveCashSession = true;
                                          }
                                        }
                                      }
                                    }

                                    setCreateReserve(reserveData);

                                    // Show warning if no active session, otherwise open reserve form directly
                                    if (!hasActiveCashSession) {
                                      handleOpenCashWarning(reserveData);
                                    } else {
                                      handleChangeReserve();
                                    }
                                  }
                                }}
                                className={`w-full h-full min-h-[48px] rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-all group active:scale-95 ${courtPromo ? 'border-amber-400 bg-amber-50 hover:border-amber-500 hover:bg-amber-100' : 'border-slate-300 bg-slate-50 hover:border-emerald-500 hover:bg-emerald-50'}`}
                              >
                                <span className={`text-2xl font-light transition-colors ${courtPromo ? 'text-amber-500 group-hover:text-amber-700' : 'text-slate-400 group-hover:text-emerald-600'}`}>+</span>
                              </div>
                            )}
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
