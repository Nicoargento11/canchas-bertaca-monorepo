import React, { useEffect, useState } from "react";
import { SkeletonModal } from "@/components/skeletonModal";
import { useReserve } from "@/contexts/newReserveContext";
import { format } from "date-fns";
import { Complex } from "@/services/complex/complex";
import { CheckCircle2, LayoutGrid } from "lucide-react";
import { Icon } from "lucide-react";
import { tennisRacket, soccerBall } from "@lucide/lab";
import { SportType } from "@/services/sport-types/sport-types";

interface AvailableFieldsProps {
  complex: Complex;
  sportType: SportType;
}
const AvailableFields = ({ complex, sportType }: AvailableFieldsProps) => {
  const { state, getCurrentReservation, updateReservationForm, fetchAvailability, goToNextStep } =
    useReserve();

  const currentReservation = getCurrentReservation();
  const fields = currentReservation?.availability.byHour?.court || [];
  // const formatedDay = format(reserveForm.day, "yyyy-MM-dd");

  useEffect(() => {
    if (currentReservation?.form.day && currentReservation?.form.hour) {
      fetchAvailability(
        "hour",
        format(currentReservation.form.day, "yyyy-MM-dd"),
        currentReservation.form.hour
      );
    }
  }, [currentReservation?.form.day, currentReservation?.form.hour]);

  if (currentReservation?.loading || !currentReservation) {
    return <SkeletonModal />;
  }

  const getSportIcon = () => {
    switch (sportType.name) {
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

  const handleFieldSelect = (fieldId: string) => {
    updateReservationForm("field", fieldId);
    goToNextStep();
  };
  return (
    <div className="p-6 bg-Neutral-light/20 rounded-xl shadow-lg border border-Neutral-light relative overflow-visible">
      <h2 className="text-center font-bold text-2xl text-Primary mb-6">
        Canchas disponibles - {sportType.name.toUpperCase()}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 relative">
        <div className="space-y-3 relative">
          {fields.length <= 0 ? (
            <div>
              <CheckCircle2 className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-lg font-medium text-gray-900">No hay canchas disponibles</p>
              <p className="mt-1 text-gray-500">
                Todos los campos están ocupados para este horario
              </p>
            </div>
          ) : (
            fields.map((field) => (
              <div
                key={field.id}
                onClick={() => handleFieldSelect(field.id)}
                className={`${
                  currentReservation.form.field === field.id
                    ? "ring-2 ring-Primary bg-Primary/5"
                    : "hover:bg-gray-50"
                } p-3 rounded-lg border border-gray-100 bg-white transition-all cursor-pointer shadow-xs`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-50 text-blue-500">{getSportIcon()}</div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {field.name || `Cancha ${field.courtNumber}`}
                    </h3>
                    {/* {field.type && (
                      <p className="text-sm text-gray-500">{field.type}</p>
                    )} */}
                  </div>

                  {currentReservation.form.field === field.id && (
                    <div className="w-2 h-2 rounded-full bg-Primary ml-2" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Imagen que se muestra siempre */}
        <div className="overflow-hidden rounded-xl">
          <img
            src="/background/Crokis.png"
            alt="Cancha"
            className="w-70 h-70 object-fit rounded-xl"
          />
        </div>
      </div>
    </div>
  );
};

export default AvailableFields;
