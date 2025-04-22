"use client";
import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
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
import {
  getAllReservesPagination,
  Reserve,
} from "@/services/reserves/reserves";
import formatDateUTC from "@/utils/formatDateUtc";

const statusReserve = {
  APROBADO: {
    icon: <CheckCircle2 size={25} className="text-Success w-full" />,
    color: "bg-Success",
  },
  PENDIENTE: {
    icon: <AlertCircle size={25} className="text-Warning w-full" />,
    color: "bg-Warning",
  },
  RECHAZADO: {
    icon: <CircleX size={25} className="text-Error w-full" />,
    color: "bg-Error",
  },
};

const ITEMS_PER_PAGE = 10;

const PageDashboardReserves = () => {
  const [reserves, setReserves] = useState<Reserve[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalReserves, setTotalReserves] = useState(0);
  const observerTarget = useRef(null);
  // Carga inicial de datos
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      const data = await getAllReservesPagination(1, ITEMS_PER_PAGE);
      if (data) {
        setReserves(data.reserves);
        setTotalReserves(data.total);
        setHasMore(data.reserves.length === ITEMS_PER_PAGE);
      }
      setIsLoading(false);
    };
    loadInitialData();
  }, []);

  // Carga más datos cuando se llega al final
  const loadMoreData = async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    const nextPage = page + 1;
    const data = await getAllReservesPagination(nextPage, ITEMS_PER_PAGE);

    if (data && data.reserves.length > 0) {
      setReserves((prev) => [...prev, ...data.reserves]);
      setPage(nextPage);
      setHasMore(data.reserves.length === ITEMS_PER_PAGE);
    } else {
      setHasMore(false);
    }
    setIsLoading(false);
  };

  // Configuración del Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMoreData();
        }
      },
      { threshold: 0.1 }
    );

    const target = observerTarget.current;

    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, isLoading]);

  return (
    <div className="w-full p-2 overflow-x-auto">
      <div className="p-2 w-full flex justify-end">
        <SideBarButton />
      </div>

      <div className="mb-4 text-sm text-gray-500">
        Mostrando {reserves.length} de {totalReserves} reservas
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
          {reserves.map(
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
                  {User && (
                    <>
                      <div className="text-sm text-gray-900 font-semibold">
                        {clientName ? clientName : User.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {User.email}
                      </div>
                    </>
                  )}
                  <div className="text-sm text-muted-foreground">{phone}</div>
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap">
                  <div className="flex text-sm text-gray-900 gap-2 items-center">
                    <CalendarDays />
                    {formatDateUTC(new Date(date).toUTCString())}
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
                      paymentId ||
                      status == "RECHAZADO" ||
                      status == "PENDIENTE"
                        ? "bg-Info"
                        : "bg-Success"
                    } rounded-full p-[5px]`}
                  >
                    {paymentId ||
                    status == "RECHAZADO" ||
                    status == "PENDIENTE" ? (
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
          <tr ref={observerTarget} className="h-2"></tr>
        </TableBody>
      </Table>
      {isLoading && (
        <div className="w-full flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}
      {!hasMore && reserves.length > 0 && (
        <div className="text-center py-4 text-gray-500">
          No hay más reservas para mostrar
        </div>
      )}
    </div>
  );
};

export default PageDashboardReserves;
