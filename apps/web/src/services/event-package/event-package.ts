import api from "../api";

export interface EventPackage {
    id: string;
    name: string;
    description?: string;
    courtCount?: number | null;
    courtType?: string | null;
    durationHours: number;
    basePrice: number;
    lightPrice: number;
    includes: string[];
    allowExtras: boolean;
    isActive: boolean;
    complexId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateEventPackageDto {
    name: string;
    description?: string;
    courtCount?: number | null;
    courtType?: string | null;
    durationHours: number;
    basePrice: number;
    lightPrice: number;
    includes: string[];
    allowExtras?: boolean;
    isActive?: boolean;
    complexId: string;
}

export interface UpdateEventPackageDto extends Partial<CreateEventPackageDto> { }

type EventPackageResult<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};

export const getAllEventPackages = async (complexId?: string): Promise<EventPackageResult<EventPackage[]>> => {
    try {
        const params = complexId ? { complexId } : {};
        const response = await api.get("/event-packages", { params });
        return { success: true, data: response.data };
    } catch (error: any) {
        return { success: false, error: error.response?.data?.message || "Error fetching event packages" };
    }
};

export const getActiveEventPackages = async (complexId: string): Promise<EventPackageResult<EventPackage[]>> => {
    try {
        const response = await api.get(`/event-packages/active/${complexId}`);
        return { success: true, data: response.data };
    } catch (error: any) {
        return { success: false, error: error.response?.data?.message || "Error fetching active packages" };
    }
};

export const getEventPackageById = async (id: string): Promise<EventPackageResult<EventPackage>> => {
    try {
        const response = await api.get(`/event-packages/${id}`);
        return { success: true, data: response.data };
    } catch (error: any) {
        return { success: false, error: error.response?.data?.message || "Error fetching package" };
    }
};

export const createEventPackage = async (data: CreateEventPackageDto): Promise<EventPackageResult<EventPackage>> => {
    try {
        const response = await api.post("/event-packages", data);
        return { success: true, data: response.data };
    } catch (error: any) {
        return { success: false, error: error.response?.data?.message || "Error creating package" };
    }
};

export const updateEventPackage = async (id: string, data: UpdateEventPackageDto): Promise<EventPackageResult<EventPackage>> => {
    try {
        const response = await api.patch(`/event-packages/${id}`, data);
        return { success: true, data: response.data };
    } catch (error: any) {
        return { success: false, error: error.response?.data?.message || "Error updating package" };
    }
};

export const toggleEventPackageStatus = async (id: string): Promise<EventPackageResult<EventPackage>> => {
    try {
        const response = await api.patch(`/event-packages/${id}/toggle-active`);
        return { success: true, data: response.data };
    } catch (error: any) {
        return { success: false, error: error.response?.data?.message || "Error toggling status" };
    }
};

export const deleteEventPackage = async (id: string): Promise<EventPackageResult> => {
    try {
        await api.delete(`/event-packages/${id}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.response?.data?.message || "Error deleting package" };
    }
};
