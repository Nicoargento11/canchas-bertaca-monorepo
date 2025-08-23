"use client";

import { ModalType, useModal } from "@/contexts/modalContext";
import ReserveModal from "./reserveModal";
import LoginModal from "./loginModal";
import { SessionPayload } from "@/services/auth/session";
import { Complex } from "@/services/complex/complex";
import RegisterModal from "./registerModal";
import { JSX } from "react";
import { SportType, SportTypeKey } from "@/services/sport-types/sport-types";
import { ReviewModal } from "./reviewModal";

interface ModalControlsProps {
  session: SessionPayload | null;
  complex: Complex;
  sportTypes: Record<string, SportType>;
}
export default function ModalManager({ complex, session, sportTypes }: ModalControlsProps) {
  const { currentModal } = useModal();

  const normalizeSportKey = (key: SportTypeKey): string => {
    return key.split("_")[0];
  };

  const getReserveModalType = (key: SportTypeKey): ModalType => {
    const normalizedKey = normalizeSportKey(key);
    const modalType = `RESERVE_${normalizedKey}` as const;

    // Lista de modalTypes válidos para RESERVE_*
    const validReserveModalTypes: ModalType[] = [
      "RESERVE_PADEL",
      "RESERVE_FUTBOL",
      "RESERVE_BASKET",
      "LOGIN",
      "REGISTER",
      "REVIEW",
      // Añade otros si es necesario
    ];

    if (validReserveModalTypes.includes(modalType as ModalType)) {
      return modalType as ModalType;
    }
    throw new Error(`ModalType no válido: ${modalType}`);
  };

  const modalComponents = {
    ...Object.entries(sportTypes).reduce(
      (acc, [key, sportType]) => {
        const modalType = getReserveModalType(key as SportTypeKey);
        return {
          ...acc,
          [modalType]: (
            <ReserveModal
              currentUser={session}
              complex={complex}
              sportType={sportType}
              modalType={modalType}
            />
          ),
        };
      },
      {} as Record<ModalType, JSX.Element>
    ),
    LOGIN: <LoginModal />,
    REGISTER: <RegisterModal />,
    REVIEW: <ReviewModal />,
  };
  return currentModal ? modalComponents[currentModal as keyof typeof modalComponents] : null;
}
