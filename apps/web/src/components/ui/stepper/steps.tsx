import React from "react";

interface StepsProps {
  index: number;
  currentStep: number;
  children?: React.ReactNode;
}

export const Steps = ({ currentStep, index, children }: StepsProps) => {
  const circleColor = (index: number) => {
    if (currentStep >= index) {
      return "bg-Primary text-white"; // Paso completado o actual
    } else {
      return "bg-Neutral-light text-Neutral-dark"; // Paso pendiente
    }
  };

  return (
    <div
      className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-500 ${circleColor(
        index
      )}`}
    >
      {children}
    </div>
  );
};
