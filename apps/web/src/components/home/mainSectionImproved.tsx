"use client";
import React, { useState } from "react";
import { useModal } from "@/contexts/modalContext";
import { Calendar as CalendarIcon, MapPin, Users, CheckCircle2, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { SportType, SportTypeKey } from "@/services/sport-types/sport-types";
import { Complex } from "@/services/complex/complex";
import { useReserve } from "@/contexts/newReserveContext";
import { SessionPayload } from "@/services/auth/session";
import { TurnByDay } from "@/services/reserve/reserve";
import { Court } from "@/services/court/court";

interface SportData {
  reserves: TurnByDay | undefined;
  courts: Court[];
}

interface MainSectionProps {
  complex: Complex;
  sportTypes: Record<SportTypeKey, SportType>;
  sevenComplex?: Complex;
  sevenSportTypes?: Partial<Record<SportTypeKey, SportType>>;
  currentUser: SessionPayload | null;
  bertacaSportsData: Record<SportTypeKey, SportData>;
  sevenSportsData: Record<SportTypeKey, SportData>;
}

// Import section components
import { HeroSection } from "./sections/HeroSection";
import { GradientSeparator } from "./sections/GradientSeparator";
// import { UnifiedComplexSection } from "./sections/UnifiedComplexSection";
// Import dynamic
import dynamic from "next/dynamic";

const UnifiedComplexSection = dynamic(
  () => import("./sections/UnifiedComplexSection").then((mod) => mod.UnifiedComplexSection),
  {
    loading: () => <div className="h-96 w-full animate-pulse bg-slate-900/50" />,
  }
);
import { LocationContact } from "./sections/LocationContact";
import { ServicesGrid } from "./sections/ServicesGrid";
import { Footer } from "./sections/Footer";

// Import modals
import { useComplexTab } from "@/contexts/ComplexTabContext";
// import BookingModal from "../modals/bookingModal";
const BookingModal = dynamic(() => import("../modals/bookingModal"), {
  ssr: false,
});

export const MainSectionImproved = React.memo(
  ({
    complex,
    sportTypes,
    sevenComplex,
    sevenSportTypes,
    currentUser,
    bertacaSportsData,
    sevenSportsData,
  }: MainSectionProps) => {
    const { openModal } = useModal();
    const { activeTab, setActiveTab } = useComplexTab();
    const { initReservation, resetReservation, preloadReservation } = useReserve();
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [preSelectedComplex, setPreSelectedComplex] = useState<"bertaca" | "seven" | null>(null);

    // Trust indicators
    const trustData = {
      rating: 4.8,
      reviews: 120,
      monthlyGames: 2340,
    };

    // COMENTADO - Usar solo BookingModal nuevo
    // const handleOpenModal = (complexType?: "bertaca" | "seven") => {
    //   // Si hay un tipo de complejo específico, usar el sportType correspondiente
    //   if (complexType === "bertaca") {
    //     const sportType = "FUTBOL_5" as SportTypeKey;
    //     resetReservation();
    //     initReservation(complex.id, sportType, sportTypes[sportType]?.id || sportTypes.FUTBOL_5.id);
    //     openModal("RESERVE_FUTBOL", { complexId: complex.id, sportType });
    //   } else if (complexType === "seven") {
    //     const sportType = "FUTBOL_7" as SportTypeKey;
    //     resetReservation();
    //     initReservation(complex.id, sportType, sportTypes[sportType]?.id || sportTypes.FUTBOL_7.id);
    //     openModal("RESERVE_FUTBOL", { complexId: complex.id, sportType });
    //   } else {
    //     // Reserva general - usar FUTBOL_5 por defecto
    //     const sportType = "FUTBOL_5" as SportTypeKey;
    //     resetReservation();
    //     initReservation(complex.id, sportType, sportTypes[sportType]?.id || sportTypes.FUTBOL_5.id);
    //     openModal("RESERVE_FUTBOL", { complexId: complex.id, sportType });
    //   }
    // };

    const handleOpenBookingModal = (complexType?: "bertaca" | "seven") => {
      // Inicializar la reserva antes de abrir el modal
      const isSeven = complexType === "seven";
      const targetComplex = isSeven && sevenComplex ? sevenComplex : complex;
      const targetSportTypes = isSeven && sevenSportTypes ? sevenSportTypes : sportTypes;
      const sportType = isSeven ? "FUTBOL_7" : "FUTBOL_5";

      // Verificar si el deporte existe en los tipos disponibles
      const targetSport = targetSportTypes[sportType as SportTypeKey];

      if (targetSport) {
        resetReservation();
        initReservation(targetComplex.id, sportType as SportTypeKey, targetSport.id);
      } else if (isSeven) {
        // Si es Seven y no tiene F7, NO hacer fallback a F5.
        resetReservation();
      } else {
        // Caso default (General o Bertaca): Si no hay F5, intentamos fallback (raro)
        const fallbackSport = targetSportTypes.FUTBOL_5;
        if (fallbackSport) {
          resetReservation();
          initReservation(targetComplex.id, "FUTBOL_5", fallbackSport.id);
        }
      }

      setPreSelectedComplex(complexType || null);
      setShowBookingModal(true);
    };

    const handleReserveFromTable = (
      complexId: string,
      sportType: SportTypeKey,
      sportTypeId: string,
      day: Date,
      hour: string,
      field: string
    ) => {
      // Preload reservation data
      preloadReservation({
        complexId,
        sportType,
        sportTypeId,
        day,
        hour,
        field,
        initialStep: 2, // Skip to confirmation step (Step 2 when preselected)
      });

      // Determine which complex is selected based on ID
      const isSeven = sevenComplex && complexId === sevenComplex.id;
      setPreSelectedComplex(isSeven ? "seven" : "bertaca");
      setShowBookingModal(true);
    };

    return (
      <>
        {/* HERO SECTION */}
        <HeroSection onOpenModal={handleOpenBookingModal} trustData={trustData} />

        {/* SECTIONS BELOW THE FOLD */}
        <UnifiedComplexSection
          bertacaSportsData={bertacaSportsData}
          sevenSportsData={sevenSportsData}
          complex={complex}
          sevenComplex={sevenComplex}
          sportTypes={sportTypes}
          sevenSportTypes={sevenSportTypes}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onReserveClick={handleReserveFromTable}
        />
        <Footer />

        {/* MODAL DE BOOKING */}
        {showBookingModal && (
          <BookingModal
            onClose={() => {
              setShowBookingModal(false);
              setPreSelectedComplex(null);
            }}
            complex={preSelectedComplex === "seven" && sevenComplex ? sevenComplex : complex}
            sportTypes={
              preSelectedComplex === "seven" && sevenSportTypes ? sevenSportTypes : sportTypes
            }
            sevenComplex={sevenComplex}
            sevenSportTypes={sevenSportTypes}
            preSelectedComplex={preSelectedComplex}
            currentUser={currentUser}
          />
        )}
      </>
    );
  }
);

MainSectionImproved.displayName = "MainSectionImproved";
