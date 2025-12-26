"use client";

import { Promotion, formatPromotionValue, getPromotionTypeLabel } from "@/services/promotion/promotion";
import { Gift, Percent, Tag, DollarSign } from "lucide-react";

interface PromoDetailProps {
    promotion: Promotion;
    /** Modo compacto para mostrar en cards de cancha */
    compact?: boolean;
    className?: string;
}

/**
 * Muestra el detalle de una promoción específica
 * Se usa en la selección de cancha y confirmación
 */
export function PromoDetail({ promotion, compact = false, className = "" }: PromoDetailProps) {
    const getIcon = () => {
        switch (promotion.type) {
            case "PERCENTAGE_DISCOUNT":
                return <Percent size={compact ? 14 : 16} />;
            case "FIXED_AMOUNT_DISCOUNT":
                return <DollarSign size={compact ? 14 : 16} />;
            case "FIXED_PRICE":
                return <Tag size={compact ? 14 : 16} />;
            case "GIFT_PRODUCT":
                return <Gift size={compact ? 14 : 16} />;
        }
    };

    const getColor = () => {
        switch (promotion.type) {
            case "PERCENTAGE_DISCOUNT":
                return "from-green-500 to-emerald-600";
            case "FIXED_AMOUNT_DISCOUNT":
                return "from-blue-500 to-indigo-600";
            case "FIXED_PRICE":
                return "from-purple-500 to-violet-600";
            case "GIFT_PRODUCT":
                return "from-amber-500 to-orange-600";
        }
    };

    if (compact) {
        return (
            <div className={`inline-flex items-center gap-1.5 bg-gradient-to-r ${getColor()} text-white text-xs font-medium px-2 py-1 rounded-full ${className}`}>
                {getIcon()}
                <span>{formatPromotionValue(promotion)}</span>
            </div>
        );
    }

    return (
        <div className={`bg-gradient-to-r ${getColor()} text-white rounded-lg p-3 ${className}`}>
            <div className="flex items-center gap-2 mb-1">
                {getIcon()}
                <span className="font-bold">{promotion.name}</span>
            </div>
            <p className="text-white/90 text-sm">
                {formatPromotionValue(promotion)}
                {promotion.description && ` - ${promotion.description}`}
            </p>
        </div>
    );
}

interface PromoSummaryProps {
    originalPrice: number;
    discount: number;
    finalPrice: number;
    promotion: Promotion;
    className?: string;
}

/**
 * Resumen de precio con descuento aplicado
 * Se usa en el paso de confirmación
 */
export function PromoSummary({
    originalPrice,
    discount,
    finalPrice,
    promotion,
    className = ""
}: PromoSummaryProps) {
    const isGiftPromotion = promotion.type === "GIFT_PRODUCT";

    return (
        <div className={`bg-gradient-to-br ${isGiftPromotion ? "from-amber-900/50 to-orange-900/50 border-amber-500/30" : "from-green-900/50 to-emerald-900/50 border-green-500/30"} border rounded-xl p-4 ${className}`}>
            <div className="flex items-center gap-2 mb-3">
                <div className={`rounded-full p-1.5 ${isGiftPromotion ? "bg-amber-500" : "bg-green-500"}`}>
                    {isGiftPromotion ? <Gift size={16} className="text-white" /> : <Percent size={16} className="text-white" />}
                </div>
                <div className="flex flex-col">
                    <span className={`font-bold ${isGiftPromotion ? "text-amber-400" : "text-green-400"}`}>
                        ¡Promoción aplicada!
                    </span>
                    <span className="text-white/70 text-sm">{promotion.name}</span>
                </div>
            </div>

            <div className="space-y-2">
                {/* Solo mostrar líneas de descuento para promociones que NO son regalo */}
                {!isGiftPromotion && (
                    <>
                        <div className="flex justify-between text-white/60">
                            <span>Precio original:</span>
                            <span className="line-through">
                                ${originalPrice.toLocaleString("es-AR")}
                            </span>
                        </div>

                        <div className="flex justify-between text-green-400">
                            <span className="flex items-center gap-1">
                                <Tag size={14} />
                                Descuento:
                            </span>
                            <span>-${discount.toLocaleString("es-AR")}</span>
                        </div>
                    </>
                )}

                <div className={`${!isGiftPromotion ? "border-t border-green-500/30 pt-2" : ""} flex justify-between text-white font-bold text-lg`}>
                    <span>Precio:</span>
                    <span className={isGiftPromotion ? "text-white" : "text-green-400"}>
                        ${finalPrice.toLocaleString("es-AR")}
                    </span>
                </div>
            </div>

            {isGiftPromotion && (
                <div className="mt-3 space-y-1">
                    {/* Priorizar giftProducts (nuevo) sobre giftProduct (legacy) */}
                    {promotion.giftProducts && promotion.giftProducts.length > 0 ? (
                        promotion.giftProducts.map((gp) => (
                            <div key={gp.productId} className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-2 flex items-center gap-2">
                                <Gift size={16} className="text-amber-400" />
                                <span className="text-amber-300 text-sm">
                                    ¡Incluye {gp.quantity}x {gp.product.name} gratis!
                                </span>
                            </div>
                        ))
                    ) : promotion.giftProduct ? (
                        <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-2 flex items-center gap-2">
                            <Gift size={16} className="text-amber-400" />
                            <span className="text-amber-300 text-sm">
                                ¡Incluye {promotion.giftProduct.name} gratis!
                            </span>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}
