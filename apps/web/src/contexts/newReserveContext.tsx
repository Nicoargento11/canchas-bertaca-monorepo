// contexts/ReserveContext.tsx
"use client";
import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
  getDailyAvailability,
  getAvailabilityForSchedule,
  getReservationsByDay,
  TurnByDay,
  TurnByHour,
  ReservesByDay,
  ReserveResult,
} from "@/services/reserve/reserve";
import dateLocal from "@/utils/dateLocal";
import { SportTypeKey } from "@/services/sport-types/sport-types";
import {
  saveReservationData,
  loadReservationData,
  clearReservationData,
  ReservationType,
} from "@/utils/reservationStorage";

// Tipos

interface ReserveForm {
  day: Date;
  hour: string;
  field: string;
  metadata?: {
    players?: number;
    equipment?: boolean;
    [key: string]: any;
  };
}

interface ReservationData {
  form: ReserveForm;
  availability: {
    byDay?: TurnByDay;
    byHour?: TurnByHour;
  };
  reservations?: ReservesByDay; // Nuevo campo para reservas existentes
  loading?: boolean;
}

interface ReserveState {
  reservations: Record<string, Record<string, ReservationData>>;
  currentReservation: {
    complexId?: string;
    sportTypeId?: string;
    sportType?: SportTypeKey;
    step: number;
    complexName?: string; // 'bertaca' | 'seven' - para identificar el tipo de reserva
  };
}

interface ReserveContextType {
  state: ReserveState;
  hasAvailableTurns: boolean;
  setHasAvailableTurns: React.Dispatch<React.SetStateAction<boolean>>;

  initReservation: (complexId: string, sportType: SportTypeKey, sportTypeId: string, complexName?: string) => void;
  preloadReservation: (data: PreloadReservationPayload) => void;
  updateReservationForm: (field: string, value: any) => void;
  fetchAvailability: (
    type: "day" | "hour",
    date: string,
    schedule?: string,
    overrides?: { complexId?: string; sportTypeId?: string; sportType?: SportTypeKey }
  ) => Promise<void>;
  fetchReservationsByDay: (date: string) => Promise<void>; // Nueva función
  getCurrentReservation: () => ReservationData | undefined;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  resetReservation: () => void;
}

type PreloadReservationPayload = {
  complexId: string;
  sportTypeId: string;
  sportType: SportTypeKey;
  day: Date;
  hour: string;
  field: string;
  metadata?: any;
  initialStep?: number;
  complexName?: string; // 'bertaca' | 'seven'
};

const ReserveContext = createContext<ReserveContextType | null>(null);

// Determina el tipo de reserva para localStorage.
// Pure function (no closure dependencies) — hoisted to module scope so it has
// a stable identity and never needs to appear in a useCallback dependency array.
const getReservationType = (complexName?: string): ReservationType => {
  if (complexName === 'seven') return 'seven';
  if (complexName === 'bertaca') return 'bertaca';
  return 'general';
};

export const ReserveProvider = ({ children }: { children: React.ReactNode }) => {
  const [hasAvailableTurns, setHasAvailableTurns] = useState(true);
  const [state, setState] = useState<ReserveState>({
    reservations: {},
    currentReservation: { step: 0 },
  });

  // Inicializa una nueva reserva
  const initReservation = useCallback((complexId: string, sportType: SportTypeKey, sportTypeId: string, complexName?: string) => {
    setState((prev) => {
      const newState = { ...prev };

      if (!newState.reservations[complexId]) {
        newState.reservations[complexId] = {};
      }

      // SIEMPRE intentar cargar datos desde localStorage al inicializar
      // Si no hay complexName, es 'general'
      const effectiveComplexName = complexName || 'general';
      const reservationType = getReservationType(effectiveComplexName);
      const savedData = loadReservationData(reservationType);

      // Los datos guardados solo son válidos para restaurar day/hour/field si
      // corresponden al mismo deporte que se está inicializando. Si sportTypeId
      // no coincide (y savedData sí trae uno), son datos de otro deporte y no
      // deben aplicarse (compat: si savedData no trae sportTypeId, se acepta).
      const savedDataMatchesSport = !savedData?.sportTypeId || savedData.sportTypeId === sportTypeId;
      const usableSavedData = savedDataMatchesSport ? savedData : undefined;

      // Si hay datos guardados válidos para este deporte, usarlos; de lo contrario, valores por defecto
      const initialForm = usableSavedData
        ? {
          day: usableSavedData.day ? new Date(usableSavedData.day) : dateLocal(),
          hour: usableSavedData.hour || "",
          field: usableSavedData.field || "",
          metadata: usableSavedData.metadata || {},
        }
        : {
          day: dateLocal(),
          hour: "",
          field: "",
          metadata: {},
        };

      // Calcular el step inicial basándose en los datos disponibles
      let initialStep = 0;
      if (usableSavedData) {
        // Si tiene cancha seleccionada, ir al paso de confirmación
        if (usableSavedData.field) {
          initialStep = complexName ? 2 : 3; // Step 2 si hay preselección, 3 si es general
        }
        // Si tiene hora pero no cancha, ir al paso de selección de cancha
        else if (usableSavedData.hour) {
          initialStep = complexName ? 1 : 2; // Step 1 si hay preselección, 2 si es general
        }
        // Si solo tiene día, quedarse en step 0
        else if (usableSavedData.day) {
          initialStep = 0;
        }
      }

      // SIEMPRE crear/sobrescribir la reserva con datos frescos de localStorage
      newState.reservations[complexId][sportType] = {
        form: initialForm,
        availability: {},
      };

      newState.currentReservation = {
        complexId,
        sportType,
        step: initialStep,
        sportTypeId,
        complexName: effectiveComplexName === 'general' ? undefined : effectiveComplexName
      };
      return newState;
    });
  }, []);

  // Precarga datos de reserva existente
  const preloadReservation = useCallback((data: PreloadReservationPayload) => {
    const { complexId, sportType, sportTypeId, initialStep = 3, complexName, ...reservationData } = data;

    // Guardar en localStorage TAMBIÉN en preloadReservation
    // Si no hay complexName, es 'general'
    const effectiveComplexName = complexName || 'general';
    const reservationType = getReservationType(effectiveComplexName);
    const dataToSave = {
      day: reservationData.day instanceof Date ? reservationData.day.toISOString() : reservationData.day,
      hour: reservationData.hour,
      field: reservationData.field,
      complexId: complexId, // Guardar el ID del complejo
      complexName: complexName, // Guardar qué complejo se eligió
      sportType: sportType, // Guardar el tipo de deporte
      sportTypeId: sportTypeId, // Guardar el ID del deporte
      metadata: reservationData.metadata,
    };
    saveReservationData(reservationType, dataToSave);

    setState((prev) => ({
      ...prev,
      reservations: {
        ...prev.reservations,
        [complexId]: {
          ...prev.reservations[complexId],
          [sportType]: {
            form: {
              ...reservationData,
              metadata: reservationData.metadata || {},
            },
            availability: {},
          },
        },
      },
      currentReservation: {
        complexId,
        sportType,
        sportTypeId,
        step: initialStep,
        complexName,
      },
    }));
  }, []);

  // Actualiza un campo específico del formulario
  // NOTE: reads `state.currentReservation` directly from closure (not from the `prev`
  // passed into setState) to decide whether to bail out early. Keeping `state` in the
  // dependency array (instead of trying to move this read into the updater) avoids any
  // risk of a stale-closure bug in this shared, untested context.
  const updateReservationForm = useCallback((field: string, value: any) => {
    const { complexId, sportType, complexName } = state.currentReservation;
    if (!complexId || !sportType) return;

    setState((prev) => {
      const updatedForm = {
        ...prev.reservations[complexId][sportType].form,
        [field]: value,
      };

      // Guardar en localStorage
      // Si no hay complexName, es 'general'
      const effectiveComplexName = complexName || 'general';
      const reservationType = getReservationType(effectiveComplexName);
      const dataToSave = {
        day: updatedForm.day instanceof Date ? updatedForm.day.toISOString() : updatedForm.day,
        hour: updatedForm.hour,
        field: updatedForm.field,
        complexId: complexId, // Guardar el ID del complejo
        complexName: complexName, // Guardar qué complejo se eligió
        sportType: sportType, // Guardar el tipo de deporte
        sportTypeId: prev.currentReservation.sportTypeId, // Guardar el ID del deporte
        metadata: updatedForm.metadata,
      };
      saveReservationData(reservationType, dataToSave);

      return {
        ...prev,
        reservations: {
          ...prev.reservations,
          [complexId]: {
            ...prev.reservations[complexId],
            [sportType]: {
              ...prev.reservations[complexId][sportType],
              form: updatedForm,
            },
          },
        },
      };
    });
  }, [state]);

  // Nueva función para obtener reservas por día
  // NOTE: captures complexId/sportType/sportTypeId from `state` at call time and reuses
  // those SAME captured values in both setState calls across the `await` below. Reading
  // them from `prev` instead would be unsafe: if currentReservation changes while this
  // fetch is in flight, the result could get written into the wrong slot. So this keeps
  // the closure read and lists `state` as a dependency rather than converting to `prev`.
  const fetchReservationsByDay = useCallback(async (date: string) => {
    const { complexId, sportType, sportTypeId } = state.currentReservation;
    if (!complexId || !sportType || !sportTypeId) return;

    try {
      setState((prev) => ({
        ...prev,
        reservations: {
          ...prev.reservations,
          [complexId]: {
            ...prev.reservations[complexId],
            [sportType]: {
              ...prev.reservations[complexId][sportType],
              loading: true,
            },
          },
        },
      }));

      const reservationsData = await getReservationsByDay(date, complexId, sportTypeId);

      setState((prev) => ({
        ...prev,
        reservations: {
          ...prev.reservations,
          [complexId]: {
            ...prev.reservations[complexId],
            [sportType]: {
              ...prev.reservations[complexId][sportType],
              reservations: reservationsData.data,
              loading: false,
            },
          },
        },
      }));
    } catch (error) {
      toast.error("Error al obtener las reservas existentes");
      setState((prev) => ({
        ...prev,
        reservations: {
          ...prev.reservations,
          [complexId]: {
            ...prev.reservations[complexId],
            [sportType]: {
              ...prev.reservations[complexId][sportType],
              loading: false,
            },
          },
        },
      }));
    }
  }, [state]);

  // Obtiene la reserva actual
  // Pure getter derived directly from `state` — must depend on `state`.
  const getCurrentReservation = useCallback(() => {
    const { complexId, sportType, sportTypeId } = state.currentReservation;
    if (!complexId || !sportType || !sportTypeId) return undefined;
    return state.reservations[complexId]?.[sportType];
  }, [state]);

  // Obtiene disponibilidad
  // NOTE: same reasoning as fetchReservationsByDay — complexId/sportTypeId/sportType are
  // captured from `state` (with optional overrides) before the `await` calls below and
  // reused afterwards, so reading from `prev` inside the updaters would risk writing a
  // stale/incorrect fetch result if currentReservation changes mid-flight. Keeps `state`
  // as a dependency instead of converting to the `prev` pattern.
  const fetchAvailability = useCallback(async (
    type: "day" | "hour",
    date: string,
    schedule?: string,
    overrides?: { complexId?: string; sportTypeId?: string; sportType?: SportTypeKey }
  ) => {
    const complexId = overrides?.complexId || state.currentReservation.complexId;
    const sportTypeId = overrides?.sportTypeId || state.currentReservation.sportTypeId;
    const sportType = overrides?.sportType || state.currentReservation.sportType;

    if (!complexId || !sportType || !sportTypeId) return;

    try {
      setState((prev) => ({
        ...prev,
        reservations: {
          ...prev.reservations,
          [complexId]: {
            ...prev.reservations[complexId],
            [sportType]: {
              ...prev.reservations[complexId]?.[sportType],
              loading: true,
            },
          },
        },
      }));

      let data: ReserveResult<TurnByDay | TurnByHour>;
      if (type === "day") {
        data = await getDailyAvailability(date, complexId, sportTypeId);
      } else if (type === "hour" && schedule) {
        data = await getAvailabilityForSchedule(date, schedule, complexId, sportTypeId);
      } else {
        return;
      }

      setState((prev) => ({
        ...prev,
        reservations: {
          ...prev.reservations,
          [complexId]: {
            ...prev.reservations[complexId],
            [sportType]: {
              ...prev.reservations[complexId][sportType],
              availability: {
                ...prev.reservations[complexId][sportType].availability,
                [type === "day" ? "byDay" : "byHour"]: data?.data,
              },
              loading: false,
            },
          },
        },
      }));
    } catch (error) {
      toast.error("Error al obtener disponibilidad");
      setState((prev) => ({
        ...prev,
        reservations: {
          ...prev.reservations,
          [complexId]: {
            ...prev.reservations[complexId],
            [sportType]: {
              ...prev.reservations[complexId][sportType],
              loading: false,
            },
          },
        },
      }));
    }
  }, [state]);

  // Navegación del stepper
  const goToNextStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentReservation: {
        ...prev.currentReservation,
        step: Math.min(prev.currentReservation.step + 1, 3),
      },
    }));
  }, []);

  const goToPreviousStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentReservation: {
        ...prev.currentReservation,
        step: Math.max(prev.currentReservation.step - 1, 0),
      },
    }));
  }, []);

  // Resetea la reserva actual
  // NOTE: reads `state.currentReservation` from closure (not `prev`) because the
  // `clearReservationData` side effect must run synchronously with the CURRENT values
  // before setState is even called — it is not inside the updater, so there is no `prev`
  // available at that point. Keeps `state` as a dependency rather than restructuring this
  // side-effect ordering.
  const resetReservation = useCallback(() => {
    const { complexId, sportType, sportTypeId, complexName } = state.currentReservation;
    if (!complexId || !sportType || !sportTypeId) return;

    // Limpiar localStorage del tipo correspondiente
    const reservationType = getReservationType(complexName);
    clearReservationData(reservationType);

    setState((prev) => ({
      ...prev,
      reservations: {
        ...prev.reservations,
        [complexId]: {
          ...prev.reservations[complexId],
          [sportType]: {
            form: {
              day: dateLocal(),
              hour: "",
              field: "",
              metadata: {},
            },
            availability: {},
          },
        },
      },
      currentReservation: {
        ...prev.currentReservation,
        step: 0,
      },
    }));
  }, [state]);

  const value = useMemo<ReserveContextType>(
    () => ({
      state,
      initReservation,
      preloadReservation,
      updateReservationForm,
      fetchReservationsByDay,
      fetchAvailability,
      getCurrentReservation,
      goToNextStep,
      goToPreviousStep,
      resetReservation,
      hasAvailableTurns,
      setHasAvailableTurns,
    }),
    [
      state,
      initReservation,
      preloadReservation,
      updateReservationForm,
      fetchReservationsByDay,
      fetchAvailability,
      getCurrentReservation,
      goToNextStep,
      goToPreviousStep,
      resetReservation,
      hasAvailableTurns,
      setHasAvailableTurns,
    ]
  );

  return (
    <ReserveContext.Provider value={value}>
      {children}
    </ReserveContext.Provider>
  );
};

export const useReserve = () => {
  const context = useContext(ReserveContext);
  if (!context) {
    throw new Error("useReserve must be used within a ReserveProvider");
  }
  return context;
};
