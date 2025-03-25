import { PricingType } from "@/services/courts/courts";

interface Price {
  id: string;
  name: string;
  reservationAmount: number;
  pricing: { id: string; type: PricingType; amount: number; courtId: string }[];
}
const priceCalculator = (
  day: Date,
  horario: string,
  prices: Price
): { price: number; reservationAmount: number } => {
  // Dividir el horario en horas de inicio y fin
  const [horaInicio] = horario.split(" - ");
  const horaInicioInt = parseInt(horaInicio.split(":")[0]);
  console.log(horaInicio);

  // Obtener el día de la semana (0 para domingo, 1 para lunes,..., 6 para sábado)
  const diaDeLaSemana = day.getDay();

  // Función auxiliar para encontrar el precio según el tipo
  const findPrice = (type: PricingType): number => {
    console.log(type);
    const priceObj = prices.pricing.find((p) => p.type === type);
    console.log(priceObj);
    return priceObj?.amount ?? 0; // Devuelve 0 si no se encuentra el precio
  };

  if (horaInicio === "00:00" || horaInicio === "01:00") {
    return {
      price: findPrice(PricingType.MidNight),
      reservationAmount: prices.reservationAmount,
    };
  }
  if (diaDeLaSemana >= 1 && diaDeLaSemana <= 5) {
    if (horaInicioInt >= 21) {
      return {
        price: findPrice(PricingType.WithLights),
        reservationAmount: prices.reservationAmount,
      }; // Precio para horarios a partir de las 21:00
    } else {
      return {
        price: findPrice(PricingType.NoLights),
        reservationAmount: prices.reservationAmount,
      }; // Precio para horarios antes de las 21:00
    }
  } else {
    if (horaInicioInt >= 21) {
      return {
        price: findPrice(PricingType.HolidayLights),
        reservationAmount: prices.reservationAmount,
      }; // Precio para horarios a partir de las 21:00
    } else {
      return {
        price: findPrice(PricingType.HolidayNoLights),
        reservationAmount: prices.reservationAmount,
      }; // Precio para horarios antes de las 21:00
    }
  }
};

export default priceCalculator;
