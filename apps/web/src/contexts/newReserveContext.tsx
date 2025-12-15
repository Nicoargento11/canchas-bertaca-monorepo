// contexts/ReserveContext.tsx
"use client";
import React, { createContext, useContext, useState } from "react";
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

export const ReserveProvider = ({ children }: { children: React.ReactNode }) => {
  const [hasAvailableTurns, setHasAvailableTurns] = useState(true);
  const [state, setState] = useState<ReserveState>({
    reservations: {},
    currentReservation: { step: 0 },
  });

  // Determina el tipo de reserva para localStorage
  const getReservationType = (complexName?: string): ReservationType => {
    if (complexName === 'seven') return 'seven';
    if (complexName === 'bertaca') return 'bertaca';
    return 'general';
  };

  // Inicializa una nueva reserva
  const initReservation = (complexId: string, sportType: SportTypeKey, sportTypeId: string, complexName?: string) => {
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

      console.log(`[RESERVA] initReservation tipo:${reservationType}, savedData:`, savedData);

      // Si hay datos guardados, usarlos; de lo contrario, valores por defecto
      const initialForm = savedData
        ? {
          day: savedData.day ? new Date(savedData.day) : dateLocal(),
          hour: savedData.hour || "",
          field: savedData.field || "",
          metadata: savedData.metadata || {},
        }
        : {
          day: dateLocal(),
          hour: "",
          field: "",
          metadata: {},
        };

      // Calcular el step inicial basándose en los datos disponibles
      let initialStep = 0;
      if (savedData) {
        // Si tiene cancha seleccionada, ir al paso de confirmación
        if (savedData.field) {
          initialStep = complexName ? 2 : 3; // Step 2 si hay preselección, 3 si es general
        }
        // Si tiene hora pero no cancha, ir al paso de selección de cancha
        else if (savedData.hour) {
          initialStep = complexName ? 1 : 2; // Step 1 si hay preselección, 2 si es general
        }
        // Si solo tiene día, quedarse en step 0
        else if (savedData.day) {
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
  };

  // Precarga datos de reserva existente
  const preloadReservation = (data: PreloadReservationPayload) => {
    const { complexId, sportType, sportTypeId, initialStep = 3, complexName, ...reservationData } = data;

    // Guardar en localStorage TAMBIÉN en preloadReservation
    // Si no hay complexName, es 'general'
    const effectiveComplexName = complexName || 'general';
    const reservationType = getReservationType(effectiveComplexName);
    const dataToSave = {
      day: reservationData.day instanceof Date ? reservationData.day.toISOString() : reservationData.day,
      hour: reservationData.hour,
      field: reservationData.field,
      metadata: reservationData.metadata,
    };
    console.log(`[RESERVA] preloadReservation tipo:${reservationType}`, dataToSave);
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
  };

  // Actualiza un campo específico del formulario
  const updateReservationForm = (field: string, value: any) => {
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
        metadata: updatedForm.metadata,
      };
      console.log(`[RESERVA] updateReservationForm tipo:${reservationType}, campo:${field}`, dataToSave);
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
  };

  // Nueva función para obtener reservas por día
  const fetchReservationsByDay = async (date: string) => {
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
  };

  // Obtiene la reserva actual
  const getCurrentReservation = () => {
    const { complexId, sportType, sportTypeId } = state.currentReservation;
    if (!complexId || !sportType || !sportTypeId) return undefined;
    return state.reservations[complexId]?.[sportType];
  };

  // Obtiene disponibilidad
  const fetchAvailability = async (
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
  };

  // Navegación del stepper
  const goToNextStep = () => {
    setState((prev) => ({
      ...prev,
      currentReservation: {
        ...prev.currentReservation,
        step: Math.min(prev.currentReservation.step + 1, 3),
      },
    }));
  };

  const goToPreviousStep = () => {
    setState((prev) => ({
      ...prev,
      currentReservation: {
        ...prev.currentReservation,
        step: Math.max(prev.currentReservation.step - 1, 0),
      },
    }));
  };

  // Resetea la reserva actual
  const resetReservation = () => {
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
  };

  return (
    <ReserveContext.Provider
      value={{
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
      }}
    >
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
