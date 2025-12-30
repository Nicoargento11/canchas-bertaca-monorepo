import { Reserve } from "../reserve/reserve";

export interface EventCombo {
    id: string;
    name: string;
    description: string;
    courts: number | "ALL";
    courtType?: "FUTBOL_5" | "FUTBOL_7";
    duration: number; // En horas
    basePrice: number; // Sin luz
    lightPrice: number; // Con luz
    includes: string[];
    allowExtras?: boolean;
}

export const EVENT_COMBOS: EventCombo[] = [
    {
        id: "combo-1",
        name: "Combo 1",
        description: "1 Cancha de 5",
        courts: 1,
        courtType: "FUTBOL_5",
        duration: 3,
        basePrice: 75000,
        lightPrice: 105000,
        includes: ["Uso de parrilla", "Sector de mesas y sillas"],
        allowExtras: false,
    },
    {
        id: "combo-2",
        name: "Combo 2",
        description: "2 Canchas de 5",
        courts: 2,
        courtType: "FUTBOL_5",
        duration: 3,
        basePrice: 130000,
        lightPrice: 150000,
        includes: ["Uso de parrilla", "Sector de mesas y sillas"],
        allowExtras: false,
    },
    {
        id: "combo-3",
        name: "Combo 3",
        description: "1 Cancha de 7",
        courts: 1,
        courtType: "FUTBOL_7",
        duration: 3,
        basePrice: 130000,
        lightPrice: 150000,
        includes: ["Uso de parrilla", "Sector de mesas y sillas"],
        allowExtras: false,
    },
    {
        id: "combo-exclusivo",
        name: "Combo Exclusivo",
        description: "Todas las Canchas",
        courts: "ALL",
        duration: 3,
        basePrice: 200000,
        lightPrice: 250000,
        includes: [
            "Uso de parrilla",
            "Sector de mesas y sillas",
            "Podés sumar castillitos, trampolín, juegos, etc.",
        ],
        allowExtras: true,
    },
];

interface CreateEventReservationParams {
    comboId: string;
    date: Date;
    startTime: string; // "15:00"
    withLight: boolean;
    clientName: string;
    clientPhone: string;
    complexId: string;
    userId: string;
    paymentMethod: "EFECTIVO" | "TARJETA_CREDITO" | "TRANSFERENCIA" | "MERCADOPAGO";
    reservationAmount?: number;
    extras?: string;
}

export const createEventReservation = async (
    params: CreateEventReservationParams
): Promise<{ success: boolean; error?: string; data?: Reserve[] }> => {
    try {
        const combo = EVENT_COMBOS.find((c) => c.id === params.comboId);
        if (!combo) {
            return { success: false, error: "Combo no encontrado" };
        }

        // Calcular precio final
        const finalPrice = params.withLight ? combo.lightPrice : combo.basePrice;

        // Calcular horario de fin (startTime + duration)
        const [hours, minutes] = params.startTime.split(":").map(Number);
        const endHour = hours + combo.duration;
        const endTime = `${String(endHour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

        const schedule = `${params.startTime} - ${endTime}`;

        // Generar eventGroupId único para vincular todas las reservas del evento
        const eventGroupId = `event-${Date.now()}`;

        // Aquí necesitaremos obtener las canchas disponibles del complejo
        // Por ahora, retornamos la estructura esperada
        // La implementación real se hará en el modal donde tenemos acceso al complex

        return {
            success: true,
            data: [],
            error: undefined,
        };
    } catch (error) {
        console.error("Error creating event reservation:", error);
        return {
            success: false,
            error: "Error al crear la reserva de evento",
        };
    }
};

export const calculateEventEndTime = (startTime: string, duration: number): string => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const endHour = hours + duration;
    return `${String(endHour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

export const getComboPrice = (combo: EventCombo, withLight: boolean): number => {
    return withLight ? combo.lightPrice : combo.basePrice;
};
