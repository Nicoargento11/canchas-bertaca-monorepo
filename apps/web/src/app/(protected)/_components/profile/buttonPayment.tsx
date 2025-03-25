"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";

import { StepForward } from "lucide-react";

interface ButtonPaymentProps {
  paymentUrl: string;
}
export const ButtonPayment = ({ paymentUrl }: ButtonPaymentProps) => {
  const router = useRouter();
  return (
    <Button
      onClick={() => {
        router.push(paymentUrl);
      }}
      className={`flex sm:absolute right-2 bottom-2 gap-2 bg-gray-300 border-r-1 border-b-1 border-gray-400 shadow-lg rounded-2xl text-blue-700
       font-semibold py-1 px-2 lg:py-2 lg:px-4`}
    >
      <StepForward color="blue" size={20} />
      <p className="hidden lg:block">Continuar pago</p>
      <p className="block lg:hidden">Continuar</p>
    </Button>
  );
};
