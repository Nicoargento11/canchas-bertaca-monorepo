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
import { XCircle } from "lucide-react";
import { toast } from "sonner";
import { deleteReserve } from "@/services/reserve/reserve";

interface ButtonCancelProps {
  reserveId: string;
  deleteReserve: (id: string) => void;
}

export const ButtonCancel = ({
  reserveId,
  deleteReserve: deleteReserveInfo,
}: ButtonCancelProps) => {
  const handleCancel = async (reserveId: string) => {
    await deleteReserve(reserveId).then((data) => {
      if (!data.success) {
        toast.error(data.error);
        return;
      }
      toast.success("Reserva cancelada con éxito");
      deleteReserveInfo(reserveId);
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 border-red-300 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 hover:cursor-pointer w-full sm:w-auto text-sm sm:text-base py-2 px-3 sm:px-4"
        >
          <XCircle className="h-4 w-4 flex-shrink-0" />
          <span className="hidden sm:inline">Cancelar reserva</span>
          <span className="inline sm:hidden">Cancelar</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600">¿Cancelar reserva?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente tu reserva.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Volver</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700"
            onClick={() => handleCancel(reserveId)}
          >
            Confirmar cancelación
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
