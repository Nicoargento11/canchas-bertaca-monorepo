"use client";
import { useMemo } from "react";

import { Stepper } from "../ui/stepper/stepper";
import { Steps } from "../ui/stepper/steps";

import { ShoppingCart, CalendarDays, Clock9 } from "lucide-react";
import { GiSoccerField } from "@react-icons/all-files/gi/GiSoccerField";
import { useModal } from "@/contexts/modalContext";
import Calendar from "../reserve/calendar";
import AvailableTurns from "../reserve/available-turns";
import AvailableFields from "../reserve/available-fields";
import ReserveTurn from "../reserve/reserve-turn";

import { Modal } from "./modal";
import { useReserve } from "@/contexts/reserveContext";
import { useToast } from "@/hooks/use-toast";
import { Session } from "@/services/auth/session";
import { UnavailableDay } from "@/services/unavailableDay/unavailableDay";
import { ScheduleDay } from "@/services/scheduleDay/scheduleDay";
import { FixedSchedule } from "@/services/fixed-schedules/fixedSchedules";
import { Schedule } from "@/services/schedule/schedule";

enum STEPS {
  date = 0,
  hour = 1,
  field = 2,
  reserve = 3,
}
const NUMBER_OF_STEPS = 4;

interface ReserveModalProps {
  currentUser?: Session | null;
  unavailableDays: UnavailableDay[];
  scheduleDays: ScheduleDay[];
  fixedSchedules: FixedSchedule[];
  schedules: Schedule[];
}

const ReserveModal = ({
  currentUser,
  scheduleDays,
  unavailableDays,
  fixedSchedules,
  schedules,
}: ReserveModalProps) => {
  const { reserveForm, currentStep, goToNextStep, goToPreviousStep } =
    useReserve();
  const { isOpenReserve, oncloseReserve } = useModal();

  const { toast } = useToast();

  const onSubmit = () => {
    if (
      currentStep === STEPS.field &&
      (!reserveForm.hour || !reserveForm.field)
    ) {
      toast({
        variant: "destructive",
        title: "¡Ha ocurrido un error!",
        description: "Debes completar todos los campos antes de pasar al pago",
      });
      return undefined;
    }
    if (currentStep !== STEPS.reserve) {
      return goToNextStep();
    }
  };
  const actionLabel = useMemo(() => {
    if (currentStep === STEPS.reserve) {
      return undefined;
    }
    return "Siguiente";
  }, [currentStep]);

  const secondaryActionLabel = useMemo(() => {
    if (currentStep === STEPS.date) {
      return undefined;
    }
    return "Anterior";
  }, [currentStep]);

  //content Reserve

  let title = "Elige una fecha";

  let bodyContent = (
    <Calendar scheduleDays={scheduleDays} unavailableDays={unavailableDays} />
  );

  if (currentStep === STEPS.hour) {
    title = "Elige un horario";
    bodyContent = (
      <AvailableTurns fixedSchedules={fixedSchedules} schedules={schedules} />
    );
  }

  if (currentStep === STEPS.field) {
    title = "Elige una cancha";

    bodyContent = <AvailableFields />;
  }

  if (currentStep === STEPS.reserve) {
    title = "Confirma tu reserva";

    bodyContent = (
      <ReserveTurn currentUser={currentUser} schedules={schedules} />
    );
  }

  const headerContent = (
    <Stepper currentStep={currentStep} numberOfSteps={NUMBER_OF_STEPS}>
      <Steps currentStep={currentStep} index={0}>
        <CalendarDays size={25} />
      </Steps>
      <Steps currentStep={currentStep} index={1}>
        <Clock9 size={25} />
      </Steps>
      <Steps currentStep={currentStep} index={2}>
        <GiSoccerField size={30} />
      </Steps>
      <Steps currentStep={currentStep} index={3}>
        <ShoppingCart size={25} />
      </Steps>
    </Stepper>
  );
  return (
    <Modal
      title={title}
      isOpen={isOpenReserve}
      onClose={oncloseReserve}
      header={headerContent}
      onSubmit={onSubmit}
      actionLabel={actionLabel}
      body={bodyContent}
      secondaryAction={
        currentStep === STEPS.date ? undefined : goToPreviousStep
      }
      secondaryActionLabel={secondaryActionLabel}
    />
  );
};

export default ReserveModal;
