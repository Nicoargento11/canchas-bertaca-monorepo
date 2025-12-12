"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Power } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Court, toggleCourtStatusFetch } from "@/services/court/court";
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
import { useCourtStore } from "@/store/settings/courtStore";

interface CanchasTableProps {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string) => void;
}

export function CanchasTable({ onDelete, onEdit, onStatusChange }: CanchasTableProps) {
  const { courts } = useCourtStore();
  const [courtToDelete, setCourtToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteClick = (id: string) => {
    setCourtToDelete(id);
  };

  const confirmDelete = async () => {
    if (courtToDelete !== null) {
      setIsLoading(true);
      try {
        onDelete(courtToDelete);
      } catch (error) {
        toast.error("Error al eliminar la cancha");
      } finally {
        setCourtToDelete(null);
        setIsLoading(false);
      }
    }
  };

  const cancelDelete = () => {
    setCourtToDelete(null);
  };

  const formatCharacteristics = (characteristics: string[]) => {
    if (!characteristics || characteristics.length === 0) return "-";
    return characteristics.join(", ");
  };

  if (courts.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow-sm">
        <p className="text-gray-500">No hay canchas registradas</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Número</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Características</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courts.map((court) => (
              <TableRow key={court.id}>
                <TableCell className="font-medium">{court.courtNumber}</TableCell>
                <TableCell>{court.name || "-"}</TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">
                    {formatCharacteristics(court.characteristics || [])}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={court.isActive ? "default" : "secondary"}
                    className={`min-w-[80px] justify-center ${
                      court.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {court.isActive ? "Activa" : "Inactiva"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(court.id)}
                      disabled={isLoading}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onStatusChange(court.id)}
                      disabled={isLoading}
                    >
                      <Power
                        className={`h-4 w-4 ${
                          court.isActive ? "text-yellow-500" : "text-green-500"
                        }`}
                      />
                      <span className="sr-only">Cambiar estado</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(court.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={courtToDelete !== null} onOpenChange={cancelDelete}>
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
