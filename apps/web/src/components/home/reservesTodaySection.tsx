import { TurnByDay } from "@/services/reserves/reserves";
import TableReservesToday from "../TableReservesToday";

interface ReservesTodaySectionProps {
  reservesDay: TurnByDay | null;
}

export const ReservesTodaySection = ({
  reservesDay,
}: ReservesTodaySectionProps) => {
  return (
    <section
      className="py-8 sm:py-16 bg-gradient-to-b from-gray-900 to-gray-950  px-4"
      id="TurnosHoy"
    >
      <div className="mx-auto text-center max-w-7xl">
        <h2 className="text-3xl sm:text-4xl font-semibold bg-gradient-to-r from-Accent-1 to-Complementary bg-clip-text text-transparent pb-6">
          Turnos para hoy
        </h2>
        <div className="px-0 sm:px-4">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 shadow-lg">
            <TableReservesToday dayReserves={reservesDay} />
          </div>
        </div>
      </div>
    </section>
  );
};
