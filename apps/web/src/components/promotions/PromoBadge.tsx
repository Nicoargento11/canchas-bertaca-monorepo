"use client";

import { Gift, Percent } from "lucide-react";

interface PromoBadgeProps {
    /** Mostrar solo icono sin texto */
    iconOnly?: boolean;
    /** Tamaño del badge */
    size?: "sm" | "md";
    /** Clase CSS adicional */
    className?: string;
}

/**
 * Badge genérico para indicar que hay promoción disponible
 * Se usa en horarios y complejos (sin mostrar detalle)
 */
export function PromoBadge({ iconOnly = false, size = "sm", className = "" }: PromoBadgeProps) {
    const sizeClasses = {
        sm: "text-xs px-1.5 py-0.5",
        md: "text-sm px-2 py-1",
    };

    const iconSize = size === "sm" ? 12 : 14;

    if (iconOnly) {
        return (
            <span
                className={`inline-flex items-center justify-center bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full w-5 h-5 ${className}`}
                title="Promoción disponible"
            >
                <Percent size={12} />
            </span>
        );
    }

    return (
        <span
            className={`inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold rounded-full ${sizeClasses[size]} ${className}`}
        >
            <Gift size={iconSize} />
            <span>Promo</span>
        </span>
    );
}
