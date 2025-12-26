"use client";

import { useEffect, useState, useTransition } from "react";
import { Promotion, deactivatePromotion, deletePromotion, updatePromotion } from "@/services/promotion/promotion";
import { usePromotionStore } from "@/store/settings/promotionStore";
import { PromotionCard } from "./promotionCard";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Search, Filter } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface EditPromotionsProps {
    initialData: Promotion[];
}

const EditPromotions = ({ initialData }: EditPromotionsProps) => {
    const { promotions, setPromotions, updatePromotion: updateInStore, deletePromotion: deleteFromStore, togglePromotionStatus } = usePromotionStore();

    const [isPending, startTransition] = useTransition();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");

    // Estados para modales
    const [promotionToDelete, setPromotionToDelete] = useState<Promotion | null>(null);
    const [promotionToEdit, setPromotionToEdit] = useState<Promotion | null>(null);
    const [editForm, setEditForm] = useState({ name: "", description: "", value: 0 });

    useEffect(() => {
        // Siempre actualizar con los datos del servidor
        setPromotions(initialData);
    }, [initialData, setPromotions]);

    // Filtrar promociones
    const filteredPromotions = promotions.filter((promo) => {
        const matchesSearch =
            promo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            promo.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            promo.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = filterType === "all" || promo.type === filterType;
        const matchesStatus =
            filterStatus === "all" ||
            (filterStatus === "active" && promo.isActive) ||
            (filterStatus === "inactive" && !promo.isActive);

        return matchesSearch && matchesType && matchesStatus;
    });

    const handleToggleStatus = async (promotion: Promotion) => {
        startTransition(async () => {
            try {
                if (promotion.isActive) {
                    const result = await deactivatePromotion(promotion.id);
                    if (result.success) {
                        togglePromotionStatus(promotion.id);
                        toast.success("Promoción desactivada");
                    } else {
                        toast.error(result.error || "Error al desactivar");
                    }
                } else {
                    const result = await updatePromotion(promotion.id, { isActive: true });
                    if (result.success) {
                        togglePromotionStatus(promotion.id);
                        toast.success("Promoción activada");
                    } else {
                        toast.error(result.error || "Error al activar");
                    }
                }
            } catch (error) {
                toast.error("Error inesperado");
                console.error(error);
            }
        });
    };

    const handleDelete = async () => {
        if (!promotionToDelete) return;

        startTransition(async () => {
            try {
                const result = await deletePromotion(promotionToDelete.id);
                if (result.success) {
                    deleteFromStore(promotionToDelete.id);
                    toast.success("Promoción eliminada");
                } else {
                    toast.error(result.error || "Error al eliminar");
                }
            } catch (error) {
                toast.error("Error inesperado");
                console.error(error);
            } finally {
                setPromotionToDelete(null);
            }
        });
    };

    const handleEdit = (promotion: Promotion) => {
        setPromotionToEdit(promotion);
        setEditForm({
            name: promotion.name,
            description: promotion.description || "",
            value: promotion.value || 0,
        });
    };

    const handleSaveEdit = async () => {
        if (!promotionToEdit) return;

        startTransition(async () => {
            try {
                const result = await updatePromotion(promotionToEdit.id, editForm);
                if (result.success && result.data) {
                    updateInStore(promotionToEdit.id, result.data);
                    toast.success("Promoción actualizada");
                    setPromotionToEdit(null);
                } else {
                    toast.error(result.error || "Error al actualizar");
                }
            } catch (error) {
                toast.error("Error inesperado");
                console.error(error);
            }
        });
    };

    return (
        <div className="space-y-4">
            {/* Filtros y búsqueda */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Buscar por nombre, código..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <div className="flex gap-2">
                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-[140px]">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="PERCENTAGE_DISCOUNT">% Descuento</SelectItem>
                            <SelectItem value="FIXED_AMOUNT_DISCOUNT">$ Descuento</SelectItem>
                            <SelectItem value="FIXED_PRICE">Precio Fijo</SelectItem>
                            <SelectItem value="GIFT_PRODUCT">Regalo</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="active">Activas</SelectItem>
                            <SelectItem value="inactive">Inactivas</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Lista de promociones */}
            {filteredPromotions.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-lg">No hay promociones</p>
                    <p className="text-gray-400 text-sm mt-1">
                        {searchTerm || filterType !== "all" || filterStatus !== "all"
                            ? "Intenta ajustar los filtros"
                            : "Crea tu primera promoción arriba"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredPromotions.map((promotion) => (
                        <PromotionCard
                            key={promotion.id}
                            promotion={promotion}
                            onEdit={handleEdit}
                            onToggleStatus={handleToggleStatus}
                            onDelete={setPromotionToDelete}
                        />
                    ))}
                </div>
            )}

            {/* Contador */}
            {promotions.length > 0 && (
                <p className="text-sm text-gray-500 text-center">
                    Mostrando {filteredPromotions.length} de {promotions.length} promociones
                </p>
            )}

            {/* Modal de confirmación para eliminar */}
            <AlertDialog open={!!promotionToDelete} onOpenChange={() => setPromotionToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar promoción?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. La promoción &quot;{promotionToDelete?.name}&quot; será eliminada permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Eliminando...
                                </>
                            ) : (
                                "Eliminar"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Modal de edición rápida */}
            <Dialog open={!!promotionToEdit} onOpenChange={() => setPromotionToEdit(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Promoción</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Nombre</Label>
                            <Input
                                id="edit-name"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Descripción</Label>
                            <Textarea
                                id="edit-description"
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                rows={2}
                            />
                        </div>
                        {promotionToEdit?.type !== "GIFT_PRODUCT" && (
                            <div className="space-y-2">
                                <Label htmlFor="edit-value">
                                    {promotionToEdit?.type === "PERCENTAGE_DISCOUNT" ? "Porcentaje" : "Monto"}
                                </Label>
                                <Input
                                    id="edit-value"
                                    type="number"
                                    value={editForm.value}
                                    onChange={(e) => setEditForm({ ...editForm, value: Number(e.target.value) })}
                                />
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setPromotionToEdit(null)} disabled={isPending}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSaveEdit} disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                "Guardar"
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EditPromotions;
