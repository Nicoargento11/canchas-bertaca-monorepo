import { allHours, allCourts } from "@/constants";
import { ReservaAgrupada } from "@/types";
import { $Enums } from "@prisma/client";
import dayHours from "./dayHours";
import converDate from "./convertDate";

type TableData = {
  hour: string;
  court: {
    id: string;
    court: number | string;
    status: $Enums.Status | string;
    price: number;
    reservationAmount: number | string;
    availability: string;
    phone: string | null;
    clientName: string | null;
    client: {
      id: string;
      name: string;
      email: string;
      role: $Enums.Role | string;
    };
  }[];
};
export const generateTableData = (
  filterDate: ReservaAgrupada | undefined,
  date: string | undefined
) => {
  const modifyData = dayHours(converDate(date!)).flatMap((hour) =>
    allCourts.map((court) => {
      const matchingReservation = filterDate?.appointments.find(
        (reserve) =>
          reserve.canchas.some(
            (courtReserve) => courtReserve.court === court
          ) && hour === `${reserve.horaInicio} - ${reserve.horaFin}`
      );
      if (matchingReservation) {
        const matchedCourt = matchingReservation.canchas.find(
          (reserveField) => reserveField.court === court
        );

        return {
          hour: hour,
          court: {
            id: matchedCourt?.id,
            court: matchedCourt?.court,
            price: matchedCourt?.price,
            reservationAmount: matchedCourt?.reservationAmount,
          },
          availability: "Reservado",
          phone: matchedCourt?.phone,
          clientName: matchedCourt?.clientName,
          status: matchedCourt?.status,
          client: matchedCourt?.User,
        };
      } else {
        return {
          hour: hour,
          court: {
            id: "",
            price: 0,
            court: court,
            reservationAmount: "",
          },
          phone: "",
          clientName: "",
          availability: "Disponible",
          status: "",
          client: { id: "", username: "", email: "", role: "" },
        };
      }
    })
  );

  const groupedData: TableData[] = [];
  // Iteramos a través de los datos y los agrupamos por hora
  modifyData.forEach((item) => {
    const hora = item.hour;

    // Buscamos si ya existe una entrada para esta hora
    const existingGroup = groupedData.find((group) => group.hour === hora);

    // Si no existe una entrada para esta hora, la creamos
    if (!existingGroup) {
      groupedData.push({
        hour: hora,
        court: [],
      });
    }

    // Agregamos la información de la cancha a esta hora
    if (item.availability === "Reservado") {
      const canchaInfo: any = {
        id: item.court.id,
        court: item.court.court,
        status: item.status,
        reservationAmount: item.court.reservationAmount,
        price: item.court.price,
        client: item.client,
        phone: item.phone,
        clientName: item.clientName,
      };

      // Buscamos el grupo correspondiente a esta hora
      const groupToUpdate = groupedData.find((group) => group.hour === hora);

      // Si encontramos el grupo, agregamos la información de la cancha
      if (groupToUpdate) {
        groupToUpdate.court.push(canchaInfo);
      }
    } else {
      // Si la disponibilidad es 'Disponible', simplemente agregamos una entrada vacía
      const emptyCanchaInfo = {
        id: "",
        court: "",
        status: "",
        price: 0,
        reservationAmount: "",
        availability: "",
        phone: "",
        clientName: "",
        client: {
          id: "",
          name: "",
          email: "",
          role: "",
        },
      };

      // Buscamos el grupo correspondiente a esta hora
      const groupToUpdate = groupedData.find((group) => group.hour === hora);

      // Si encontramos el grupo, agregamos la entrada vacía
      if (groupToUpdate) {
        groupToUpdate.court.push(emptyCanchaInfo);
      }
    }
  });
  // Convertimos el objeto en un array
  const reserves = Object.values(groupedData);

  return reserves;
};
