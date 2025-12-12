"use client";

import { useEffect, useState } from "react";
import { deleteRateFetch, Rate, updateRateFetch } from "@/services/rate/rate";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, Check, X } from "lucide-react";
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
import { toast } from "sonner";
import { useRateStore } from "@/store/settings/rateStore";
import { Complex } from "@/services/complex/complex";
import { Loader2 } from "lucide-react";

interface RateProps {
  complex: Complex;
}

const EditRates = ({ complex }: RateProps) => {
  const router = useRouter();
  const { rates, initializeRates, deleteRate, updateRate } = useRateStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editedData, setEditedData] = useState({
    name: "",
    price: 0,
    reservationAmount: 0,
  });

  useEffect(() => {
    initializeRates(complex.rates);
  }, [complex.rates, initializeRates]);

  const handleEdit = (rate: Rate) => {
    setEditingId(rate.id);
    setEditedData({
      name: rate.name,
      price: rate.price,
      reservationAmount: rate.reservationAmount,
    });
  };

  const handleSave = async (id: string) => {
    setIsProcessing(true);
    try {
      const { success, data, error } = await updateRateFetch(id, editedData);
      if (!success || !data) {
        throw new Error(error || "Error al actualizar tarifa");
      }

      updateRate(id, editedData);
      toast.success("Tarifa actualizada correctamente");
      setEditingId(null);
      router.refresh();
    } catch (error) {
      console.error("Error updating rate:", error);
      toast.error(error instanceof Error ? error.message : "Error al actualizar tarifa");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsProcessing(true);
    try {
      const { success, data, error } = await deleteRateFetch(deleteId);
      if (!success || !data) {
        throw new Error(error || "Error al eliminar tarifa");
      }

      deleteRate(deleteId);
      toast.success("Tarifa eliminada correctamente");
      setDeleteId(null);
      router.refresh();
    } catch (error) {
      console.error("Error deleting rate:", error);
      toast.error(error instanceof Error ? error.message : "Error al eliminar tarifa");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Administrar Tarifas</h2>

        {rates.length > 0 ? (
          <div className="space-y-3">
            {rates.map((rate) => (
              <div
                key={rate.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
              >
                {editingId === rate.id ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Nombre</label>
                      <Input
                        value={editedData.name}
                        onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                        placeholder="Nombre de tarifa"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Precio ($)</label>
                        <Input
                          type="number"
                          min="0"
                          value={editedData.price}
                          onChange={(e) =>
                            setEditedData({ ...editedData, price: Number(e.target.value) })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Seña ($)</label>
                        <Input
                          type="number"
                          min="0"
                          value={editedData.reservationAmount}
                          onChange={(e) =>
                            setEditedData({
                              ...editedData,
                              reservationAmount: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleSave(rate.id)}
                        disabled={isProcessing}
                        className="bg-gray-800 hover:bg-gray-700"
                      >
                        {isProcessing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isProcessing}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-800">{rate.name}</h3>
                      <div className="flex gap-4 mt-1">
                        <span className="text-sm text-gray-600">${rate.price}</span>
                        <span className="text-sm text-gray-500">
                          Seña: ${rate.reservationAmount}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(rate)}
                        className="text-gray-700 border-gray-300 hover:bg-gray-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteId(rate.id)}
                        className="text-red-500 border-red-300 hover:bg-red-50"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-gray-500">No hay tarifas registradas</div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-800">Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              ¿Estás seguro de eliminar esta tarifa? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditRates;
