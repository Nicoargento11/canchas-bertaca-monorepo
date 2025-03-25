import React, { useEffect, useState } from "react";
import { SkeletonModal } from "@/components/skeletonModal";
import { useReserve } from "@/contexts/reserveContext";
import { format } from "date-fns";

const AvailableFields = () => {
  const { reserveForm, handleReserveForm } = useReserve();
  const { availableReservesByHour, getAvailableReservesByHour } = useReserve();
  const [isLoading, setLoading] = useState(true);

  const formatedDay = format(reserveForm.day, "yyyy-MM-dd");

  useEffect(() => {
    getAvailableReservesByHour(formatedDay, reserveForm.hour);
    setLoading(false);
  }, []);

  return (
    <div className="p-4 bg-Neutral-light rounded-lg shadow-md">
      <p className="text-center font-bold text-2xl text-Primary mb-4">
        Canchas disponibles
      </p>
      {isLoading ? (
        <SkeletonModal />
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Lista de canchas disponibles */}
          <div className="flex flex-col gap-3 w-full lg:w-1/2">
            {availableReservesByHour?.court.map((field, index) => (
              <div
                key={index}
                onClick={() => handleReserveForm("field", field)}
                className={`${
                  reserveForm.field === field
                    ? "bg-Primary text-white shadow-lg"
                    : "bg-white text-Primary hover:bg-Primary-light hover:text-white"
                } border-2 border-Primary rounded-xl p-4 text-center cursor-pointer font-bold transition-all duration-200 ease-in-out transform hover:scale-105`}
              >
                Cancha {field}
              </div>
            ))}
          </div>

          {/* Mapa de la cancha */}
          <div className="w-full lg:w-1/2 flex justify-center items-center">
            <div className="relative w-full h-64 lg:h-96 rounded-xl overflow-hidden shadow-lg">
              {/* Indicadores de canchas en el mapa */}
              {availableReservesByHour?.court.map((field, index) => (
                <div
                  key={index}
                  className={`absolute ${
                    // Posiciones de las canchas en el mapa (ajusta según tu imagen)
                    field === 1
                      ? "top-10 left-10"
                      : field === 2
                        ? "top-10 right-10"
                        : field === 3
                          ? "bottom-10 left-10"
                          : "bottom-10 right-10"
                  } w-8 h-8 bg-Accent-1 rounded-full flex items-center justify-center text-white font-bold text-sm cursor-pointer transform hover:scale-110 transition duration-200`}
                >
                  {field}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailableFields;
