"use client";
import { SportTypeKey } from "@/services/sport-types/sport-types";
import React, { createContext, useContext, useState } from "react";

export type ModalType =
  | "LOGIN"
  | "REGISTER"
  | "REVIEW"
  | "RESERVE_PADEL"
  | "RESERVE_FUTBOL"
  | "RESERVE_BASKET"; // Puedes añadir más según necesites

interface ModalData {
  complexId?: string;
  sportType?: SportTypeKey;
  // cualquier otro dato específico que necesites pasar
}
interface ModalProviderProps {
  children: React.ReactNode;
}

interface ModalContextType {
  openModal: (type: ModalType, data?: ModalData) => void;
  closeModal: () => void;
  currentModal: ModalType | null;
  modalData: ModalData | null;
  isModalOpen: (type: ModalType) => boolean;
}

const ModalContext = createContext<ModalContextType | null>(null);

export const useModal = () => {
  const context = useContext(ModalContext);

  if (!context) throw new Error("useAuth must be used within a AuthProvider");
  return context;
};

export const ModalProvider = ({ children }: ModalProviderProps) => {
  const [currentModal, setCurrentModal] = useState<ModalType | null>(null);
  const [modalData, setModalData] = useState<ModalData | null>(null);

  const openModal = (type: ModalType, data?: ModalData) => {
    setCurrentModal(type);
    setModalData(data || null);
  };

  const closeModal = () => {
    setCurrentModal(null);
    setModalData(null);
  };

  const isModalOpen = (type: ModalType) => currentModal === type;
  return (
    <ModalContext.Provider
      value={{
        openModal,
        closeModal,
        currentModal,
        modalData,
        isModalOpen,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export default ModalContext;
