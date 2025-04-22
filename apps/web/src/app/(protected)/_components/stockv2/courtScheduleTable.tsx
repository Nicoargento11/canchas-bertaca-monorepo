import { Clock } from "lucide-react";
import { GiSoccerField, GiSoccerKick } from "react-icons/gi";
import CourtCell from "./courtCell";
import { Button } from "@/components/ui/button";
import { Reserve, ReservesByDay } from "@/services/reserves/reserves";
import { Court } from "@/services/courts/courts";

interface CourtScheduleTableProps {
  paymentsByDay: ReservesByDay;
  onOpenModal: (
    reserve: Reserve,
    courtData?: { court: number; schedule: string }
  ) => void;
  court: Court;
}

export default function CourtScheduleTable({
  paymentsByDay,
  onOpenModal,
  court,
}: CourtScheduleTableProps) {
  console.log(paymentsByDay);
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-x-auto">
      <table className="w-full text-left table-auto">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="sticky left-0 z-20 bg-gray-50 p-4 min-w-[120px]">
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-700">Horario</span>
              </div>
            </th>
            {Array.from({ length: court.numberCourts }).map((_, index) => (
              <th
                key={`court-${index + 1}`}
                className="bg-gray-50 p-4 text-center min-w-[180px]"
              >
                <div className="flex flex-col items-center gap-1">
                  <GiSoccerField className="h-6 w-6 text-green-600" />
                  <span className="font-medium text-gray-700">
                    Cancha {index + 1}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paymentsByDay.map((scheduleReserve) => (
            <tr
              key={scheduleReserve.schedule}
              className="border-b border-gray-100"
            >
              <td className="sticky left-0 z-10 bg-gray-50 p-4 text-center font-medium whitespace-nowrap text-gray-700">
                {scheduleReserve.schedule}
              </td>
              {Array.from({ length: court.numberCourts }).map(
                (_, courtIndex) => {
                  const courtNumber = courtIndex + 1;
                  const reservation = scheduleReserve.court.find(
                    (courtData) => courtData.court === courtNumber
                  );

                  return (
                    <CourtCell
                      key={`${scheduleReserve.schedule}-${courtNumber}`}
                      reserve={reservation || null}
                      courtIndex={courtIndex}
                      schedule={scheduleReserve.schedule}
                      onOpenModal={onOpenModal}
                    />
                  );
                }
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {paymentsByDay.length === 0 && (
        <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-3">
          <GiSoccerKick className="h-10 w-10 text-gray-300" />
          <p>No hay horarios cargados para esta fecha</p>
          <Button variant="outline" className="mt-2" onClick={() => {}}>
            Crear nueva reserva
          </Button>
        </div>
      )}
    </div>
  );
}
