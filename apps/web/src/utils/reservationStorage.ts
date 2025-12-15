// utils/reservationStorage.ts
/**
 * Utilidad para manejar el almacenamiento de datos de reserva en localStorage
 * Mantiene 3 espacios independientes para evitar mezcla de datos:
 * - general: reservas sin preselección de complejo
 * - bertaca: reservas con preselección del complejo Bertaca
 * - seven: reservas con preselección del complejo Seven
 */

export type ReservationType = 'general' | 'bertaca' | 'seven';

interface ReservationFormData {
    day?: string; // ISO string de la fecha
    hour?: string;
    field?: string;
    metadata?: Record<string, any>;
}

const STORAGE_KEYS: Record<ReservationType, string> = {
    general: 'reservation_data_general',
    bertaca: 'reservation_data_bertaca',
    seven: 'reservation_data_seven',
};

/**
 * Verifica si localStorage está disponible
 */
function isLocalStorageAvailable(): boolean {
    try {
        const test = '__localStorage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Guarda los datos de reserva en localStorage
 * @param type - Tipo de reserva (general, bertaca, seven)
 * @param data - Datos del formulario a guardar
 */
export function saveReservationData(
    type: ReservationType,
    data: ReservationFormData
): void {
    if (!isLocalStorageAvailable()) {
        console.warn('localStorage no está disponible');
        return;
    }

    try {
        const key = STORAGE_KEYS[type];
        const serialized = JSON.stringify(data);
        localStorage.setItem(key, serialized);
    } catch (error) {
        console.error(`Error al guardar datos de reserva (${type}):`, error);
    }
}

/**
 * Carga los datos de reserva desde localStorage
 * @param type - Tipo de reserva (general, bertaca, seven)
 * @returns Datos del formulario o null si no hay datos guardados
 */
export function loadReservationData(
    type: ReservationType
): ReservationFormData | null {
    if (!isLocalStorageAvailable()) {
        return null;
    }

    try {
        const key = STORAGE_KEYS[type];
        const stored = localStorage.getItem(key);

        if (!stored) {
            return null;
        }

        const data = JSON.parse(stored) as ReservationFormData;

        // Validación básica de los datos
        if (typeof data !== 'object' || data === null) {
            console.warn(`Datos inválidos en localStorage para ${type}`);
            clearReservationData(type);
            return null;
        }

        return data;
    } catch (error) {
        console.error(`Error al cargar datos de reserva (${type}):`, error);
        return null;
    }
}

/**
 * Limpia los datos de reserva de localStorage
 * @param type - Tipo de reserva (general, bertaca, seven)
 */
export function clearReservationData(type: ReservationType): void {
    if (!isLocalStorageAvailable()) {
        return;
    }

    try {
        const key = STORAGE_KEYS[type];
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Error al limpiar datos de reserva (${type}):`, error);
    }
}

/**
 * Limpia todos los datos de reserva (útil para logout o reset total)
 */
export function clearAllReservationData(): void {
    clearReservationData('general');
    clearReservationData('bertaca');
    clearReservationData('seven');
}
