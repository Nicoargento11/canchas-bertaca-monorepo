"use client";
import { Check, X, Clock9 } from "lucide-react";
import { GiSoccerField } from "@react-icons/all-files/gi/GiSoccerField";
import { TurnByDay } from "@/services/reserves/reserves";

const tableHead = ["Cancha 1", "Cancha 2", "Cancha 3", "Cancha 4"];
const courts = [1, 2, 3, 4];

interface TableReservesTodayProps {
  dayReserves: TurnByDay | null;
}

const TableReservesToday: React.FC<TableReservesTodayProps> = ({
  dayReserves,
}) => {
  return (
    <div className="bg-gradient-to-br from-Primary-dark/30 to-black/50 rounded-xl p-3 border border-Primary/30 shadow-lg w-full">
      {/* Tabla responsive */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[300px]">
          <thead>
            <tr className="text-white">
              {/* Columna de horarios */}
              <th className="sticky top-0 bg-gradient-to-br from-Primary to-Primary-dark p-2 sm:p-3 z-10 rounded-tl-lg min-w-[60px]">
                <div className="flex flex-col items-center justify-center">
                  <Clock9 size={20} className="mb-1" />
                  <span className="text-xs font-medium sm:text-sm">Hora</span>
                </div>
              </th>

              {/* Columnas de canchas */}
              {tableHead.map((head) => (
                <th
                  key={head}
                  className="sticky top-0 bg-gradient-to-br from-Primary to-Primary-dark p-2 sm:p-3 z-10 text-center min-w-[70px]"
                >
                  <div className="flex flex-col items-center justify-center">
                    <GiSoccerField size={20} className="mb-1" />
                    <span className="text-xs font-medium sm:text-sm">
                      {head.split(" ")[0]}{" "}
                      {/* Muestra "Cancha" en desktop y "C1", "C2" en móvil */}
                      <span className="hidden sm:inline">
                        {" "}
                        {head.split(" ")[1]}
                      </span>
                      <span className="sm:hidden">
                        {head.split(" ")[1].charAt(0)}
                      </span>
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dayReserves?.map((turn) => (
              <tr
                key={turn.schedule}
                className="border-b border-Primary/20 last:border-b-0"
              >
                <td className="p-2 font-medium text-gray-200 text-center text-sm">
                  {turn.schedule.split(" ")[0]} {/* Solo muestra la hora */}
                </td>
                {courts.map((court) => {
                  const isAvailable = turn.court.includes(court);
                  return (
                    <td key={court} className="p-2">
                      <div
                        className={`rounded-lg p-2 flex items-center justify-center h-full ${
                          isAvailable
                            ? "bg-green-500/20 border border-green-500/30"
                            : "bg-red-500/20 border border-red-500/30"
                        }`}
                      >
                        {isAvailable ? (
                          <Check
                            className="text-green-400"
                            size={20}
                            strokeWidth={2.5}
                          />
                        ) : (
                          <X
                            className="text-red-400"
                            size={20}
                            strokeWidth={2.5}
                          />
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableReservesToday;
