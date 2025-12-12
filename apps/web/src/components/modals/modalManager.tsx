"use client";

import { ModalType, useModal } from "@/contexts/modalContext";
import LoginModal from "./loginModal";
import { SessionPayload } from "@/services/auth/session";
import { Complex } from "@/services/complex/complex";
import RegisterModal from "./registerModal";
import { SportType, SportTypeKey } from "@/services/sport-types/sport-types";
import { ReviewModal } from "./reviewModal";

interface ModalControlsProps {
  session: SessionPayload | null;
  complex: Complex;
  sportTypes: Record<string, SportType>;
}
export default function ModalManager({ complex, session, sportTypes }: ModalControlsProps) {
  const { currentModal } = useModal();

  const modalComponents = {
    LOGIN: <LoginModal />,
    REGISTER: <RegisterModal />,
    REVIEW: <ReviewModal />,
  };
  return currentModal ? modalComponents[currentModal as keyof typeof modalComponents] : null;
}
