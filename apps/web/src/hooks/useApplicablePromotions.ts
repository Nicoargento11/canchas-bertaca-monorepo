import { useMemo } from "react";
import { Promotion } from "@/services/promotion/promotion";

interface UseApplicablePromotionsParams {
    promotions: Promotion[] | undefined;
    date: Date | undefined;
    schedule: string | undefined; // formato "HH:MM - HH:MM"
    courtId?: string;
    sportTypeId?: string;
}

interface UseApplicablePromotionsResult {
    applicablePromotions: Promotion[];
    bestPromotion: Promotion | null;
    hasPromotions: boolean;
    calculateFinalPrice: (originalPrice: number) => {
        originalPrice: number;
        discount: number;
        finalPrice: number;
        promotionApplied: Promotion | null;
    };
}

/**
 * Hook para determinar qué promociones aplican según el contexto de la reserva
 */
export function useApplicablePromotions({
    promotions,
    date,
    schedule,
    courtId,
    sportTypeId,
}: UseApplicablePromotionsParams): UseApplicablePromotionsResult {
    const applicablePromotions = useMemo(() => {
        if (!promotions || promotions.length === 0 || !date) {
            return [];
        }

        return promotions.filter((promo) => {
            // 0. Verificar que la promo tenga al menos una restricción de reserva
            // Si no tiene ninguna, es una promo genérica/de productos y no aplica a reservas
            const hasReservationRestrictions =
                promo.courtId ||
                promo.sportTypeId ||
                promo.startTime ||
                promo.endTime ||
                (promo.daysOfWeek && promo.daysOfWeek.length > 0 && promo.daysOfWeek.length < 7);

            if (!hasReservationRestrictions) return false;

            // 1. Verificar que esté activa
            if (!promo.isActive) return false;

            // 2. Verificar rango de fechas
            if (promo.validFrom) {
                const validFrom = new Date(promo.validFrom);
                if (date < validFrom) return false;
            }
            if (promo.validTo) {
                const validTo = new Date(promo.validTo);
                validTo.setHours(23, 59, 59); // Incluir todo el día
                if (date > validTo) return false;
            }

            // 3. Verificar día de la semana
            if (promo.daysOfWeek && promo.daysOfWeek.length > 0) {
                const dayOfWeek = date.getDay(); // 0 = Domingo
                if (!promo.daysOfWeek.includes(dayOfWeek)) return false;
            }

            // 4. Verificar rango horario (si hay schedule)
            if (schedule && (promo.startTime || promo.endTime)) {
                // Extraer hora de inicio del schedule (formato "14:00 - 15:00")
                const scheduleStartTime = schedule.split(" - ")[0];

                if (promo.startTime && scheduleStartTime < promo.startTime) return false;
                if (promo.endTime && scheduleStartTime >= promo.endTime) return false;
            }

            // 5. Verificar filtro de cancha (si aplica)
            if (promo.courtId && courtId && promo.courtId !== courtId) return false;

            // 6. Verificar filtro de tipo de deporte (si aplica)
            if (promo.sportTypeId && sportTypeId && promo.sportTypeId !== sportTypeId) return false;

            return true;
        });
    }, [promotions, date, schedule, courtId, sportTypeId]);

    // Encontrar la mejor promoción (mayor descuento)
    const bestPromotion = useMemo(() => {
        if (applicablePromotions.length === 0) return null;
        if (applicablePromotions.length === 1) return applicablePromotions[0];

        // Para comparar, asumimos un precio base de 10000 y vemos cuál da más descuento
        const testPrice = 10000;
        let best: Promotion | null = null;
        let bestDiscount = 0;

        for (const promo of applicablePromotions) {
            let discount = 0;

            switch (promo.type) {
                case "PERCENTAGE_DISCOUNT":
                    discount = testPrice * ((promo.value || 0) / 100);
                    break;
                case "FIXED_AMOUNT_DISCOUNT":
                    discount = promo.value || 0;
                    break;
                case "FIXED_PRICE":
                    discount = testPrice - (promo.value || testPrice);
                    break;
                case "GIFT_PRODUCT":
                    // Los productos regalo no compiten por "mejor descuento"
                    // pero igual los incluimos si no hay otro
                    discount = 0;
                    break;
            }

            if (discount > bestDiscount || (!best && promo.type === "GIFT_PRODUCT")) {
                bestDiscount = discount;
                best = promo;
            }
        }

        return best;
    }, [applicablePromotions]);

    // Función para calcular precio final
    const calculateFinalPrice = useMemo(() => {
        return (originalPrice: number) => {
            if (!bestPromotion) {
                return {
                    originalPrice,
                    discount: 0,
                    finalPrice: originalPrice,
                    promotionApplied: null,
                };
            }

            let discount = 0;
            let finalPrice = originalPrice;

            switch (bestPromotion.type) {
                case "PERCENTAGE_DISCOUNT":
                    discount = Math.round(originalPrice * ((bestPromotion.value || 0) / 100));
                    finalPrice = originalPrice - discount;
                    break;
                case "FIXED_AMOUNT_DISCOUNT":
                    discount = bestPromotion.value || 0;
                    finalPrice = Math.max(0, originalPrice - discount);
                    break;
                case "FIXED_PRICE":
                    finalPrice = bestPromotion.value || originalPrice;
                    discount = originalPrice - finalPrice;
                    break;
                case "GIFT_PRODUCT":
                    // No hay descuento monetario, pero hay regalo
                    discount = 0;
                    finalPrice = originalPrice;
                    break;
            }

            return {
                originalPrice,
                discount,
                finalPrice,
                promotionApplied: bestPromotion,
            };
        };
    }, [bestPromotion]);

    return {
        applicablePromotions,
        bestPromotion,
        hasPromotions: applicablePromotions.length > 0,
        calculateFinalPrice,
    };
}

/**
 * Función utilitaria para verificar rápidamente si un horario tiene promo
 * (para mostrar badge genérico sin necesidad del hook completo)
 */
export function hasPromotionForSchedule(
    promotions: Promotion[] | undefined,
    date: Date,
    schedule: string
): boolean {
    if (!promotions || promotions.length === 0) return false;

    const scheduleStartTime = schedule.split(" - ")[0];
    const dayOfWeek = date.getDay();

    return promotions.some((promo) => {
        // Verificar que tenga restricciones de reserva (no es promo genérica/de productos)
        const hasReservationRestrictions =
            promo.courtId ||
            promo.sportTypeId ||
            promo.startTime ||
            promo.endTime ||
            (promo.daysOfWeek && promo.daysOfWeek.length > 0 && promo.daysOfWeek.length < 7);

        if (!hasReservationRestrictions) return false;

        if (!promo.isActive) return false;

        // Verificar fechas
        if (promo.validFrom && date < new Date(promo.validFrom)) return false;
        if (promo.validTo) {
            const validTo = new Date(promo.validTo);
            validTo.setHours(23, 59, 59);
            if (date > validTo) return false;
        }

        // Verificar día
        if (promo.daysOfWeek && promo.daysOfWeek.length > 0) {
            if (!promo.daysOfWeek.includes(dayOfWeek)) return false;
        }

        // Verificar hora
        if (promo.startTime && scheduleStartTime < promo.startTime) return false;
        if (promo.endTime && scheduleStartTime >= promo.endTime) return false;

        return true;
    });
}

/**
 * Función que devuelve la promoción específica que aplica para un horario
 * (para mostrar detalles de la promo en el selector de complejo)
 */
export function getPromotionForSchedule(
    promotions: Promotion[] | undefined,
    date: Date,
    schedule: string
): Promotion | null {
    if (!promotions || promotions.length === 0) return null;

    const scheduleStartTime = schedule.split(" - ")[0];
    const dayOfWeek = date.getDay();

    return promotions.find((promo) => {
        const hasReservationRestrictions =
            promo.courtId ||
            promo.sportTypeId ||
            promo.startTime ||
            promo.endTime ||
            (promo.daysOfWeek && promo.daysOfWeek.length > 0 && promo.daysOfWeek.length < 7);

        if (!hasReservationRestrictions) return false;
        if (!promo.isActive) return false;

        if (promo.validFrom && date < new Date(promo.validFrom)) return false;
        if (promo.validTo) {
            const validTo = new Date(promo.validTo);
            validTo.setHours(23, 59, 59);
            if (date > validTo) return false;
        }

        if (promo.daysOfWeek && promo.daysOfWeek.length > 0) {
            if (!promo.daysOfWeek.includes(dayOfWeek)) return false;
        }

        if (promo.startTime && scheduleStartTime < promo.startTime) return false;
        if (promo.endTime && scheduleStartTime >= promo.endTime) return false;

        return true;
    }) || null;
}
