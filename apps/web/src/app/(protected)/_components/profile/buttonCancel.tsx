import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import React from "react";
import { XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteReserve } from "@/services/reserves/reserves";

interface ButtonPaymentProps {
  reserveId: string;
  deleteReserve: (id: string) => void;
}
export const ButtonCancel = ({
  reserveId,
  deleteReserve: deleteReserveInfo,
}: ButtonPaymentProps) => {
  const { toast } = useToast();
  const handleCancel = async (reserveId: string) => {
    await deleteReserve(reserveId).then((data) => {
      toast({
        duration: 3000,
        variant: "default",
        title: "",
        description: data?.succes || data.error,
      });
      deleteReserveInfo(reserveId);
    });
  };
  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            className={`flex sm:absolute right-2 lg:right-2 bottom-12 lg:bottom-14 gap-2 bg-gray-300 border-r-1 border-b-1 border-gray-400 shadow-lg rounded-2xl text-red-700 font-semibold py-1 px-2 lg:py-2 lg:px-4`}
          >
            <XCircle color="red" size={20} />
            <p className="hidden lg:block">Cancelar reserva</p>
            <p className="block lg:hidden">Cancelar</p>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              ¿Estás seguro de cancelar la reserva?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              tu reserva.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500"
              onClick={() => {
                handleCancel(reserveId);
              }}
            >
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
