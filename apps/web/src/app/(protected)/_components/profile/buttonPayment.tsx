"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRightCircle } from "lucide-react";

interface ButtonPaymentProps {
  paymentUrl: string;
}

export const ButtonPayment = ({ paymentUrl }: ButtonPaymentProps) => {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.push(paymentUrl)}
      className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700 hover:cursor-pointer w-full sm:w-auto text-sm sm:text-base py-2 px-3 sm:px-4"
    >
      <ArrowRightCircle className="h-4 w-4 flex-shrink-0" />
      <span className="hidden sm:inline">Continuar pago</span>
      <span className="inline sm:hidden">Pagar</span>
    </Button>
  );
};
