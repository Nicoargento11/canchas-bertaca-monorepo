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
import { Promotion, formatPromotionValue } from "@/services/promotion/promotion";

interface AvailableFieldsProps {
  complex: Complex;
  sportTypes: Partial<Record<SportTypeKey, SportType>>;
  targetStep?: number;
  complexName?: string; // 'bertaca' | 'seven' - para identificar el tipo de reserva
  promotions?: Promotion[];
}

const AvailableFields = ({ complex, sportTypes, targetStep = 2, complexName, promotions }: AvailableFieldsProps) => {
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
      complexName, // Pasar complexName para localStorage
    });

    // updateReservationForm("field", field.id); // Ya incluido en preloadReservation
    // goToNextStep(); // Eliminado porque preloadReservation ya establece el step correcto
  };

  return (
    <div className="p-6 bg-white/5 rounded-xl shadow-lg border border-white/10 relative overflow-visible">
      <h2 className="text-center font-bold text-2xl text-white mb-6">Canchas disponibles</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 relative">
        <div className="space-y-3 relative max-h-[400px] overflow-y-auto overflow-x-hidden pr-2 w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {allFields.length <= 0 ? (
            <div>
              <CheckCircle2 className="mx-auto h-12 w-12 text-white/40" />
              <p className="mt-2 text-lg font-medium text-white">No hay canchas disponibles</p>
              <p className="mt-1 text-white/70">
                Todos los campos están ocupados para este horario
              </p>
            </div>
          ) : (
            allFields.map((field) => {
              // Calcular promo para esta cancha
              const fieldPromo = promotions?.find(p => {
                if (!p.isActive) return false;

                // Verificar que la promo tenga al menos una restricción de reserva
                // Si no tiene ninguna, es una promo genérica/de productos
                const hasReservationRestrictions =
                  p.courtId ||
                  p.sportTypeId ||
                  p.startTime ||
                  p.endTime ||
                  (p.daysOfWeek && p.daysOfWeek.length > 0 && p.daysOfWeek.length < 7);
                if (!hasReservationRestrictions) return false;

                if (p.courtId && p.courtId !== field.id) return false;
                if (p.sportTypeId && p.sportTypeId !== field.sportTypeId) return false;
                if (p.daysOfWeek && p.daysOfWeek.length > 0) {
                  const dayOfWeek = currentReservation?.form.day?.getDay();
                  if (dayOfWeek !== undefined && !p.daysOfWeek.includes(dayOfWeek)) return false;
                }
                if (p.startTime || p.endTime) {
                  const scheduleStart = currentReservation?.form.hour?.split(' - ')[0];
                  if (scheduleStart) {
                    if (p.startTime && scheduleStart < p.startTime) return false;
                    if (p.endTime && scheduleStart >= p.endTime) return false;
                  }
                }
                return true;
              });

              const isSelected = currentReservation?.form.field === field.id;
              const isFutbol7 = field.sportTypeKey === "FUTBOL_7";
              const isFutbol5 = field.sportTypeKey === "FUTBOL_5";

              // Colores según deporte
              const sportConfig = {
                FUTBOL_7: {
                  bg: "from-emerald-600/20 to-emerald-800/20",
                  border: "border-emerald-500/50",
                  badge: "bg-emerald-500 text-white",
                  icon: "bg-emerald-500/30 text-emerald-400"
                },
                FUTBOL_5: {
                  bg: "from-blue-600/20 to-blue-800/20",
                  border: "border-blue-500/50",
                  badge: "bg-blue-500 text-white",
                  icon: "bg-blue-500/30 text-blue-400"
                },
                TENIS: {
                  bg: "from-yellow-600/20 to-yellow-800/20",
                  border: "border-yellow-500/50",
                  badge: "bg-yellow-500 text-black",
                  icon: "bg-yellow-500/30 text-yellow-400"
                },
                default: {
                  bg: "from-white/10 to-white/5",
                  border: "border-white/20",
                  badge: "bg-white/20 text-white/80",
                  icon: "bg-Primary/20 text-Primary"
                }
              };

              const config = sportConfig[field.sportTypeKey as keyof typeof sportConfig] || sportConfig.default;

              return (
                <div
                  key={`${field.id}-${field.sportTypeKey}`}
                  onClick={() => handleFieldSelect(field)}
                  className={`
                    relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 ease-out
                    ${isSelected
                      ? `ring-2 ring-Primary bg-gradient-to-br ${config.bg} shadow-xl shadow-Primary/30 scale-[1.02]`
                      : `bg-gradient-to-br ${config.bg} border ${config.border} hover:scale-[1.02] hover:shadow-lg hover:shadow-white/10`
                    }
                  `}
                >
                  {/* Indicador de selección */}
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <div className="w-5 h-5 rounded-full bg-Primary flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Icono del deporte */}
                      <div className={`p-3 rounded-xl ${config.icon} shadow-inner`}>
                        {getSportIcon(field.sportTypeKey)}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Nombre de la cancha */}
                        <h3 className="font-bold text-lg text-white mb-1">
                          {field.name || `Cancha ${field.courtNumber}`}
                        </h3>

                        {/* Badge del deporte */}
                        <span className={`
                          inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                          ${config.badge}
                          ${isFutbol7 ? 'text-sm' : ''}
                        `}>
                          {field.sportTypeKey.replace("_", " ")}
                        </span>

                        {/* Promo */}
                        {fieldPromo && (
                          <div className="mt-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-xs font-medium text-amber-400">
                              🎁 {fieldPromo.name}: {formatPromotionValue(fieldPromo)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
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
