"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useModal } from "@/contexts/modalContext";
import { useComplexTab } from "@/contexts/ComplexTabContext";
import { Complex } from "@/services/complex/complex";
import { SportType, SportTypeKey } from "@/services/sport-types/sport-types";
import { SessionPayload } from "@/services/auth/session";

const BookingModal = dynamic(() => import("../modals/bookingModal"), {
    ssr: false,
});

interface BookingOrchestratorProps {
    complex: Complex;
    sevenComplex?: Complex;
    sportTypes: Record<SportTypeKey, SportType>;
    sevenSportTypes?: Partial<Record<SportTypeKey, SportType>>;
    currentUser: SessionPayload | null;
}

export const BookingOrchestrator = React.memo(
    ({
        complex,
        sevenComplex,
        sportTypes,
        sevenSportTypes,
        currentUser,
    }: BookingOrchestratorProps) => {
        // Correct destructuring based on ModalContextType
        const { currentModal, modalData, closeModal, isModalOpen } = useModal();
        const { activeTab } = useComplexTab(); // Optional: sync with tabs

        // Check if the current modal type is RESERVE_FUTBOL
        const showModal = isModalOpen("RESERVE_FUTBOL");

        // Determine the active complex for the modal based on data or default
        const targetComplexId = modalData?.complexId;
        const isSeven = sevenComplex && targetComplexId === sevenComplex.id;
        const activeComplex = isSeven ? sevenComplex : complex;
        const activeSports = isSeven && sevenSportTypes ? sevenSportTypes : sportTypes;

        if (!showModal) return null;

        return (
            <BookingModal
                onClose={closeModal}
                complex={activeComplex}
                sportTypes={activeSports}
                sevenComplex={sevenComplex}
                sevenSportTypes={sevenSportTypes}
                preSelectedComplex={isSeven ? "seven" : "bertaca"}
                currentUser={currentUser}
            />
        );
    }
);

BookingOrchestrator.displayName = "BookingOrchestrator";
