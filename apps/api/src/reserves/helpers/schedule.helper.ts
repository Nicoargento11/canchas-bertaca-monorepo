import { Injectable } from '@nestjs/common';
import { Court, FixedReserve, Schedule, User } from '@prisma/client';
import { CourtsService } from 'src/courts/courts.service';
import { ScheduleDayService } from 'src/schedule-days/schedule-days.service';

// Tipos extendidos para claridad
// Reserva fija con usuario y cancha
type FixedReserveEntend = FixedReserve & {
  user: User;
  court: Court; // Esto incluirá todos los campos de Court
};

// Información de horario para un día específico
type ScheduleInfo = {
  id: string;
  dayOfWeek: number;
  isActive: boolean;
  complexId: string;
  createdAt: Date;
  updatedAt: Date;
  fixedReserves: FixedReserveEntend[];
  schedules: Schedule[];
};
@Injectable()
export class ScheduleHelper {
  constructor(
    private readonly scheduleDaysService: ScheduleDayService,
    private readonly courtsService: CourtsService,
  ) {}

  /**
   * Obtiene la información de horarios para un día, complejo y deporte.
   */
  async getScheduleInfo(date: Date, complexId: string, sportTypeId?: string) {
    const dayOfWeek = date.getDay();
    return this.scheduleDaysService.findByDay(
      dayOfWeek,
      complexId,
      sportTypeId,
    );
  }

  /**
   * Devuelve la disponibilidad de horarios y canchas para un día.
   */
  async getAvailableSchedules(
    scheduleInfo: ScheduleInfo,
    reservations: any[],
    complexId: string,
    sportTypeId?: string,
  ) {
    const { fixedReserves, schedules } = scheduleInfo;
    const fixedSchedules = fixedReserves.filter((fixed) => fixed.isActive);
    const allSchedules = this.generateAllSchedules(schedules);
    const allReservations = this.combineReservations(
      reservations,
      fixedSchedules,
    );
    // Devuelve la disponibilidad de cada intervalo horario
    return this.calculateAvailability(
      allSchedules,
      allReservations,
      complexId,
      sportTypeId,
    );
  }

  /**
   * Devuelve las reservas agrupadas por horario.
   */
  getReservationsBySchedule(scheduleInfo: ScheduleInfo, reservations: any[]) {
    const { fixedReserves, schedules } = scheduleInfo;
    const fixedSchedules = fixedReserves.filter((fixed) => fixed.isActive);
    const allSchedules = this.generateAllSchedules(schedules);
    const allReservations = this.combineReservationDetails(
      reservations,
      fixedSchedules,
    );
    return this.groupReservationsBySchedule(allSchedules, allReservations);
  }

  /**
   * Devuelve la disponibilidad de canchas para un horario específico.
   */ async getAvailabilityForSchedule(
    scheduleInfo: ScheduleInfo,
    reservations: any[],
    schedule: string,
    complexId: string,
    sportTypeId?: string,
  ) {
    const [startTime, endTime] = schedule.split(' - ');
    const { fixedReserves } = scheduleInfo;

    // Expandir reservas fijas de múltiples horas y filtrar por el horario solicitado
    const expandedFixedSchedules: any[] = [];
    fixedReserves.forEach((fixed) => {
      if (fixed.isActive) {
        const intervals = this.splitIntoOneHourIntervals(
          fixed.startTime,
          fixed.endTime,
        );

        intervals.forEach((interval) => {
          if (interval === schedule) {
            expandedFixedSchedules.push(fixed);
          }
        });
      }
    });

    // Obtener canchas activas del complejo con filtro por deporte
    const query: any = {
      complexId,
      isActive: true,
    };

    if (sportTypeId) {
      query.sportTypeId = sportTypeId;
    }

    const activeCourts = await this.courtsService.findAll(query);

    // Función mejorada para convertir tiempo "HH:MM" a minutos desde medianoche
    // y manejar horarios que cruzan la medianoche
    const timeToMinutes = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    // Función para verificar si un horario solicitado está dentro de un horario disponible
    const isTimeWithinAvailability = (
      requestedStart: number,
      requestedEnd: number,
      availStart: number,
      availEnd: number,
    ) => {
      // Caso normal: horario disponible no cruza medianoche (ej: 08:00 - 20:00)
      if (availStart < availEnd) {
        return requestedStart >= availStart && requestedEnd <= availEnd;
      }
      // Caso horario disponible CRUZA medianoche (ej: 14:00 - 03:00)
      else {
        // El horario solicitado puede estar antes de medianoche (ej: 22:00 - 23:00)
        // o después de medianoche (ej: 00:00 - 01:00)
        // o cruzando medianoche (ej: 23:00 - 01:00)
        return (
          (requestedStart >= availStart && requestedStart < 1440) || // comienza en el primer segmento
          (requestedEnd <= availEnd && requestedEnd > 0) || // termina en el segundo segmento
          (requestedStart < availEnd && requestedEnd > availStart) // cruza el punto de cambio
        );
      }
    };

    const courtsWithScheduleAvailability = activeCourts.filter((court) => {
      // Si no tiene horarios definidos, asumimos que está disponible en todos
      if (!court.schedules || court.schedules.length === 0) {
        return true;
      }

      // Convertir el horario solicitado a minutos
      const requestedStart = timeToMinutes(startTime);
      const requestedEnd = timeToMinutes(endTime);

      // Verificar si el horario solicitado está dentro de algún rango de la cancha
      return court.schedules.some((availSchedule) => {
        const availStart = timeToMinutes(availSchedule.startTime);
        const availEnd = timeToMinutes(availSchedule.endTime);

        return isTimeWithinAvailability(
          requestedStart,
          requestedEnd,
          availStart,
          availEnd,
        );
      });
    }); // Expandir reservas normales de múltiples horas para el horario específico solicitado
    const expandedReservations = this.combineReservations(reservations, []);

    // Filtrar solo las reservas que coinciden con el horario solicitado
    const reservationsForSchedule = expandedReservations.filter(
      (reservation) =>
        `${reservation.startTime} - ${reservation.endTime}` === schedule,
    );

    const allReservations = [
      ...reservationsForSchedule.map((reservation) => ({
        court: reservation.court,
      })),
      ...expandedFixedSchedules.map((fixed) => ({ court: fixed.court })),
    ];
    const reservedCourts = allReservations.map(
      (reservation) => reservation.court,
    );

    const availableCourts = courtsWithScheduleAvailability.filter(
      (court) => !reservedCourts.some((reserved) => reserved.id === court.id),
    );

    return {
      schedule,
      court: availableCourts,
    };
  }

  /**
   * Genera todos los intervalos horarios de una lista de schedules.
   * Agrupa por franja horaria y asocia canchas y tarifas.
   */
  private generateAllSchedules(schedules: any[]) {
    const allIntervals = schedules.flatMap((schedule) => {
      const timeIntervals = this.splitIntoOneHourIntervals(
        schedule.startTime,
        schedule.endTime,
      );

      return timeIntervals.map((interval) => ({
        timeSlot: interval,
        courtId: schedule.courtId,
        rates: schedule.rates,
      }));
    });

    const groupedByTimeSlot = new Map<string, any>();

    allIntervals.forEach((interval) => {
      const key = interval.timeSlot;
      if (!groupedByTimeSlot.has(key)) {
        groupedByTimeSlot.set(key, {
          timeSlot: key,
          courts: [],
        });
      }

      const existingEntry = groupedByTimeSlot.get(key);

      if (interval.courtId) {
        // Agregamos la cancha si no está ya
        const alreadyExists = existingEntry.courts.some(
          (c) => c.courtId === interval.courtId,
        );
        if (!alreadyExists) {
          existingEntry.courts.push({
            courtId: interval.courtId,
            rates: interval.rates,
          });
        }
      } else {
        // Solo si no hay cancha específica agregamos rates a nivel general
        existingEntry.rates = interval.rates;
      }
    });

    // Ordena los intervalos para que los de medianoche queden al final
    return Array.from(groupedByTimeSlot.values()).sort((a, b) => {
      const getHour = (slot: string) => parseInt(slot.split(':')[0], 10);
      const hourA = getHour(a.timeSlot);
      const hourB = getHour(b.timeSlot);
      // Si el horario empieza entre 0 y 5, lo mandamos al final
      const isMidnightA = hourA < 6;
      const isMidnightB = hourB < 6;
      if (isMidnightA && !isMidnightB) return 1;
      if (!isMidnightA && isMidnightB) return -1;
      // Si ambos son de medianoche o ambos no, ordena normalmente
      return hourA - hourB;
    });
  }

  /**
   * Combina reservas normales y fijas en un solo array para disponibilidad.
   * Expande reservas de múltiples horas a intervalos de 1 hora.
   */
  private combineReservations(reservations: any[], fixedSchedules: any[]) {
    const expandedReservations: any[] = [];

    // Expandir reservas normales
    reservations.forEach((reservation) => {
      const [startTime, endTime] = reservation.schedule.split(' - ');
      const intervals = this.splitIntoOneHourIntervals(startTime, endTime);

      intervals.forEach((interval) => {
        const [intervalStart, intervalEnd] = interval.split(' - ');
        expandedReservations.push({
          court: reservation.court,
          startTime: intervalStart,
          endTime: intervalEnd,
          originalReservation: reservation,
        });
      });
    });

    // Filtrar reservas fijas que ya tienen una reserva automática creada
    const reservasAutomaticasIds = new Set(
      reservations.filter((r) => r.fixedReserveId).map((r) => r.fixedReserveId),
    );

    // Expandir solo las reservas fijas que NO tienen reserva automática
    fixedSchedules.forEach((fixed) => {
      // Solo procesar si no existe una reserva automática para esta reserva fija
      if (!reservasAutomaticasIds.has(fixed.id)) {
        const intervals = this.splitIntoOneHourIntervals(
          fixed.startTime,
          fixed.endTime,
        );

        intervals.forEach((interval) => {
          const [intervalStart, intervalEnd] = interval.split(' - ');
          expandedReservations.push({
            court: fixed.court,
            startTime: intervalStart,
            endTime: intervalEnd,
            originalReservation: fixed,
          });
        });
      }
    });

    return expandedReservations;
  }
  /**
   * Combina reservas normales y fijas en un solo array para agrupamiento.
   * Expande reservas de múltiples horas para mostrarlas en cada franja horaria.
   */
  private combineReservationDetails(
    reservations: any[],
    fixedSchedules: any[],
  ) {
    const expandedReservations: any[] = [];

    // Expandir reservas normales
    reservations.forEach((reservation) => {
      const [startTime, endTime] = reservation.schedule.split(' - ');
      const intervals = this.splitIntoOneHourIntervals(startTime, endTime);

      intervals.forEach((interval, index) => {
        expandedReservations.push({
          ...reservation,
          schedule: interval,
          isMultiHour: intervals.length > 1,
          hourIndex: index + 1,
          totalHours: intervals.length,
          originalSchedule: reservation.schedule,
        });
      });
    });

    // Filtrar reservas fijas que ya tienen una reserva automática creada
    const reservasAutomaticasIds = new Set(
      reservations.filter((r) => r.fixedReserveId).map((r) => r.fixedReserveId),
    );

    // Expandir solo las reservas fijas que NO tienen reserva automática
    fixedSchedules.forEach((fixed) => {
      // Solo procesar si no existe una reserva automática para esta reserva fija
      if (!reservasAutomaticasIds.has(fixed.id)) {
        const intervals = this.splitIntoOneHourIntervals(
          fixed.startTime,
          fixed.endTime,
        );

        intervals.forEach((interval, index) => {
          expandedReservations.push({
            id: fixed.id,
            court: fixed.court,
            schedule: interval,
            clientName: fixed.user.name,
            reserveType: 'FIJO',
            isMultiHour: intervals.length > 1,
            hourIndex: index + 1,
            totalHours: intervals.length,
            originalSchedule: `${fixed.startTime} - ${fixed.endTime}`,
          });
        });
      }
    });

    return expandedReservations;
  }

  /**
   * Calcula la disponibilidad de canchas para cada intervalo horario.
   * Considera reservas, horarios de cancha y casos que cruzan la medianoche.
   */ private async calculateAvailability(
    allSchedules: any[],
    allReservations: any[],
    complexId: string,
    sportTypeId?: string,
  ) {
    // Obtener canchas activas del complejo con filtro por deporte
    const query: any = {
      complexId,
      isActive: true,
    };

    if (sportTypeId) {
      query.sportTypeId = sportTypeId;
    }

    const activeCourts = await this.courtsService.findAll(query);

    // Función para convertir tiempo a minutos
    const timeToMinutes = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };

    return allSchedules.map((schedule) => {
      const [scheduleStart, scheduleEnd] = schedule.timeSlot.split(' - ');

      // Convertir horarios a minutos para comparación correcta
      const scheduleStartMinutes = timeToMinutes(scheduleStart);
      let scheduleEndMinutes = timeToMinutes(scheduleEnd);

      // Manejar cruce de medianoche en el slot
      if (scheduleEndMinutes <= scheduleStartMinutes) {
        scheduleEndMinutes += 24 * 60;
      } // Filtramos reservas que se solapan con este horario
      const reservedCourts = allReservations.filter((reservation) => {
        const reservationStartMinutes = timeToMinutes(reservation.startTime);
        let reservationEndMinutes = timeToMinutes(reservation.endTime);

        // Manejar cruce de medianoche en la reserva
        if (reservationEndMinutes <= reservationStartMinutes) {
          reservationEndMinutes += 24 * 60;
        }

        // Verificar solapamiento usando la lógica estándar de intervalos
        // Dos intervalos [a,b] y [c,d] se solapan si: a < d && c < b
        const overlaps =
          scheduleStartMinutes < reservationEndMinutes &&
          reservationStartMinutes < scheduleEndMinutes;

        return overlaps;
      }); // Verificamos disponibilidad para esta cancha específica
      const availableCourts = activeCourts.filter((court) => {
        // 1. Verificar que la cancha no esté reservada en este horario
        const isNotReserved = !reservedCourts.some(
          (reserved) => reserved.court.id === court.id,
        );

        // 2. Verificar que la cancha tenga este horario en sus schedules
        const slotStart = scheduleStartMinutes;
        const slotEnd = scheduleEndMinutes;

        const hasScheduleSlot = court.schedules?.some((courtSchedule: any) => {
          const courtStart = timeToMinutes(courtSchedule.startTime);
          let courtEnd = timeToMinutes(courtSchedule.endTime);
          if (courtEnd <= courtStart) {
            courtEnd += 24 * 60;
          }

          // Verificar si el slot está dentro del rango de la cancha
          const withinRange = slotStart >= courtStart && slotEnd <= courtEnd;

          // Si el rango de la cancha cruza la medianoche, también verificar con horarios extendidos
          const extendedRange =
            courtEnd > 1440 &&
            slotStart + 1440 >= courtStart &&
            slotEnd + 1440 <= courtEnd;

          return withinRange || extendedRange;
        });

        return isNotReserved && hasScheduleSlot;
      });

      return {
        schedule: schedule.timeSlot,
        court: availableCourts,
      };
    });
  }
  /**
   * Agrupa reservas por franja horaria.
   */
  private groupReservationsBySchedule(
    allSchedules: any[],
    allReservations: any[],
  ) {
    return allSchedules.map((scheduleObj) => ({
      schedule: scheduleObj.timeSlot, // Usamos el timeSlot como identificador
      court: allReservations.filter(
        (reserve) => reserve.schedule === scheduleObj.timeSlot,
      ),
      courtInfo: {
        courts: scheduleObj.courts,
        rates: scheduleObj.rates,
      },
    }));
  }

  /**
   * Divide un rango horario en intervalos de una hora, soportando cruces de medianoche.
   */
  private splitIntoOneHourIntervals(
    startTime: string,
    endTime: string,
  ): string[] {
    const intervals: string[] = [];

    // Función para convertir HH:MM a minutos
    const toMinutes = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };
    // Función para convertir minutos a HH:MM
    const toTime = (minutes: number) => {
      const h = Math.floor(minutes / 60) % 24;
      const m = minutes % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    const start = toMinutes(startTime);
    let end = toMinutes(endTime);
    if (end <= start) {
      // Cruza la medianoche
      end += 24 * 60;
    }

    for (let t = start; t < end; t += 60) {
      const slotStart = toTime(t);
      const slotEnd = toTime(t + 60);
      // Si cruza la medianoche, normalizamos a 24h
      intervals.push(`${slotStart} - ${slotEnd}`);
    }

    return intervals;
  }
}
