"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Building2, CheckCircle2 } from "lucide-react";
import { SportType, SportTypeKey } from "@/services/sport-types/sport-types";
import { Complex } from "@/services/complex/complex";
import { useReserve } from "@/contexts/newReserveContext";
import { getDailyAvailability } from "@/services/reserve/reserve";
import { format } from "date-fns";
import { SessionPayload } from "@/services/auth/session";

// Import reserve components
import DateTimePicker from "../reserve/date-time-picker";
import AvailableFields from "../reserve/available-fields";
import ReserveTurn from "../reserve/reserve-turn";

interface BookingModalProps {
  onClose: () => void;
  complex: Complex;
  sportTypes: Partial<Record<SportTypeKey, SportType>>;
  sevenComplex?: Complex;
  sevenSportTypes?: Partial<Record<SportTypeKey, SportType>>;
  preSelectedComplex: "bertaca" | "seven" | null;
  currentUser: SessionPayload | null;
}

const BookingModal = ({
  onClose,
  complex,
  sportTypes,
  sevenComplex,
  sevenSportTypes,
  preSelectedComplex,
  currentUser,
}: BookingModalProps) => {
  const {
    state,
    getCurrentReservation,
    goToNextStep,
    goToPreviousStep,
    hasAvailableTurns,
    initReservation,
    resetReservation,
    fetchAvailability,
    preloadReservation,
  } = useReserve();

  const [selectedComplex, setSelectedComplex] = useState<"bertaca" | "seven" | null>(
    preSelectedComplex
  );

  const currentReservation = getCurrentReservation();
  const currentStep = state.currentReservation.step;

  const [generalAvailability, setGeneralAvailability] = useState<any[] | null>(null);
  const [loadingGeneral, setLoadingGeneral] = useState(false);

  // Complex data
  const complexData = {
    bertaca: {
      name: "Bertaca",
      subtitle: "Sede Principal",
      color: "from-blue-600 to-blue-800",
      borderColor: "border-blue-400",
      iconBg: "bg-blue-500",
      supportedSports: Object.keys(sportTypes) as SportTypeKey[],
      features: ["Fútbol 5", "Piso sintético profesional", "Cancha techada"],
    },
    seven: {
      name: "Seven",
      subtitle: "Sede Nueva",
      color: "from-green-600 to-green-800",
      borderColor: "border-green-400",
      iconBg: "bg-green-500",
      supportedSports: sevenSportTypes
        ? (Object.keys(sevenSportTypes) as SportTypeKey[])
        : ([] as SportTypeKey[]),
      features: ["Fútbol 7", "Cancha al aire libre", "Espacio más amplio"],
    },
  };

  // Initialize sport type based on preSelectedComplex
  React.useEffect(() => {
    if (preSelectedComplex) {
      const supported = complexData[preSelectedComplex].supportedSports;
      const currentKey = state.currentReservation.sportType as SportTypeKey;

      // Determine which sportTypes collection to use
      const targetSportTypes =
        preSelectedComplex === "seven" && sevenSportTypes ? sevenSportTypes : sportTypes;

      // If current sport is not supported, switch to the first supported one
      // OR if there is no current sport (because we reset it in MainSection)
      if (!currentKey || !supported.includes(currentKey)) {
        const targetSportKey = supported[0];
        const targetSport = targetSportTypes[targetSportKey];

        // Only init if the sport type actually exists in the system
        if (targetSport) {
          // Only reset if we are actually changing something to avoid loops
          if (state.currentReservation.sportTypeId !== targetSport.id) {
            resetReservation();

            const targetComplexId =
              preSelectedComplex === "seven" && sevenComplex ? sevenComplex.id : complex.id;

            initReservation(targetComplexId, targetSportKey, targetSport.id);
          }
        } else {
          // If the target sport doesn't exist (e.g. FUTBOL_7 missing),
          // ensure we don't have a lingering reservation
          if (state.currentReservation.sportTypeId) {
            resetReservation();
          }
        }
      }
    }
  }, [
    preSelectedComplex,
    complex.id,
    sevenComplex,
    sportTypes,
    sevenSportTypes,
    state.currentReservation.sportType,
    state.currentReservation.sportTypeId,
  ]);

  // Fetch general availability
  React.useEffect(() => {
    const fetchGeneral = async () => {
      if (currentStep === 0 && currentReservation?.form.day) {
        setLoadingGeneral(true);
        const dateStr = format(currentReservation.form.day, "yyyy-MM-dd");

        try {
          const promises: Promise<{ key: string; data: any; sportId: string }>[] = [];

          // 1. Fetch Bertaca (All sports)
          // Only if preSelected is null or 'bertaca'
          if (!preSelectedComplex || preSelectedComplex === "bertaca") {
            Object.values(sportTypes).forEach((sport) => {
              if (sport) {
                promises.push(
                  getDailyAvailability(dateStr, complex.id, sport.id).then((res) => ({
                    key: "bertaca",
                    data: res.data,
                    sportId: sport.id,
                  }))
                );
              }
            });
          }

          // 2. Fetch Seven (All sports)
          // Only if preSelected is null or 'seven'
          if (!preSelectedComplex || preSelectedComplex === "seven") {
            const targetSevenComplex = sevenComplex || complex;
            const targetSevenSportTypes = sevenSportTypes || {};

            Object.values(targetSevenSportTypes).forEach((sport) => {
              if (sport) {
                promises.push(
                  getDailyAvailability(dateStr, targetSevenComplex.id, sport.id).then((res) => ({
                    key: "seven",
                    data: res.data,
                    sportId: sport.id,
                  }))
                );
              }
            });
          }

          const results = await Promise.all(promises);

          const schedules = new Set();
          const merged: any[] = [];

          const process = (data: any[], type: string, sportId: string) => {
            if (data) {
              data.forEach((item) => {
                if (!schedules.has(item.schedule)) {
                  schedules.add(item.schedule);
                  merged.push({
                    ...item,
                    _source: [type],
                    _sportIds: { [type]: [sportId] },
                  });
                } else {
                  const existing = merged.find((m) => m.schedule === item.schedule);
                  if (existing) {
                    if (!existing._source.includes(type)) existing._source.push(type);
                    if (!existing._sportIds) existing._sportIds = {};
                    if (!existing._sportIds[type]) existing._sportIds[type] = [];
                    if (!existing._sportIds[type].includes(sportId))
                      existing._sportIds[type].push(sportId);

                    // Merge courts arrays to show correct count
                    if (item.court && Array.isArray(item.court)) {
                      if (!existing.court) existing.court = [];
                      item.court.forEach((newCourt: any) => {
                        if (!existing.court.some((c: any) => c.id === newCourt.id)) {
                          existing.court.push(newCourt);
                        }
                      });
                    }
                  }
                }
              });
            }
          };

          results.forEach((result) => {
            process(result.data || [], result.key, result.sportId);
          });

          merged.sort((a, b) => a.schedule.localeCompare(b.schedule));

          setGeneralAvailability(merged);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingGeneral(false);
        }
      } else if (!currentReservation?.form.day) {
        setGeneralAvailability(null);
      }
    };

    fetchGeneral();
  }, [
    currentReservation?.form.day,
    preSelectedComplex,
    currentStep,
    complex.id,
    sportTypes,
    sevenComplex,
    sevenSportTypes,
  ]);

  if (!currentReservation) {
    return null;
  }

  // Ajustar títulos y steps según si hay preselección
  const hasPreselection = preSelectedComplex !== null;
  const stepTitles = hasPreselection
    ? ["Elige fecha y horario", "Elige una cancha", "Confirma tu reserva"]
    : ["Elige fecha y horario", "Elige tu complejo", "Elige una cancha", "Confirma tu reserva"];

  // Determinar el conjunto de deportes activo
  const activeSportTypes = React.useMemo(() => {
    if (hasPreselection) {
      if (preSelectedComplex === "seven" && sevenSportTypes) return sevenSportTypes;
      return sportTypes;
    }
    if (selectedComplex === "seven" && sevenSportTypes) return sevenSportTypes;
    return sportTypes;
  }, [hasPreselection, preSelectedComplex, selectedComplex, sportTypes, sevenSportTypes]);

  const currentSportType = state.currentReservation.sportType
    ? activeSportTypes[state.currentReservation.sportType as SportTypeKey]
    : Object.values(activeSportTypes)[0];

  // if (!currentSportType) {
  //   return null;
  // }

  // Determinar el complejo activo para pasar a los componentes hijos
  const activeComplex = React.useMemo(() => {
    if (hasPreselection) {
      // Si hay preselección, asumimos que 'complex' es el correcto,
      // PERO si preSelectedComplex es 'seven' y tenemos sevenComplex, usémoslo por seguridad
      if (preSelectedComplex === "seven" && sevenComplex) return sevenComplex;
      return complex;
    }
    // Si no hay preselección, depende de lo que el usuario haya elegido en el paso 1
    if (selectedComplex === "seven" && sevenComplex) return sevenComplex;
    return complex;
  }, [hasPreselection, preSelectedComplex, selectedComplex, complex, sevenComplex]);

  const handleSubmit = async () => {
    let fetched = false;

    // Si es el paso de complejo y no hay selección, no avanzar
    if (!hasPreselection && currentStep === 1 && !selectedComplex) return;

    // Si seleccionó complejo, reiniciar reserva con el nuevo sport type
    if (!hasPreselection && currentStep === 1 && selectedComplex) {
      const targetComplex = selectedComplex === "seven" ? sevenComplex : complex;
      const targetSportTypes = selectedComplex === "seven" ? sevenSportTypes : sportTypes;

      // Find which sport is available at the selected hour
      const selectedSlot = generalAvailability?.find(
        (s) => s.schedule === currentReservation?.form.hour
      );
      const availableSportIds = selectedSlot?._sportIds?.[selectedComplex];
      const targetSportId = availableSportIds?.[0]; // Pick first available sport for this hour



      // Find the key (FUTBOL_5, FUTBOL_7) for this ID
      let sportTypeKey: SportTypeKey | undefined;
      if (targetSportId && targetSportTypes) {
        sportTypeKey = (Object.keys(targetSportTypes) as SportTypeKey[]).find(
          (key) => targetSportTypes[key]?.id === targetSportId
        );
      }



      // Fallback to default logic if not found (shouldn't happen if logic is correct)
      if (!sportTypeKey) {
        sportTypeKey = complexData[selectedComplex].supportedSports[0];

      }

      const sportId = targetSportTypes?.[sportTypeKey]?.id;
      const currentForm = currentReservation?.form;

      if (targetComplex && sportId && currentForm && sportTypeKey) {


        preloadReservation({
          complexId: targetComplex.id,
          sportType: sportTypeKey,
          sportTypeId: sportId,
          day: currentForm.day,
          hour: currentForm.hour,
          field: "",
          initialStep: 1,
        });

        const date = currentForm.day.toISOString().split("T")[0];


        await fetchAvailability("hour", date, currentForm.hour, {
          complexId: targetComplex.id,
          sportTypeId: sportId,
          sportType: sportTypeKey,
        });
        fetched = true;
      }
    }

    // Si estamos en el paso 0 (fecha y hora) Y HAY PRESELECCIÓN
    // Necesitamos ajustar el deporte si el horario seleccionado pertenece a otro deporte
    if (hasPreselection && currentStep === 0 && currentReservation?.form.hour) {
      const selectedSlot = generalAvailability?.find(
        (s) => s.schedule === currentReservation.form.hour
      );
      const availableSportIds = selectedSlot?._sportIds?.[preSelectedComplex];
      const targetSportId = availableSportIds?.[0];

      if (targetSportId && targetSportId !== state.currentReservation.sportTypeId) {
        // Switch sport!
        const targetSportTypes = preSelectedComplex === "seven" ? sevenSportTypes : sportTypes;
        const sportTypeKey =
          targetSportTypes &&
          (Object.keys(targetSportTypes) as SportTypeKey[]).find(
            (key) => targetSportTypes[key]?.id === targetSportId
          );

        if (sportTypeKey) {
          preloadReservation({
            complexId: complex.id,
            sportType: sportTypeKey,
            sportTypeId: targetSportId,
            day: currentReservation.form.day,
            hour: currentReservation.form.hour,
            field: "",
            initialStep: 0, // Stay in step 0 but updated, then next step will move to 1
          });

          const date = currentReservation.form.day.toISOString().split("T")[0];
          await fetchAvailability("hour", date, currentReservation.form.hour, {
            complexId: complex.id,
            sportTypeId: targetSportId,
            sportType: sportTypeKey,
          });
          fetched = true;
        }
      }
    }

    // Si estamos en el paso 0 (fecha y hora), buscar canchas disponibles para ese horario
    if (
      !fetched &&
      currentStep === 0 &&
      currentReservation?.form.day &&
      currentReservation?.form.hour
    ) {
      const date = currentReservation.form.day.toISOString().split("T")[0];
      const schedule = currentReservation.form.hour; // Ya viene en formato "HH:MM - HH:MM"

      // Buscar canchas disponibles para ese horario específico
      await fetchAvailability("hour", date, schedule);
    }

    goToNextStep();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 to-black border-2 border-white/20 rounded-none sm:rounded-3xl w-full h-full sm:h-auto sm:max-w-4xl sm:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header del Modal */}
        <div className="bg-black/50 backdrop-blur-sm border-b border-white/10 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">{stepTitles[currentStep]}</h2>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white text-3xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Progress Stepper */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {(hasPreselection
              ? [
                { step: 0, label: "Fecha & Hora" },
                { step: 1, label: "Cancha" },
                { step: 2, label: "Confirmar" },
              ]
              : [
                { step: 0, label: "Fecha & Hora" },
                { step: 1, label: "Complejo" },
                { step: 2, label: "Cancha" },
                { step: 3, label: "Confirmar" },
              ]
            ).map((item, idx, arr) => {
              const isActive = currentStep === item.step;
              const isPast = currentStep > item.step;

              return (
                <div key={idx} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${isActive
                      ? "bg-Primary text-white scale-110"
                      : isPast
                        ? "bg-Success text-white"
                        : "bg-white/20 text-white/40"
                      }`}
                  >
                    {isPast ? <CheckCircle2 size={20} /> : item.step + 1}
                  </div>
                  <span
                    className={`ml-2 text-xs sm:text-sm font-semibold hidden sm:block ${isActive ? "text-white" : "text-white/40"
                      }`}
                  >
                    {item.label}
                  </span>
                  {idx < arr.length - 1 && <div className="w-4 sm:w-8 h-0.5 bg-white/20 mx-2" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contenido del Modal según el Step */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* STEP 0: Date & Time Selection */}
          {currentStep === 0 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              {currentSportType ? (
                <DateTimePicker
                  complex={complex}
                  sportType={currentSportType}
                  availabilityOverride={generalAvailability || undefined}
                  loadingOverride={loadingGeneral}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-white/10 p-4 rounded-full mb-4">
                    <Building2 className="text-white/40" size={48} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No hay deportes disponibles</h3>
                  <p className="text-white/60 max-w-xs">
                    Este complejo no tiene deportes configurados o habilitados en este momento.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 1: Complex Selection (solo si NO hay preselección) */}
          {!hasPreselection && currentStep === 1 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="space-y-4">
                <h3 className="text-white font-bold text-xl mb-4 text-center">Elige tu complejo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(Object.keys(complexData) as Array<"bertaca" | "seven">).map((key) => {
                    const comp = complexData[key];
                    const isSelected = selectedComplex === key;

                    // Check availability if coming from General selection
                    let isAvailable = true;
                    if (!hasPreselection && generalAvailability && currentReservation?.form.hour) {
                      const selectedSlot = generalAvailability.find(
                        (s) => s.schedule === currentReservation.form.hour
                      );
                      if (selectedSlot && !selectedSlot._source.includes(key)) {
                        isAvailable = false;
                      }
                    }

                    if (!isAvailable) return null;

                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedComplex(key)}
                        className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${isSelected
                          ? `${comp.borderColor} bg-gradient-to-br ${comp.color} scale-105 shadow-2xl`
                          : "border-white/20 bg-white/5 hover:border-white/40"
                          }`}
                      >
                        <div className="p-6 text-left">
                          <div className="flex items-center gap-4 mb-4">
                            <div
                              className={`w-16 h-16 rounded-full ${comp.iconBg} flex items-center justify-center ${isSelected ? "scale-110" : ""
                                } transition-transform`}
                            >
                              <Building2 className="text-white" size={32} />
                            </div>
                            <div>
                              <h4 className="text-2xl font-bold text-white">{comp.name}</h4>
                              <p className="text-white/70 text-sm">{comp.subtitle}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {comp.features.map((feature, idx) => (
                              <p
                                key={idx}
                                className="flex items-center gap-2 text-white/80 text-sm"
                              >
                                <CheckCircle2 className="text-Success" size={16} />
                                <span>{feature}</span>
                              </p>
                            ))}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="absolute top-3 right-3">
                            <CheckCircle2 className="text-Success" size={28} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 1/2: Field Selection */}
          {((hasPreselection && currentStep === 1) || (!hasPreselection && currentStep === 2)) && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              {currentSportType && (
                <AvailableFields
                  complex={activeComplex}
                  sportTypes={activeSportTypes}
                  targetStep={hasPreselection ? 2 : 3}
                />
              )}
            </motion.div>
          )}

          {/* STEP 2/3: Confirmation */}
          {((hasPreselection && currentStep === 2) || (!hasPreselection && currentStep === 3)) && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              {currentSportType && (
                <ReserveTurn
                  currentUser={currentUser}
                  complex={activeComplex}
                  sportType={currentSportType}
                />
              )}
            </motion.div>
          )}
        </div>

        {/* Footer - Navigation Buttons */}
        <div className="bg-black/50 border-t border-white/10 p-4 flex justify-between">
          <button
            onClick={goToPreviousStep}
            disabled={currentStep === 0}
            className="px-6 py-2 rounded-xl font-semibold text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Atrás
          </button>

          {((hasPreselection && currentStep < 2) || (!hasPreselection && currentStep < 3)) && (
            <button
              onClick={handleSubmit}
              disabled={
                (currentStep === 0 &&
                  (!currentReservation?.form.day || !currentReservation?.form.hour)) ||
                (!hasPreselection && currentStep === 1 && !selectedComplex) ||
                (((hasPreselection && currentStep === 1) ||
                  (!hasPreselection && currentStep === 2)) &&
                  !currentReservation?.form.field)
              }
              className="px-8 py-2 bg-Primary hover:bg-Primary/80 text-white font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Siguiente
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default BookingModal;
