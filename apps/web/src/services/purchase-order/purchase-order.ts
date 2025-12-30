import api from "../api";
import { PaymentMethod } from "../payment/payment";

export interface PurchaseOrderItem {
    id: string;
    productId: string;
    productName?: string;
    quantity: number;
    unitCost: number;
    subtotal: number;
}

export interface PurchaseOrder {
    id: string;
    orderNumber: string;
    supplier: string;
    totalAmount: number;
    notes?: string;
    complexId: string;
    items: PurchaseOrderItem[];
    payment?: any;
    createdBy?: {
        id: string;
        name: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface CreatePurchaseOrderItem {
    productId: string;
    quantity: number;
    unitCost: number;
}

export interface CreatePurchaseOrderData {
    supplier: string;
    notes?: string;
    complexId: string;
    items: CreatePurchaseOrderItem[];
    paymentMethod: PaymentMethod;
    cashSessionId?: string;
}

type PurchaseOrderResult<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};

export const createPurchaseOrder = async (
    data: CreatePurchaseOrderData
): Promise<PurchaseOrderResult<PurchaseOrder>> => {
    try {
        const response = await api.post("/purchase-orders", data);
        return { success: true, data: response.data };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.message || "Error al crear la orden de compra",
        };
    }
};

export const getPurchaseOrders = async (
    complexId: string,
    filters?: {
        startDate?: string;
        endDate?: string;
        supplier?: string;
    }
): Promise<PurchaseOrderResult<PurchaseOrder[]>> => {
    try {
        const params = new URLSearchParams({ complexId });
        if (filters?.startDate) params.append("startDate", filters.startDate);
        if (filters?.endDate) params.append("endDate", filters.endDate);
        if (filters?.supplier) params.append("supplier", filters.supplier);

        const response = await api.get(`/purchase-orders?${params.toString()}`);
        return { success: true, data: response.data };
    } catch (error: any) {
        return {
            success: false,
            error: error.response?.data?.message || "Error al obtener órdenes de compra",
        };
    }
};
