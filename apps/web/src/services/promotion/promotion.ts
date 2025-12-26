import api from "../api";
import axios from "axios";

// Tipos de promoción que coinciden con el backend
export type PromotionType =
    // Para reservas
    | "PERCENTAGE_DISCOUNT"
    | "FIXED_AMOUNT_DISCOUNT"
    | "FIXED_PRICE"
    | "GIFT_PRODUCT"
    // Para productos
    | "PRODUCT_PERCENTAGE"
    | "PRODUCT_FIXED_DISCOUNT"
    | "PRODUCT_BUY_X_PAY_Y"
    | "PRODUCT_FIXED_PRICE";

// Tipo para productos regalo en promoción (nuevo)
export type PromotionGiftProduct = {
    id: string;
    productId: string;
    quantity: number;
    product: { id: string; name: string; salePrice: number };
};

// Input para crear/editar productos regalo
export type GiftProductInput = {
    productId: string;
    quantity: number;
};

export type Promotion = {
    id: string;
    name: string;
    description?: string | null;
    code?: string | null;
    isActive: boolean;
    validFrom?: string | null;
    validTo?: string | null;
    daysOfWeek: number[];
    startTime?: string | null;
    endTime?: string | null;
    complexId: string;
    sportTypeId?: string | null;
    courtId?: string | null;
    type: PromotionType;
    value?: number | null;
    giftProductId?: string | null;
    createdAt: string;
    updatedAt: string;
    // Relaciones opcionales
    complex?: { id: string; name: string };
    sportType?: { id: string; name: string } | null;
    court?: { id: string; name: string | null; courtNumber: number | null } | null;
    giftProduct?: { id: string; name: string; salePrice: number } | null;
    // Nuevo: múltiples productos regalo
    giftProducts?: PromotionGiftProduct[];
    // Para promociones de producto
    targetProductId?: string | null;
    targetProduct?: { id: string; name: string; salePrice: number } | null;
    buyQuantity?: number | null;
    payQuantity?: number | null;
    _count?: {
        reserves: number;
        fixedReserves: number;
        productSales: number;
    };
};

export type CreatePromotionInput = {
    name: string;
    description?: string;
    code?: string;
    isActive?: boolean;
    validFrom?: string;
    validTo?: string;
    daysOfWeek?: number[];
    startTime?: string;
    endTime?: string;
    complexId: string;
    sportTypeId?: string;
    courtId?: string;
    type: PromotionType;
    value?: number;
    giftProductId?: string;
    // Nuevo: múltiples productos regalo
    giftProducts?: GiftProductInput[];
    // Para promociones de producto
    targetProductId?: string;
    buyQuantity?: number;
    payQuantity?: number;
};

export type UpdatePromotionInput = Partial<CreatePromotionInput>;

type PromotionResult<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};

const handlePromotionError = (error: unknown): PromotionResult => {
    if (axios.isAxiosError(error)) {
        if (error.response) {
            const status = error.response.status;
            const message = error.response.data?.message || "Error en la solicitud";

            if (status === 401) return { success: false, error: message || "No autorizado" };
            if (status === 404) return { success: false, error: message || "Promoción no encontrada" };
            if (status === 409)
                return { success: false, error: message || "Ya existe una promoción con ese código" };
            if (status === 400) return { success: false, error: message || "Datos inválidos" };

            return { success: false, error: message };
        }
        return { success: false, error: "Error de conexión" };
    }
    return { success: false, error: "Error desconocido" };
};

/**
 * Obtener todas las promociones de un complejo
 */
export const getPromotions = async (
    complexId?: string,
    onlyActive?: boolean
): Promise<PromotionResult<Promotion[]>> => {
    try {
        const params = new URLSearchParams();
        if (complexId) params.append("complexId", complexId);
        if (onlyActive) params.append("onlyActive", "true");

        const response = await api.get(`/promotions?${params.toString()}`);
        return { success: true, data: response.data };
    } catch (error) {
        return handlePromotionError(error);
    }
};

/**
 * Obtener una promoción por ID
 */
export const getPromotionById = async (id: string): Promise<PromotionResult<Promotion>> => {
    try {
        const response = await api.get(`/promotions/${id}`);
        return { success: true, data: response.data };
    } catch (error) {
        return handlePromotionError(error);
    }
};

/**
 * Buscar promoción por código de cupón
 */
export const getPromotionByCode = async (code: string): Promise<PromotionResult<Promotion>> => {
    try {
        const response = await api.get(`/promotions/code/${code}`);
        return { success: true, data: response.data };
    } catch (error) {
        return handlePromotionError(error);
    }
};

/**
 * Crear una nueva promoción
 */
export const createPromotion = async (
    data: CreatePromotionInput
): Promise<PromotionResult<Promotion>> => {
    try {
        const response = await api.post("/promotions", data);
        return { success: true, data: response.data };
    } catch (error) {
        return handlePromotionError(error);
    }
};

/**
 * Actualizar una promoción
 */
export const updatePromotion = async (
    id: string,
    data: UpdatePromotionInput
): Promise<PromotionResult<Promotion>> => {
    try {
        const response = await api.patch(`/promotions/${id}`, data);
        return { success: true, data: response.data };
    } catch (error) {
        return handlePromotionError(error);
    }
};

/**
 * Desactivar una promoción (soft delete)
 */
export const deactivatePromotion = async (id: string): Promise<PromotionResult<Promotion>> => {
    try {
        const response = await api.patch(`/promotions/${id}/deactivate`);
        return { success: true, data: response.data };
    } catch (error) {
        return handlePromotionError(error);
    }
};

/**
 * Eliminar una promoción permanentemente
 */
export const deletePromotion = async (id: string): Promise<PromotionResult> => {
    try {
        await api.delete(`/promotions/${id}`);
        return { success: true };
    } catch (error) {
        return handlePromotionError(error);
    }
};

/**
 * Obtener estadísticas de uso de una promoción
 */
export const getPromotionStats = async (
    id: string
): Promise<
    PromotionResult<{
        id: string;
        name: string;
        totalReserves: number;
        totalFixedReserves: number;
        totalProductSales: number;
        totalUsage: number;
    }>
> => {
    try {
        const response = await api.get(`/promotions/${id}/stats`);
        return { success: true, data: response.data };
    } catch (error) {
        return handlePromotionError(error);
    }
};

/**
 * Validar si una promoción aplica para una reserva específica
 */
export const validatePromotion = async (data: {
    promotionId: string;
    complexId: string;
    courtId: string;
    sportTypeId: string;
    date: string;
    time: string;
}): Promise<PromotionResult<{ valid: boolean; reason?: string; promotion?: Promotion }>> => {
    try {
        const response = await api.post("/promotions/validate", data);
        return { success: true, data: response.data };
    } catch (error) {
        return handlePromotionError(error);
    }
};

/**
 * Calcular precio con descuento aplicado
 */
export const calculateDiscountedPrice = async (
    originalPrice: number,
    promotionId: string
): Promise<
    PromotionResult<{
        originalPrice: number;
        discountedPrice: number;
        discount: number;
        promotionType: PromotionType;
        promotionName: string;
    }>
> => {
    try {
        const response = await api.post("/promotions/calculate-price", {
            originalPrice,
            promotionId,
        });
        return { success: true, data: response.data };
    } catch (error) {
        return handlePromotionError(error);
    }
};

// Helper para obtener el label del tipo de promoción
export const getPromotionTypeLabel = (type: PromotionType): string => {
    const labels: Record<PromotionType, string> = {
        PERCENTAGE_DISCOUNT: "Descuento %",
        FIXED_AMOUNT_DISCOUNT: "Descuento $",
        FIXED_PRICE: "Precio Fijo",
        GIFT_PRODUCT: "Producto Regalo",
        PRODUCT_PERCENTAGE: "% en Producto",
        PRODUCT_FIXED_DISCOUNT: "$ menos en Producto",
        PRODUCT_BUY_X_PAY_Y: "Llevá X Pagá Y",
        PRODUCT_FIXED_PRICE: "Precio Especial",
    };
    return labels[type] || type;
};

// Helper para obtener el color del badge según el tipo
export const getPromotionTypeBadgeColor = (
    type: PromotionType
): { bg: string; text: string; border: string } => {
    const colors: Record<PromotionType, { bg: string; text: string; border: string }> = {
        PERCENTAGE_DISCOUNT: {
            bg: "bg-green-50",
            text: "text-green-700",
            border: "border-green-200",
        },
        FIXED_AMOUNT_DISCOUNT: {
            bg: "bg-blue-50",
            text: "text-blue-700",
            border: "border-blue-200",
        },
        FIXED_PRICE: {
            bg: "bg-orange-50",
            text: "text-orange-700",
            border: "border-orange-200",
        },
        GIFT_PRODUCT: {
            bg: "bg-purple-50",
            text: "text-purple-700",
            border: "border-purple-200",
        },
        PRODUCT_PERCENTAGE: {
            bg: "bg-teal-50",
            text: "text-teal-700",
            border: "border-teal-200",
        },
        PRODUCT_FIXED_DISCOUNT: {
            bg: "bg-cyan-50",
            text: "text-cyan-700",
            border: "border-cyan-200",
        },
        PRODUCT_BUY_X_PAY_Y: {
            bg: "bg-pink-50",
            text: "text-pink-700",
            border: "border-pink-200",
        },
        PRODUCT_FIXED_PRICE: {
            bg: "bg-amber-50",
            text: "text-amber-700",
            border: "border-amber-200",
        },
    };
    return colors[type] || { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };
};

// Helper para formatear el valor de la promoción
export const formatPromotionValue = (promotion: Promotion): string => {
    switch (promotion.type) {
        case "PERCENTAGE_DISCOUNT":
            return `${promotion.value}% OFF`;
        case "FIXED_AMOUNT_DISCOUNT":
            return `-$${promotion.value?.toLocaleString()}`;
        case "FIXED_PRICE":
            return `$${promotion.value?.toLocaleString()} fijo`;
        case "GIFT_PRODUCT":
            // Priorizar giftProducts (nuevo) sobre giftProduct (legacy)
            if (promotion.giftProducts && promotion.giftProducts.length > 0) {
                return promotion.giftProducts
                    .map(gp => `${gp.quantity}x ${gp.product.name}`)
                    .join(" + ");
            }
            return promotion.giftProduct?.name || "Producto regalo";
        // Promociones de producto
        case "PRODUCT_PERCENTAGE":
            return `${promotion.value}% en ${promotion.targetProduct?.name || "producto"}`;
        case "PRODUCT_FIXED_DISCOUNT":
            return `-$${promotion.value?.toLocaleString()} en ${promotion.targetProduct?.name || "producto"}`;
        case "PRODUCT_BUY_X_PAY_Y":
            return `${promotion.buyQuantity}x${promotion.payQuantity} en ${promotion.targetProduct?.name || "producto"}`;
        case "PRODUCT_FIXED_PRICE":
            return `$${promotion.value?.toLocaleString()} ${promotion.targetProduct?.name || "producto"}`;
        default:
            return "";
    }
};

// Helper para obtener los nombres de los días
export const getDayNames = (daysOfWeek: number[]): string => {
    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    if (daysOfWeek.length === 0 || daysOfWeek.length === 7) return "Todos los días";
    return daysOfWeek.map((d) => dayNames[d]).join(", ");
};
