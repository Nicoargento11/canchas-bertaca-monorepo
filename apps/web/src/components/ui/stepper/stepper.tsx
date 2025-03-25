import React from "react";
import { Progress } from "../progress";

interface StepperProps {
  currentStep: number;
  numberOfSteps: number;
  children: React.ReactNode;
}

export const Stepper = ({
  currentStep,
  numberOfSteps,
  children,
}: StepperProps) => {
  const progressValue = (currentStep / (numberOfSteps - 1)) * 100;

  return (
    <div className="w-full h-max relative mt-5">
      {/* Línea de progreso */}
      <div className="flex items-center absolute justify-center top-1/2 w-full rounded-full bg-Neutral-light z-0">
        <Progress value={progressValue} className="h-2 bg-Neutral-light" />
      </div>

      {/* Pasos */}
      <div className="flex w-full relative items-center justify-between z-10">
        {children}
      </div>
    </div>
  );
};
