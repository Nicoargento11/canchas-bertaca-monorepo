"use client";

import React, { useEffect, useState } from "react";
import { EventBookingModal as EventBookingModalComponent } from "@/components/modals/EventBookingModal";
import { useReservationDashboard } from "@/contexts/ReserveDashboardContext";
import { useEventBookingModalStore } from "@/store/eventBookingModalStore";

interface EventBookingModalProps {
    userId?: string;
}

export const EventBookingModal = ({ userId }: EventBookingModalProps) => {
    const { state, fetchReservationsByDay } = useReservationDashboard();
    const { isOpen, onClose } = useEventBookingModalStore();

    const handleSuccess = () => {
        // Refresh reservations after creating event
        if (state.currentComplex && state.sportType && state.selectedDate) {
            fetchReservationsByDay(state.selectedDate, state.currentComplex.id, state.sportType.id);
        }
        onClose();
    };

    if (!state.currentComplex || !userId) {
        return null;
    }

    return (
        <EventBookingModalComponent
            isOpen={isOpen}
            onClose={onClose}
            onSuccess={handleSuccess}
            complex={state.currentComplex}
            userId={userId}
        />
    );
};
