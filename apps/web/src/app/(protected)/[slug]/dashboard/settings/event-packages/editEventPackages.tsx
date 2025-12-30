"use client";

import { useEffect, useState, useTransition } from "react";
import {
  EventPackage,
  deleteEventPackage,
  toggleEventPackageStatus,
} from "@/services/event-package/event-package";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Search,
  Filter,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Clock,
  DollarSign,
  Lightbulb,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface EditEventPackagesProps {
  initialData: EventPackage[];
  onEdit: (eventPackage: EventPackage) => void;
}

const EditEventPackages = ({ initialData, onEdit }: EditEventPackagesProps) => {
  const [eventPackages, setEventPackages] = useState<EventPackage[]>(initialData);
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [packageToDelete, setPackageToDelete] = useState<EventPackage | null>(null);

  useEffect(() => {
    setEventPackages(initialData);
  }, [initialData]);

  // Filtrar paquetes
  const filteredPackages = eventPackages.filter((pkg) => {
    const matchesSearch =
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && pkg.isActive) ||
      (filterStatus === "inactive" && !pkg.isActive);

    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = async (pkg: EventPackage) => {
    startTransition(async () => {
      try {
        const result = await toggleEventPackageStatus(pkg.id);
        if (result.success && result.data) {
          setEventPackages((prev) =>
            prev.map((p) => (p.id === pkg.id ? { ...p, isActive: result.data!.isActive } : p))
          );
          toast.success(`Paquete ${result.data.isActive ? "activado" : "desactivado"}`);
        } else {
          toast.error(result.error || "Error al cambiar estado");
        }
      } catch (error) {
        toast.error("Error inesperado");
        console.error(error);
      }
    });
  };

  const handleDelete = async () => {
    if (!packageToDelete) return;

    startTransition(async () => {
      try {
        const result = await deleteEventPackage(packageToDelete.id);
        if (result.success) {
          setEventPackages((prev) => prev.filter((p) => p.id !== packageToDelete.id));
          toast.success("Paquete eliminado");
        } else {
          toast.error(result.error || "Error al eliminar");
        }
      } catch (error) {
        toast.error("Error inesperado");
        console.error(error);
      } finally {
        setPackageToDelete(null);
      }
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-4">
      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de paquetes */}
      {filteredPackages.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No hay paquetes de eventos</p>
          <p className="text-gray-400 text-sm mt-1">
            {searchTerm || filterStatus !== "all"
              ? "Intenta ajustar los filtros"
              : "Crea tu primer paquete arriba"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPackages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`transition-all hover:shadow-lg ${!pkg.isActive ? "opacity-60" : ""}`}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">{pkg.name}</h3>
                      <Badge variant={pkg.isActive ? "default" : "secondary"}>
                        {pkg.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    {pkg.description && <p className="text-sm text-gray-600">{pkg.description}</p>}
                  </div>
                </div>

                {/* Información del paquete */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{pkg.durationHours}h de duración</span>
                  </div>

                  {pkg.courtCount && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">
                        {pkg.courtCount} {pkg.courtCount === 1 ? "cancha" : "canchas"}
                      </span>
                      {pkg.courtType && <span className="text-gray-600">({pkg.courtType})</span>}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-600">Base</p>
                        <p className="font-semibold text-green-700">{formatPrice(pkg.basePrice)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-600" />
                      <div>
                        <p className="text-xs text-gray-600">Con luces</p>
                        <p className="font-semibold text-yellow-700">
                          {formatPrice(pkg.lightPrice)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Items incluidos */}
                  <div className="pt-3 border-t">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Incluye:</p>
                    <div className="flex flex-wrap gap-1">
                      {pkg.includes.map((item, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {pkg.allowExtras && (
                    <Badge variant="secondary" className="text-xs">
                      ✓ Permite extras
                    </Badge>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(pkg)}
                    className="flex-1"
                    disabled={isPending}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(pkg)}
                    disabled={isPending}
                    className={pkg.isActive ? "text-orange-600" : "text-green-600"}
                  >
                    {pkg.isActive ? (
                      <PowerOff className="h-3 w-3 mr-1" />
                    ) : (
                      <Power className="h-3 w-3 mr-1" />
                    )}
                    {pkg.isActive ? "Desactivar" : "Activar"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPackageToDelete(pkg)}
                    disabled={isPending}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={!!packageToDelete} onOpenChange={() => setPackageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el paquete "{packageToDelete?.name}". Esta
              acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditEventPackages;
