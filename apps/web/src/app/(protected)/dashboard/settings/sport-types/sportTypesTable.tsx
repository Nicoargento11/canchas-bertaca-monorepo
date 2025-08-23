// components/sport-types/sportTypesList.tsx
"use client";

import { useState } from "react";

import { formatSportTypeName } from "@/services/sport-types/sport-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Power } from "lucide-react";
import { toast } from "sonner";
import { SportType } from "@/services/sport-types/sport-types";
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
import { toggleCourtStatusFetch } from "@/services/court/court";

interface SportTypesListProps {
  initialData: SportType[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (id: string) => void;
}

export function SportTypesList({
  initialData,
  onDelete,
  onEdit,
  onStatusChange,
}: SportTypesListProps) {
  const [sportToDelete, setSportToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteClick = (id: string) => {
    setSportToDelete(id);
  };

  const confirmDelete = async () => {
    if (sportToDelete !== null) {
      setIsLoading(true);
      try {
        onDelete(sportToDelete);
      } catch (error) {
        toast.error("Error al eliminar el deporte");
      } finally {
        setSportToDelete(null);
        setIsLoading(false);
      }
    }
  };

  const cancelDelete = () => {
    setSportToDelete(null);
  };

  const handleToggleStatus = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await toggleCourtStatusFetch(id);
      if (response.success) {
        toast.success("Estado del deporte actualizado");
        onStatusChange?.(id);
      }
    } catch (error) {
      toast.error("Error al cambiar el estado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripcion</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialData.map((sportType) => (
              <TableRow key={sportType.id}>
                <TableCell>{formatSportTypeName(sportType.name)}</TableCell>
                <TableCell>{sportType.description}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      sportType.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {sportType.isActive ? "Activo" : "Inactivo"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {/* <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleStatus(sportType.id)}
                    >
                      <Power className="h-4 w-4" />
                    </Button> */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(sportType.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={sportToDelete !== null} onOpenChange={cancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La cancha será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
