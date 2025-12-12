import React, { useEffect, useState } from "react";
import { SkeletonModal } from "@/components/skeletonModal";
import { useReserve } from "@/contexts/newReserveContext";
import { format } from "date-fns";
import { Complex } from "@/services/complex/complex";
import { CheckCircle2, LayoutGrid } from "lucide-react";
import { Icon } from "lucide-react";
import { tennisRacket, soccerBall } from "@lucide/lab";
import { SportType, SportTypeKey } from "@/services/sport-types/sport-types";
import priceCalculator from "@/utils/priceCalculator";

interface AvailableFieldsProps {
  complex: Complex;
  sportTypes: Partial<Record<SportTypeKey, SportType>>;
  targetStep?: number;
}

const AvailableFields = ({ complex, sportTypes, targetStep = 2 }: AvailableFieldsProps) => {
  const {
    state,
    getCurrentReservation,
    updateReservationForm,
    fetchAvailability,
    goToNextStep,
    preloadReservation,
  } = useReserve();

  const currentReservation = getCurrentReservation();
  const [loading, setLoading] = useState(true);

  // Obtener todas las canchas de todos los deportes
  const allFields = React.useMemo(() => {
    const fields: Array<{
      id: string;
      name: string;
      courtNumber?: number | null;
      sportTypeKey: SportTypeKey;
      sportTypeId: string;
    }> = [];

    const day = currentReservation?.form.day;
    const hour = currentReservation?.form.hour;

    if (!day || !hour) return [];

    Object.entries(sportTypes).forEach(([key, sport]) => {
      if (!sport) return;
      const reservationData = state.reservations[complex.id]?.[key];
      const courts = reservationData?.availability?.byHour?.court || [];

      courts.forEach((court) => {
        // Verificar si la cancha tiene horarios/precio configurados para este momento
        const pricing = priceCalculator(day, hour, complex.schedules || [], court.id);

        if (pricing) {
          fields.push({
            ...court,
            sportTypeKey: key as SportTypeKey,
            sportTypeId: sport.id,
          });
        }
      });
    });

    return fields;
  }, [
    state.reservations,
    complex.id,
    sportTypes,
    currentReservation?.form.day,
    currentReservation?.form.hour,
    complex.schedules,
  ]);

  useEffect(() => {
    const fetchAll = async () => {
      if (currentReservation?.form.day && currentReservation?.form.hour) {
        setLoading(true);
        const date = format(currentReservation.form.day, "yyyy-MM-dd");
        const hour = currentReservation.form.hour;

        const promises = Object.entries(sportTypes).map(([key, sport]) => {
          if (!sport) return Promise.resolve();
          return fetchAvailability("hour", date, hour, {
            complexId: complex.id,
            sportTypeId: sport.id,
            sportType: key as SportTypeKey,
          });
        });

        await Promise.all(promises);
        setLoading(false);
      }
    };

    fetchAll();
  }, [currentReservation?.form.day, currentReservation?.form.hour, complex.id, sportTypes]);

  if (loading) {
    return <SkeletonModal />;
  }

  const getSportIcon = (sportName: string) => {
    switch (sportName) {
      case "FUTBOL_5":
      case "FUTBOL_7":
      case "FUTBOL_11":
        return <Icon iconNode={soccerBall} size={20} />;
      case "TENIS":
        return <Icon iconNode={tennisRacket} size={20} />;
      default:
        return <LayoutGrid size={20} />;
    }
  };

  const handleFieldSelect = (field: (typeof allFields)[0]) => {
    // Actualizar el contexto con el deporte correcto de la cancha seleccionada
    preloadReservation({
      complexId: complex.id,
      sportType: field.sportTypeKey,
      sportTypeId: field.sportTypeId,
      day: currentReservation!.form.day,
      hour: currentReservation!.form.hour,
      field: field.id,
      initialStep: targetStep, // Ir al paso de confirmación (o el que corresponda)
    });

    // updateReservationForm("field", field.id); // Ya incluido en preloadReservation
    // goToNextStep(); // Eliminado porque preloadReservation ya establece el step correcto
  };

  return (
    <div className="p-6 bg-white/5 rounded-xl shadow-lg border border-white/10 relative overflow-visible">
      <h2 className="text-center font-bold text-2xl text-white mb-6">Canchas disponibles</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 relative">
        <div className="space-y-3 relative max-h-[400px] overflow-y-auto overflow-x-hidden pr-2 w-full scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {allFields.length <= 0 ? (
            <div>
              <CheckCircle2 className="mx-auto h-12 w-12 text-white/40" />
              <p className="mt-2 text-lg font-medium text-white">No hay canchas disponibles</p>
              <p className="mt-1 text-white/70">
                Todos los campos están ocupados para este horario
              </p>
            </div>
          ) : (
            allFields.map((field) => (
              <div
                key={`${field.id}-${field.sportTypeKey}`}
                onClick={() => handleFieldSelect(field)}
                className={`${
                  currentReservation?.form.field === field.id
                    ? "ring-2 ring-Primary bg-Primary/20 scale-105"
                    : "hover:bg-white/10"
                } p-3 rounded-lg border border-white/20 bg-white/5 transition-all cursor-pointer shadow-xs`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-Primary/20 text-Primary">
                    {getSportIcon(field.sportTypeKey)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white truncate">
                        {field.name || `Cancha ${field.courtNumber}`}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60 border border-white/10">
                        {field.sportTypeKey.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  {currentReservation?.form.field === field.id && (
                    <div className="w-2 h-2 rounded-full bg-Primary ml-2" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Imagen que se muestra siempre */}
        <div className="overflow-hidden rounded-xl hidden lg:block">
          <img
            src="/background/Crokis.png"
            alt="Cancha"
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
      </div>
    </div>
  );
};

export default AvailableFields;
