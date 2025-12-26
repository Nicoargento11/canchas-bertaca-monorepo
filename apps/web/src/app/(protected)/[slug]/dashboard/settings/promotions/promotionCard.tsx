"use client";

import { Promotion, getPromotionTypeBadgeColor, getPromotionTypeLabel, formatPromotionValue, getDayNames } from "@/services/promotion/promotion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar, Clock, Edit2, Percent, Power, Trash2, Gift, DollarSign, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromotionCardProps {
    promotion: Promotion;
    onEdit?: (promotion: Promotion) => void;
    onToggleStatus?: (promotion: Promotion) => void;
    onDelete?: (promotion: Promotion) => void;
}

export const PromotionCard = ({
    promotion,
    onEdit,
    onToggleStatus,
    onDelete
}: PromotionCardProps) => {
    const colors = getPromotionTypeBadgeColor(promotion.type);

    const getTypeIcon = () => {
        switch (promotion.type) {
            case "PERCENTAGE_DISCOUNT":
                return <Percent className="h-4 w-4" />;
            case "FIXED_AMOUNT_DISCOUNT":
                return <DollarSign className="h-4 w-4" />;
            case "FIXED_PRICE":
                return <Tag className="h-4 w-4" />;
            case "GIFT_PRODUCT":
                return <Gift className="h-4 w-4" />;
            default:
                return <Percent className="h-4 w-4" />;
        }
    };

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "short",
        });
    };

    const hasDateRange = promotion.validFrom || promotion.validTo;
    const hasTimeRange = promotion.startTime || promotion.endTime;

    return (
        <Card
            className={cn(
                "relative overflow-hidden transition-all duration-200 hover:shadow-md",
                !promotion.isActive && "opacity-60"
            )}
        >
            {/* Indicador de estado */}
            <div
                className={cn(
                    "absolute top-0 left-0 w-1 h-full",
                    promotion.isActive ? "bg-green-500" : "bg-gray-300"
                )}
            />

            <CardHeader className="pb-2 pl-5">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                                {promotion.name}
                            </h3>
                            {promotion.code && (
                                <Badge variant="outline" className="text-xs">
                                    {promotion.code}
                                </Badge>
                            )}
                        </div>

                        {/* Badge del tipo */}
                        <Badge
                            className={cn(
                                "text-xs font-medium border",
                                colors.bg,
                                colors.text,
                                colors.border
                            )}
                        >
                            {getTypeIcon()}
                            <span className="ml-1">{getPromotionTypeLabel(promotion.type)}</span>
                        </Badge>
                    </div>

                    {/* Valor destacado */}
                    <div className={cn(
                        "px-3 py-1 rounded-lg text-center",
                        colors.bg
                    )}>
                        <span className={cn("text-lg font-bold", colors.text)}>
                            {formatPromotionValue(promotion)}
                        </span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-2 pl-5 space-y-3">
                {/* Descripción */}
                {promotion.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                        {promotion.description}
                    </p>
                )}

                {/* Info de fechas y horarios */}
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    {/* Días de la semana */}
                    <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{getDayNames(promotion.daysOfWeek)}</span>
                    </div>

                    {/* Rango de fechas */}
                    {hasDateRange && (
                        <div className="flex items-center gap-1">
                            <span>📅</span>
                            <span>
                                {formatDate(promotion.validFrom) || "Inicio"} - {formatDate(promotion.validTo) || "Sin fin"}
                            </span>
                        </div>
                    )}

                    {/* Rango horario */}
                    {hasTimeRange && (
                        <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                                {promotion.startTime || "00:00"} - {promotion.endTime || "23:59"}
                            </span>
                        </div>
                    )}
                </div>

                {/* Filtros aplicados */}
                <div className="flex flex-wrap gap-2">
                    {promotion.sportType && (
                        <Badge variant="secondary" className="text-xs">
                            🏃 {promotion.sportType.name}
                        </Badge>
                    )}
                    {promotion.court && (
                        <Badge variant="secondary" className="text-xs">
                            🏟️ {promotion.court.name || `Cancha ${promotion.court.courtNumber}`}
                        </Badge>
                    )}
                    {/* Mostrar múltiples productos regalo o legacy single product */}
                    {promotion.giftProducts && promotion.giftProducts.length > 0 ? (
                        promotion.giftProducts.map((gp) => (
                            <Badge key={gp.productId} variant="secondary" className="text-xs bg-purple-50 text-purple-700">
                                🎁 {gp.quantity}x {gp.product.name}
                            </Badge>
                        ))
                    ) : promotion.giftProduct ? (
                        <Badge variant="secondary" className="text-xs bg-purple-50 text-purple-700">
                            🎁 {promotion.giftProduct.name}
                        </Badge>
                    ) : null}
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleStatus?.(promotion)}
                        className={cn(
                            "text-xs",
                            promotion.isActive
                                ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                : "text-green-600 hover:text-green-700 hover:bg-green-50"
                        )}
                    >
                        <Power className="h-3.5 w-3.5 mr-1" />
                        {promotion.isActive ? "Desactivar" : "Activar"}
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit?.(promotion)}
                        className="text-xs text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                    >
                        <Edit2 className="h-3.5 w-3.5 mr-1" />
                        Editar
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete?.(promotion)}
                        className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Eliminar
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
