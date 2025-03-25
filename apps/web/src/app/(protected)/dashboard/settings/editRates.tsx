"use client";

import { useState } from "react";
import { Rate } from "@/services/rate/rate";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteRate, updateRate } from "@/services/rate/rate";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EditRatesProps {
  rates: Rate[];
}

const EditRates = ({ rates }: EditRatesProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<{
    name: string;
    price: number;
    reservationAmount: number;
  }>({
    name: "",
    price: 0,
    reservationAmount: 0,
  });
  const [deleteId, setDeleteId] = useState<string | null>(null); // Estado para controlar el ID a eliminar

  const handleEdit = (rate: Rate) => {
    setEditingId(rate.id);
    setEditedData({
      name: rate.name,
      price: rate.price,
      reservationAmount: rate.reservationAmount,
    });
  };

  const handleSave = async (id: string) => {
    try {
      await updateRate(id, editedData);
      toast({
        title: "Tarifa actualizada",
        description: "La tarifa se ha actualizado correctamente.",
      });
      setEditingId(null);
      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: "No se pudo actualizar la tarifa.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedData({
      name: "",
      price: 0,
      reservationAmount: 0,
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return; // Si no hay ID, no hacer nada

    try {
      await deleteRate(deleteId);
      toast({
        title: "Tarifa eliminada",
        description: "La tarifa se ha eliminado correctamente.",
      });
      setDeleteId(null); // Cerrar el diálogo
      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: "No se pudo eliminar la tarifa.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {rates.length > 0 ? (
        rates.map((rate) => (
          <div
            key={rate.id}
            className="flex justify-between items-center p-4 border border-Primary-extraLight rounded-lg"
          >
            {editingId === rate.id ? (
              // Modo edición
              <div className="space-y-4 w-full">
                {/* Campo: Nombre */}
                <Input
                  value={editedData.name}
                  onChange={(e) =>
                    setEditedData({ ...editedData, name: e.target.value })
                  }
                  placeholder="Nombre de la tarifa"
                  className="w-full"
                />

                {/* Campo: Precio */}
                <Input
                  type="number"
                  value={editedData.price}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      price: Number(e.target.value),
                    })
                  }
                  placeholder="Precio"
                  className="w-full"
                />

                {/* Campo: Monto de reserva */}
                <Input
                  type="number"
                  value={editedData.reservationAmount}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      reservationAmount: Number(e.target.value),
                    })
                  }
                  placeholder="Monto de reserva"
                  className="w-full"
                />

                {/* Botones de guardar y cancelar */}
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    className="bg-green-500 hover:bg-green-600"
                    onClick={() => handleSave(rate.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-500 border-red-300 hover:bg-red-50"
                    onClick={handleCancel}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              // Modo visualización
              <div>
                <p className="text-Primary-dark font-medium">{rate.name}</p>
                <p className="text-sm text-Primary">Precio: ${rate.price}</p>
                <p className="text-sm text-Primary">
                  Monto de reserva: ${rate.reservationAmount}
                </p>
              </div>
            )}

            {/* Botones de editar y eliminar */}
            {editingId !== rate.id && (
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-Primary-light border-Primary-extraLight hover:bg-blue-50"
                  onClick={() => handleEdit(rate)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-500 border-red-300 hover:bg-red-50"
                  onClick={() => setDeleteId(rate.id)} // Abrir el diálogo de confirmación
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="">No hay tarifas creadas</p>
      )}

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La tarifa se eliminará
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDelete}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditRates;
