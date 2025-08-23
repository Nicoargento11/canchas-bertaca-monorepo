"use client";
import { Check, X, Clock9 } from "lucide-react";
import { GiSoccerField } from "@react-icons/all-files/gi/GiSoccerField";
import { Court } from "@/services/court/court";
import { Complex } from "@/services/complex/complex";
import { SportType } from "@/services/sport-types/sport-types";
import { TurnByDay } from "@/services/reserve/reserve";
import { useModal } from "@/contexts/modalContext";
import { useEffect, useMemo, useState } from "react";
import { useReserve } from "@/contexts/newReserveContext";
import { createAdjustedDateTime } from "@/utils/timeValidation";
import { isAfter } from "date-fns";
import { motion } from "framer-motion";

const tableHead = ["Cancha 1", "Cancha 2", "Cancha 3", "Cancha 4"];
const courts = [1, 2, 3, 4];

interface TableReservesTodayProps {
  dayReserves: TurnByDay | undefined;
  courts: Court[];
  complex: Complex;
  sportType: SportType;
}

const TableReservesToday: React.FC<TableReservesTodayProps> = ({
  dayReserves,
  courts,
  complex,
  sportType,
}) => {
  const { preloadReservation, getCurrentReservation } = useReserve();
  const { openModal } = useModal();
  const [isMobile, setIsMobile] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date()); // Filtrar horarios pasados solo para el día actual
  const filteredDayReserves = useMemo(() => {
    if (!dayReserves) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isToday = new Date().toDateString() === today.toDateString();

    if (!isToday) return dayReserves;

    return dayReserves.filter((turn) => {
      const [startTime] = turn.schedule.split(" - ");
      const adjustedDate = createAdjustedDateTime(today, startTime);
      return isAfter(adjustedDate, currentTime);
    });
  }, [dayReserves, currentTime]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleCellClick = (date: Date, hour: string, field: string) => {
    date.setHours(0, 0, 0, 0); // Aseguramos que la fecha sea solo el día sin hora
    preloadReservation({
      complexId: complex.id,
      sportType: sportType.name,
      sportTypeId: sportType.id,
      day: date,
      hour,
      field,
      initialStep: 3,
    });
    openModal("RESERVE_FUTBOL", { complexId: complex.id, sportType: sportType.name });
  };

  if (!filteredDayReserves || filteredDayReserves.length === 0) {
    return (
      <div className="bg-gradient-to-br from-Primary-dark/30 to-black/50 rounded-xl p-8 border border-Primary/30 shadow-lg text-center">
        <div className="bg-black/30 p-6 rounded-full inline-block mb-4 border border-Primary/30 shadow-md">
          <Clock9 size={48} className="text-white" />
        </div>
        <p className="text-white font-medium text-lg">
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
      <div className="bg-gradient-to-br from-Primary-dark/30 to-black/50 rounded-xl border border-Primary/30 shadow-lg w-full max-w-[98vw] mx-auto overflow-hidden">
        <div className="p-3 bg-gradient-to-br from-Primary to-Primary-dark text-white font-bold text-center text-lg shadow-md">
          Turnos para hoy
        </div>
        <div className="p-2">
          <div
            className="grid gap-1 mb-2 bg-black/30 rounded-lg p-2 shadow-md border border-Primary/20"
            style={{ gridTemplateColumns: `56px repeat(${courts.length}, 1fr)` }}
          >
            <div></div>
            {courts.map((court, index) => (
              <div
                key={court.id}
                className="bg-gradient-to-br from-Primary/70 to-Primary-dark/80 rounded text-center text-white font-semibold text-[13px] border border-Primary/50 flex items-center justify-center min-h-[32px] min-w-0 truncate px-1"
              >
                {court.courtNumber || index + 1}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {filteredDayReserves.map((turn, index) => (
              <motion.div
                key={turn.schedule}
                className="grid gap-2 items-center mb-2"
                style={{ gridTemplateColumns: `56px repeat(${courts.length}, 1fr)` }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="text-center font-medium text-white flex items-center justify-center bg-black/30 rounded p-1 min-h-[32px] text-[13px] border border-Primary/20">
                  {turn.schedule.split(" ")[0]}
                </div>

                {courts.map((court) => {
                  const isAvailable = turn.court.find((turnCourt) => turnCourt.id === court.id);
                  return (
                    <motion.div
                      key={`${turn.schedule}-${court.id}`}
                      className={`rounded flex justify-center items-center shadow min-h-[40px] min-w-[52px] text-[15px] truncate border ${
                        isAvailable
                          ? "bg-green-500/20 border-green-500/30 cursor-pointer hover:bg-green-500/30"
                          : "bg-red-500/20 border-red-500/30 cursor-not-allowed"
                      }`}
                      onClick={() =>
                        isAvailable && handleCellClick(new Date(), turn.schedule, court.id)
                      }
                      whileHover={isAvailable ? { scale: 1.05 } : {}}
                      whileTap={isAvailable ? { scale: 0.95 } : {}}
                    >
                      {isAvailable ? (
                        <Check className="text-green-400" size={18} strokeWidth={2.5} />
                      ) : (
                        <X className="text-red-400" size={18} strokeWidth={2.5} />
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            ))}
          </div>
        </div>
        <div className="p-1 border-t border-Primary/20 bg-black/30">
          <div className="flex justify-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30 flex-shrink-0">
                <Check className="text-green-400" size={8} strokeWidth={3} />
              </div>
              <span className="text-[11px] text-white">Disponible</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30 flex-shrink-0">
                <X className="text-red-400" size={8} strokeWidth={3} />
              </div>
              <span className="text-[11px] text-white">Ocupado</span>
            </div>
          </div>
          {/* {sportType?.name === "FUTBOL_5" && (
            <div className="flex justify-center items-center gap-1 mt-1">
              <svg
                width="12"
                height="12"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="inline text-blue-200 align-middle"
                style={{ marginBottom: "1px" }}
              >
                <path d="M2 10L10 4l8 6v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z" />
                <rect x="7" y="13" width="6" height="3" rx="1" fill="#60a5fa" />
              </svg>
              <span className="text-[11px] text-blue-100 font-medium">La cancha 1 es techada</span>
            </div>
          )} */}
        </div>
      </div>
    );
  }

  // Desktop view
  return (
    <div className="bg-gradient-to-br from-Primary-dark/30 to-black/50 rounded-xl border border-Primary/30 shadow-lg w-full overflow-hidden">
      <div className="p-4 bg-gradient-to-br from-Primary to-Primary-dark text-white font-bold text-center text-xl shadow-md">
        Turnos para hoy
      </div>
      <div className="overflow-x-auto p-4">
        <table className="w-full min-w-[400px] border-collapse">
          <thead>
            <tr>
              <th className="p-4 text-left text-white font-bold border-b border-Primary/30 bg-black/30 rounded-tl-lg">
                <div className="flex items-center gap-2">
                  <Clock9 size={18} className="text-white" />
                  <span>Horarios</span>
                </div>
              </th>
              {courts.map((court, index) => (
                <th
                  key={court.id}
                  className={`p-4 text-center text-white font-bold border-b border-Primary/30 bg-black/30 ${
                    index === courts.length - 1 ? "rounded-tr-lg" : ""
                  }`}
                >
                  <div className="px-3 py-1 bg-gradient-to-br from-Primary/70 to-Primary-dark/80 rounded-full inline-flex items-center justify-center gap-2 border border-Primary/50">
                    <GiSoccerField size={16} className="text-white" />
                    <span className="hidden sm:inline">Cancha </span>
                    {court.courtNumber || index + 1}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-Primary/20">
            {filteredDayReserves.map((turn, rowIndex) => (
              <motion.tr
                key={turn.schedule}
                className="hover:bg-black/20 transition-colors"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: rowIndex * 0.05 }}
              >
                <td className="p-4 font-medium text-white bg-black/30">
                  <div className="flex items-center gap-2">
                    <Clock9 size={18} className="text-white" />
                    <span>{turn.schedule.split(" ")[0]}</span>
                  </div>
                </td>
                {courts.map((court) => {
                  const isAvailable = turn.court.find((turnCourt) => turnCourt.id === court.id);
                  return (
                    <td
                      key={`${turn.schedule}-${court.id}`}
                      className="p-4 text-center bg-black/20"
                    >
                      <motion.div
                        onClick={() =>
                          isAvailable && handleCellClick(new Date(), turn.schedule, court.id)
                        }
                        className={`rounded-md py-2 px-4 inline-flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all duration-200 border ${
                          isAvailable
                            ? "bg-green-500/20 text-white border-green-500/30 hover:bg-green-500/30"
                            : "bg-red-500/20 text-white border-red-500/30 cursor-not-allowed"
                        }`}
                        whileHover={isAvailable ? { scale: 1.05 } : {}}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        {isAvailable ? (
                          <>
                            <Check size={18} className="text-green-400" strokeWidth={2.5} />
                            <span>Disponible</span>
                          </>
                        ) : (
                          <>
                            <X size={18} className="text-red-400" strokeWidth={2.5} />
                            <span>Ocupado</span>
                          </>
                        )}
                      </motion.div>
                    </td>
                  );
                })}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* {sportType?.name === "FUTBOL_5" && (
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
