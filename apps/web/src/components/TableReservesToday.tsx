"use client";
import { Check, X, Clock9 } from "lucide-react";
import { GiSoccerField } from "@react-icons/all-files/gi/GiSoccerField";
import { Court } from "@/services/court/court";
import { Complex } from "@/services/complex/complex";
import { SportType, SportTypeKey } from "@/services/sport-types/sport-types";
import { TurnByDay } from "@/services/reserve/reserve";
import { useModal } from "@/contexts/modalContext";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useReserve } from "@/contexts/newReserveContext";
import { createAdjustedDateTime } from "@/utils/timeValidation";
import { isAfter } from "date-fns";
import { hasPromotionForSchedule } from "@/hooks/useApplicablePromotions";

const tableHead = ["Cancha 1", "Cancha 2", "Cancha 3", "Cancha 4"];
const courts = [1, 2, 3, 4];

interface TableReservesTodayProps {
  dayReserves: TurnByDay | undefined;
  courts: Court[];
  complex: Complex;
  sportTypes: Record<string, SportType>;
  onReserveClick?: (
    complexId: string,
    sportType: any,
    sportTypeId: string,
    day: Date,
    hour: string,
    field: string
  ) => void;
}

const TableReservesToday: React.FC<TableReservesTodayProps> = ({
  dayReserves,
  courts,
  complex,
  sportTypes,
  onReserveClick,
}) => {
  const { preloadReservation, getCurrentReservation } = useReserve();
  const { openModal } = useModal();
  const [isMobile, setIsMobile] = useState(false);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const filteredDayReserves = useMemo(() => {
    if (!dayReserves) return [];

    const today = new Date();
    const currentTime = new Date();
    today.setHours(0, 0, 0, 0);
    const isToday = new Date().toDateString() === today.toDateString();

    // Verificar si hoy está deshabilitado en el complejo
    const isTodayDisabled = complex.unavailableDays.some((day) => {
      const disabledDate = new Date(day.date);
      return (
        disabledDate.getDate() === today.getDate() &&
        disabledDate.getMonth() === today.getMonth() &&
        disabledDate.getFullYear() === today.getFullYear()
      );
    });

    if (isTodayDisabled) return []; // Si hoy está deshabilitado, no mostrar turnos

    if (!isToday) return dayReserves;

    return dayReserves.filter((turn) => {
      const [startTime] = turn.schedule.split(" - ");
      const adjustedDate = createAdjustedDateTime(today, startTime);
      return isAfter(adjustedDate, currentTime);
    });
  }, [dayReserves, complex.unavailableDays]);

  const checkScreenSize = useCallback(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    checkScreenSize();

    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(checkScreenSize, 150);
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [checkScreenSize]);

  const handleCellClick = useCallback(
    (date: Date, hour: string, field: string) => {
      const court = courts.find((c) => c.id === field);
      if (!court || !court.sportTypeId) return;

      // Find sport type name from the map using the ID
      const sportTypeEntry = Object.entries(sportTypes).find(
        ([_, st]) => st.id === court.sportTypeId
      );
      const sportTypeName = sportTypeEntry ? (sportTypeEntry[0] as SportTypeKey) : undefined;

      if (!sportTypeName) return;

      if (onReserveClick) {
        onReserveClick(complex.id, sportTypeName, court.sportTypeId, date, hour, field);
        return;
      }

      date.setHours(0, 0, 0, 0);
      preloadReservation({
        complexId: complex.id,
        sportType: sportTypeName,
        sportTypeId: court.sportTypeId,
        day: date,
        hour,
        field,
        initialStep: 3,
      });
      openModal("RESERVE_FUTBOL", { complexId: complex.id, sportType: sportTypeName });
    },
    [complex.id, sportTypes, courts, preloadReservation, openModal, onReserveClick]
  );

  if (!filteredDayReserves || filteredDayReserves.length === 0) {
    return (
      <div className="bg-white/5 rounded-xl p-8 border border-white/10 shadow-lg text-center backdrop-blur-sm">
        <div className="bg-white/10 p-6 rounded-full inline-block mb-4 border border-white/10 shadow-md">
          <Clock9 size={48} className="text-white/80" />
        </div>
        <p className="text-white/80 font-medium text-lg">
          {new Date().toDateString() === new Date().toDateString()
            ? "No hay más turnos disponibles para hoy"
            : "No hay turnos disponibles para este día"}
        </p>
      </div>
    );
  }

  // Mobile view
  if (isMobile) {
    return (
      <div className="bg-white/5 rounded-xl border border-white/10 shadow-lg w-full max-w-[98vw] mx-auto overflow-hidden backdrop-blur-sm">
        <div className="p-3 bg-white/10 text-white font-bold text-center text-lg shadow-md border-b border-white/10">
          Turnos para hoy
        </div>
        <div className="p-2">
          <div
            className="grid gap-1 mb-2 bg-black/20 rounded-lg p-2 shadow-md border border-white/5"
            style={{ gridTemplateColumns: `56px repeat(${courts.length}, 1fr)` }}
          >
            <div></div>
            {courts.map((court, index) => (
              <div
                key={court.id}
                className="bg-white/10 rounded text-center text-white font-semibold text-[13px] border border-white/10 flex items-center justify-center min-h-[32px] min-w-0 truncate px-1"
              >
                {court.courtNumber || index + 1}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {filteredDayReserves.map((turn, index) => {
              // Verificar promo para este horario
              const activePromos = complex.promotions?.filter(p => p.isActive) || [];
              const hasPromoForSchedule = hasPromotionForSchedule(activePromos, new Date(), turn.schedule);

              return (
                <div
                  key={turn.schedule}
                  className="grid gap-2 items-center mb-2"
                  style={{ gridTemplateColumns: `56px repeat(${courts.length}, 1fr)` }}
                >
                  <div className="text-center font-medium text-white flex items-center justify-center bg-black/20 rounded p-1 min-h-[32px] text-[13px] border border-white/5">
                    {turn.schedule.split(" ")[0]}
                  </div>

                  {courts.map((court) => {
                    const isAvailable = turn.court.find((turnCourt) => turnCourt.id === court.id);
                    // Verificar si hay promo específica para esta cancha/horario
                    const courtPromo = hasPromoForSchedule && activePromos.find(p => {
                      if (!p.isActive) return false;
                      // Si la promo tiene filtro de cancha, verificar que coincida
                      if (p.courtId && p.courtId !== court.id) return false;
                      // Si la promo tiene filtro de deporte, verificar
                      if (p.sportTypeId && court.sportTypeId && p.sportTypeId !== court.sportTypeId) return false;
                      return true;
                    });

                    return (
                      <div
                        key={`${turn.schedule}-${court.id}`}
                        className={`rounded flex justify-center items-center gap-1 shadow min-h-[40px] min-w-[52px] text-[15px] truncate border transition-transform duration-200 ${isAvailable
                          ? "bg-green-500/20 border-green-500/30 cursor-pointer hover:bg-green-500/30 hover:scale-105 active:scale-95"
                          : "bg-red-500/20 border-red-500/30 cursor-not-allowed"
                          }`}
                        onClick={() =>
                          isAvailable && handleCellClick(new Date(), turn.schedule, court.id)
                        }
                      >
                        {isAvailable ? (
                          <>
                            <Check className="text-green-400" size={18} strokeWidth={2.5} />
                            {courtPromo && <span className="text-amber-400 text-[10px]">🎁</span>}
                          </>
                        ) : (
                          <X className="text-red-400" size={18} strokeWidth={2.5} />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
        <div className="p-1 border-t border-white/10 bg-black/20">
          <div className="flex justify-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30 flex-shrink-0">
                <Check className="text-green-400" size={8} strokeWidth={3} />
              </div>
              <span className="text-[11px] text-white/80">Disponible</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30 flex-shrink-0">
                <X className="text-red-400" size={8} strokeWidth={3} />
              </div>
              <span className="text-[11px] text-white/80">Ocupado</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop view
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 shadow-lg w-full overflow-hidden backdrop-blur-sm">
      <div className="p-4 bg-white/10 text-white font-bold text-center text-xl shadow-md border-b border-white/10">
        Turnos para hoy
      </div>
      <div className="overflow-x-auto p-4">
        <table className="w-full min-w-[400px] border-collapse">
          <thead>
            <tr>
              <th className="p-4 text-left text-white font-bold border-b border-white/10 bg-black/20 rounded-tl-lg">
                <div className="flex items-center gap-2">
                  <Clock9 size={18} className="text-white/80" />
                  <span>Horarios</span>
                </div>
              </th>
              {courts.map((court, index) => (
                <th
                  key={court.id}
                  className={`p-4 text-center text-white font-bold border-b border-white/10 bg-black/20 ${index === courts.length - 1 ? "rounded-tr-lg" : ""
                    }`}
                >
                  <div className="px-3 py-1 bg-white/10 rounded-full inline-flex items-center justify-center gap-2 border border-white/10">
                    <GiSoccerField size={16} className="text-white" />
                    <span className="hidden sm:inline">Cancha </span>
                    {court.courtNumber || index + 1}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredDayReserves.map((turn, rowIndex) => {
              // Verificar promo para este horario
              const activePromos = complex.promotions?.filter(p => p.isActive) || [];
              const hasPromoForSchedule = hasPromotionForSchedule(activePromos, new Date(), turn.schedule);

              return (
                <tr key={turn.schedule} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium text-white bg-black/20">
                    <div className="flex items-center gap-2">
                      <Clock9 size={18} className="text-white/70" />
                      <span>{turn.schedule.split(" ")[0]}</span>
                    </div>
                  </td>
                  {courts.map((court) => {
                    const isAvailable = turn.court.find((turnCourt) => turnCourt.id === court.id);
                    // Verificar si hay promo específica para esta cancha/horario
                    const courtPromo = hasPromoForSchedule && activePromos.find(p => {
                      if (!p.isActive) return false;
                      if (p.courtId && p.courtId !== court.id) return false;
                      if (p.sportTypeId && court.sportTypeId && p.sportTypeId !== court.sportTypeId) return false;
                      return true;
                    });

                    return (
                      <td
                        key={`${turn.schedule}-${court.id}`}
                        className="p-4 text-center bg-black/10"
                      >
                        <div
                          onClick={() =>
                            isAvailable && handleCellClick(new Date(), turn.schedule, court.id)
                          }
                          className={`rounded-md py-2 px-4 inline-flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all duration-200 border ${isAvailable
                            ? "bg-green-500/20 text-white border-green-500/30 hover:bg-green-500/30 hover:scale-105"
                            : "bg-red-500/20 text-white border-red-500/30 cursor-not-allowed"
                            }`}
                        >
                          {isAvailable ? (
                            <>
                              <Check size={18} className="text-green-400" strokeWidth={2.5} />
                              <span>Disponible</span>
                              {courtPromo && <span className="text-amber-400">🎁</span>}
                            </>
                          ) : (
                            <>
                              <X size={18} className="text-red-400" strokeWidth={2.5} />
                              <span>Ocupado</span>
                            </>
                          )}
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
      {/* {Object.values(sportTypes).some((st) => st.name === "FUTBOL_5") && (
        <div className="flex justify-center items-center gap-2 mb-4">
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="inline text-blue-200 align-middle"
            style={{ marginBottom: "2px" }}
          >
            <path d="M2 10L10 4l8 6v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z" />
            <rect x="7" y="13" width="6" height="3" rx="1" fill="#60a5fa" />
          </svg>
          <span className="text-sm text-blue-100 font-medium">La cancha 1 es techada</span>
        </div>
      )} */}
    </div>
  );
};

export default TableReservesToday;
