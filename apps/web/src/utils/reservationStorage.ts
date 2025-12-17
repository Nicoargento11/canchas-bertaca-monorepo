// utils/reservationStorage.ts
/**
 * Utilidad para manejar el almacenamiento de datos de reserva en localStorage
 * Mantiene 3 espacios independientes para evitar mezcla de datos:
 * - general: reservas sin preselección de complejo
 * - bertaca: reservas con preselección del complejo Bertaca
 * - seven: reservas con preselección del complejo Seven
 * 
 * Los datos expiran automáticamente después de 15 minutos para evitar confusión
 * con datos obsoletos.
 */

export type ReservationType = 'general' | 'bertaca' | 'seven';

// TTL en milisegundos (15 minutos)
const TTL_DURATION = 15 * 60 * 1000;

interface ReservationFormData {
    day?: string; // ISO string de la fecha
    hour?: string;
    field?: string;
    metadata?: Record<string, any>;
}

interface StoredReservationData extends ReservationFormData {
    _timestamp: number; // Timestamp de cuando se guardó
    _expiresAt: number; // Timestamp de cuando expira
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
 * Guarda los datos de reserva en localStorage con TTL
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
        const now = Date.now();
        const dataWithTTL: StoredReservationData = {
            ...data,
            _timestamp: now,
            _expiresAt: now + TTL_DURATION,
        };
        const serialized = JSON.stringify(dataWithTTL);
        localStorage.setItem(key, serialized);
    } catch (error) {
        console.error(`Error al guardar datos de reserva (${type}):`, error);
    }
}

/**
 * Carga los datos de reserva desde localStorage y valida TTL
 * @param type - Tipo de reserva (general, bertaca, seven)
 * @returns Datos del formulario o null si no hay datos guardados o están expirados
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

        const data = JSON.parse(stored) as StoredReservationData;

        // Validación básica de los datos
        if (typeof data !== 'object' || data === null) {
            console.warn(`Datos inválidos en localStorage para ${type}`);
            clearReservationData(type);
            return null;
        }

        // Verificar si los datos tienen TTL (compatibilidad con datos viejos)
        if (!data._expiresAt) {
            // Datos sin TTL, limpiar y retornar null
            console.warn(`Datos sin TTL en localStorage para ${type}, limpiando...`);
            clearReservationData(type);
            return null;
        }

        // Verificar si los datos expiraron
        const now = Date.now();
        if (now > data._expiresAt) {
            clearReservationData(type);
            return null;
        }

        // Datos válidos y no expirados
        // Remover metadata interna antes de retornar
        const { _timestamp, _expiresAt, ...cleanData } = data;
        return cleanData;
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
