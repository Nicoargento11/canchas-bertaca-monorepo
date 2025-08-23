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
  };
}

interface ReserveContextType {
  state: ReserveState;
  hasAvailableTurns: boolean;
  setHasAvailableTurns: React.Dispatch<React.SetStateAction<boolean>>;

  initReservation: (complexId: string, sportType: SportTypeKey, sportTypeId: string) => void;
  preloadReservation: (data: PreloadReservationPayload) => void;
  updateReservationForm: (field: string, value: any) => void;
  fetchAvailability: (type: "day" | "hour", date: string, schedule?: string) => Promise<void>;
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
};

const ReserveContext = createContext<ReserveContextType | null>(null);

export const ReserveProvider = ({ children }: { children: React.ReactNode }) => {
  const [hasAvailableTurns, setHasAvailableTurns] = useState(true);
  const [state, setState] = useState<ReserveState>({
    reservations: {},
    currentReservation: { step: 0 },
  });

  // Inicializa una nueva reserva
  const initReservation = (complexId: string, sportType: SportTypeKey, sportTypeId: string) => {
    setState((prev) => {
      const newState = { ...prev };

      if (!newState.reservations[complexId]) {
        newState.reservations[complexId] = {};
      }

      if (!newState.reservations[complexId][sportType]) {
        newState.reservations[complexId][sportType] = {
          form: {
            day: dateLocal(),
            hour: "",
            field: "",
            metadata: {},
          },
          availability: {},
        };
      }

      newState.currentReservation = { complexId, sportType, step: 0, sportTypeId };
      return newState;
    });
  };

  // Precarga datos de reserva existente
  const preloadReservation = (data: PreloadReservationPayload) => {
    const { complexId, sportType, sportTypeId, initialStep = 3, ...reservationData } = data;

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
      },
    }));
  };

  // Actualiza un campo específico del formulario
  const updateReservationForm = (field: string, value: any) => {
    const { complexId, sportType } = state.currentReservation;
    if (!complexId || !sportType) return;

    setState((prev) => ({
      ...prev,
      reservations: {
        ...prev.reservations,
        [complexId]: {
          ...prev.reservations[complexId],
          [sportType]: {
            ...prev.reservations[complexId][sportType],
            form: {
              ...prev.reservations[complexId][sportType].form,
              [field]: value,
            },
          },
        },
      },
    }));
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
      reservationsData;

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
  const fetchAvailability = async (type: "day" | "hour", date: string, schedule?: string) => {
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

      let data: ReserveResult<TurnByDay | TurnByHour>;
      if (type === "day") {
        data = await getDailyAvailability(date, complexId, sportTypeId);
      } else if (type === "hour" && schedule) {
        data = await getAvailabilityForSchedule(date, schedule, complexId, sportTypeId);
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
    const { complexId, sportType, sportTypeId } = state.currentReservation;
    if (!complexId || !sportType || !sportTypeId) return;

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
