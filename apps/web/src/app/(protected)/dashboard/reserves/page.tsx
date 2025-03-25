import getReservesByMonth from "@/actions/reserve/get-reserve-month";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import React from "react";

import {
  CheckCircle2,
  AlertCircle,
  CircleX,
  Hand,
  MonitorCheck,
  CalendarDays,
  Clock9,
  ArrowBigDownDash,
  ArrowBigUpDash,
} from "lucide-react";

import { GiSoccerField } from "@react-icons/all-files/gi/GiSoccerField";

import { SideBarButton } from "../../_components/dashboard/sideBarButton";
const statusReserve = {
  APPROVED: {
    icon: <CheckCircle2 size={25} className="text-Success w-full" />,
    color: "bg-Success",
  },
  PENDING: {
    icon: <AlertCircle size={25} className="text-Warning w-full" />,
    color: "bg-Warning",
  },
  REJECTED: {
    icon: <CircleX size={25} className="text-Error w-full" />,
    color: "bg-Error",
  },
};

// const mercadopago = new MercadoPagoConfig({
//   accessToken: process.env.MP_ACCESS_TOKEN!,
// });

// const filters = {
//   date_created: {
//     from: "2024-5-10T00:00:00Z",
//     to: "2024-5-26T23:59:59Z",
//   },
// };
const PageDashboardReserves = async () => {
  // const payment2 = await new Payment(mercadopago).search({
  //   options: { limit: 1000, begin_date: "NOW-5DAYS", end_date: "NOW" },
  // });
  // const payment = await new Payment(mercadopago).get({ id: 113597621064 });

  const today = new Date()
    .toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .split("/");
  const allReserves = await getReservesByMonth(today[1], today[2]);
  return (
    <div className="w-full p-2 overflow-x-auto">
      <div className="p-2 w-full flex justify-end">
        <SideBarButton />
      </div>

      <Table className="min-w-full divide-y divide-gray-200 shadow-md rounded-lg overflow-hidden">
        <TableHeader className="bg-gray-100">
          <TableRow>
            <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
              Cliente
            </TableCell>
            <TableCell className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
              Reserva
            </TableCell>
            <TableCell className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
              Estado
            </TableCell>
            <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
              Pago
            </TableCell>
            <TableCell className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
              Metodo
            </TableCell>
            <TableCell className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
              Operacion
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white divide-y divide-gray-200">
          {allReserves.map(
            ({
              clientName,
              court,
              date,
              phone,
              price,
              reservationAmount,
              schedule,
              status,
              User,
              id,
              createdAt,
              updatedAt,
              paymentId,
            }) => (
              <TableRow key={id} className="">
                <TableCell className="whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-semibold">
                    {clientName ? clientName : User.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {User.email}
                  </div>
                  <div className="text-sm text-muted-foreground">{phone}</div>
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap">
                  <div className="flex text-sm text-gray-900 gap-2 items-center">
                    <CalendarDays />
                    {date}
                  </div>
                  <div className="flex items-center text-sm gap-2 text-gray-500">
                    <Clock9 />
                    {schedule}
                  </div>
                  <div className="flex items-center text-sm gap-2 text-gray-500">
                    <GiSoccerField className="text-black" />
                    Cancha {court}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {statusReserve[status].icon}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    Precio total: ${price}
                  </div>
                  <div className="text-sm text-gray-500">
                    Reserva pagada: ${reservationAmount}
                  </div>
                  <div className="text-sm text-gray-500">
                    Monto faltante: ${price! - reservationAmount!}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    className={`${
                      paymentId || status == "REJECTED"
                        ? "bg-Info"
                        : "bg-Success"
                    } rounded-full p-[5px]`}
                  >
                    {paymentId || status == "REJECTED" ? (
                      <MonitorCheck size={20} />
                    ) : (
                      <Hand size={20} />
                    )}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm text-gray-500 whitespace-nowrap">
                    <ArrowBigUpDash className="text-Neutral-dark" />
                    {new Date(createdAt).toLocaleString("es-AR", {
                      timeZone: "America/Argentina/Buenos_Aires",
                    })}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 whitespace-nowrap">
                    <ArrowBigDownDash className="text-Neutral-dark" />

                    {new Date(updatedAt).toLocaleString("es-AR", {
                      timeZone: "America/Argentina/Buenos_Aires",
                    })}
                  </div>
                </TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PageDashboardReserves;
