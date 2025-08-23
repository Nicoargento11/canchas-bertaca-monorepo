"use client";
import { useMemo } from "react";

import { Stepper } from "../ui/stepper/stepper";
import { Steps } from "../ui/stepper/steps";

import { ShoppingCart, CalendarDays, Clock9, Icon } from "lucide-react";
import { soccerPitch } from "@lucide/lab";
import Calendar from "../reserve/calendar";
import AvailableTurns from "../reserve/available-turns";
import AvailableFields from "../reserve/available-fields";
import ReserveTurn from "../reserve/reserve-turn";

import { Modal } from "./modal";
import { SessionPayload } from "@/services/auth/session";
import { toast } from "sonner";
import { useReserve } from "@/contexts/newReserveContext";
import { Complex } from "@/services/complex/complex";
import { ModalType, useModal } from "@/contexts/modalContext";
import { SportType } from "@/services/sport-types/sport-types";

enum STEPS {
  DATE = 0,
  TIME = 1,
  FIELD = 2,
  CONFIRM = 3,
}
const NUMBER_OF_STEPS = 4;

interface ReserveModalProps {
  currentUser?: SessionPayload | null;
  complex: Complex;
  sportType: SportType;
  modalType: ModalType;
}

const ReserveModal = ({ currentUser, complex, sportType, modalType }: ReserveModalProps) => {
  const {
    state,
    getCurrentReservation,
    updateReservationForm,
    goToNextStep,
    goToPreviousStep,
    hasAvailableTurns,
  } = useReserve();

  const { isModalOpen, closeModal } = useModal();
  const currentReservation = getCurrentReservation();
  const { complexId, step: currentStep } = state.currentReservation;

  if (!currentReservation || !complexId || !sportType) {
    closeModal();
    return null;
  }

  const sportConfig = useMemo(() => {
    const baseConfig = {
      fieldIcon: soccerPitch,
      fieldLabel: "Cancha",
      stepTitles: [
        "Elige una fecha",
        "Elige un horario",
        "Elige una cancha",
        "Confirma tu reserva",
      ],
    };

    switch (sportType.name) {
      case "PADEL":
        return {
          ...baseConfig,
          // fieldIcon: paddleCourt,
          fieldLabel: "Pista de pádel",
        };
      case "TENIS":
        return {
          ...baseConfig,
          // fieldIcon: tennisCourt,
          fieldLabel: "Cancha de tenis",
        };
      default:
        return baseConfig;
    }
  }, [sportType]);

  const handleSubmit = () => {
    if (
      currentStep === STEPS.FIELD &&
      (!currentReservation.form.hour || !currentReservation.form.field)
    ) {
      toast.error("Debes completar todos los campos antes de continuar");
      return;
    }
    goToNextStep();
  };

  // const onSubmit = () => {
  //   if (currentStep !== STEPS.CONFIRM) {
  //     return goToNextStep();
  //   }
  // };

  const actionLabel = useMemo(() => {
    if (currentStep === STEPS.CONFIRM) return undefined;
    if (currentStep === STEPS.TIME && !hasAvailableTurns) return undefined;
    return "Siguiente";
  }, [currentStep, hasAvailableTurns]);

  const secondaryActionLabel = useMemo(
    () => (currentStep === STEPS.DATE ? undefined : "Anterior"),
    [currentStep]
  );

  //content Reserve

  let title = "Elige una fecha";

  const bodyContent = useMemo(() => {
    switch (currentStep) {
      case STEPS.DATE:
        return (
          <Calendar
            complexId={state.currentReservation.complexId || ""}
            sportType={state.currentReservation.sportType || ""}
            disabledDates={complex.unavailableDays.map((day) => new Date(day.date))}
            disabledWeekdays={complex.scheduleDays
              .filter((day) => !day.isActive)
              .map((day) => day.dayOfWeek)}
            maxSelectableDays={30}
          />
        );
      case STEPS.TIME:
        return <AvailableTurns complex={complex} sportType={sportType} />;
      case STEPS.FIELD:
        return <AvailableFields complex={complex} sportType={sportType} />;
      case STEPS.CONFIRM:
        return <ReserveTurn currentUser={currentUser} complex={complex} sportType={sportType} />;
      default:
        return <div>Error</div>;
    }
  }, [currentStep, currentReservation, sportType]);

  const headerContent = (
    <Stepper currentStep={currentStep} numberOfSteps={NUMBER_OF_STEPS}>
      <Steps currentStep={currentStep} index={0}>
        <CalendarDays size={25} />
      </Steps>
      <Steps currentStep={currentStep} index={1}>
        <Clock9 size={25} />
      </Steps>
      <Steps currentStep={currentStep} index={2}>
        <Icon iconNode={soccerPitch} size={30}></Icon>
      </Steps>
      <Steps currentStep={currentStep} index={3}>
        <ShoppingCart size={25} />
      </Steps>
    </Stepper>
  );
  return (
    <Modal
      isOpen={isModalOpen(modalType)}
      onClose={closeModal}
      title={sportConfig.stepTitles[currentStep]}
      header={headerContent}
      body={bodyContent}
      actionLabel={actionLabel}
      secondaryActionLabel={secondaryActionLabel}
      onSubmit={handleSubmit}
      secondaryAction={currentStep === STEPS.DATE ? undefined : goToPreviousStep}
    />
  );
};

export default ReserveModal;
