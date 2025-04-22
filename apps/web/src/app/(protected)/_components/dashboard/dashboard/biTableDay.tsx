"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  TriangleAlert,
  CircleX,
  UserRound,
  CircleCheck,
  Edit,
  Coins,
  Clock9,
  CalendarDays,
} from "lucide-react";
import { GiSoccerField } from "@react-icons/all-files/gi/GiSoccerField";
import { format } from "date-fns";

import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { SideBarButton } from "../sideBarButton";
import { useReserve } from "@/contexts/reserveContext";
import { useDashboardReserveModalStore } from "@/store/reserveDashboardModalStore";
import { useDashboardDetailsModalStore } from "@/store/reserveDashboardDetailsModalStore";
import { useDashboardDataStore } from "@/store/dashboardDataStore";
import priceCalculator from "@/utils/priceCalculator";
import { Schedule } from "@/services/schedule/schedule";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Court } from "@/services/courts/courts";

const tableHead = ["Cancha 1", "Cancha 2", "Cancha 3", "Cancha 4"];

export interface ReserveData {
  date: Date;
  hour: string;
  court: number;
  userEmail: string;
  userId: string;
  price: number;
}

interface TableReservesProps {
  userEmail: string | undefined;
  userId: string | undefined;
  schedules: Schedule[];
  courtData: Court;
}

const BiTableDay: React.FC<TableReservesProps> = ({
  userEmail,
  userId,
  schedules,
  courtData,
}) => {
  const { getReservesByDay, reservesByDay } = useReserve();
  const { handleChangeReserve } = useDashboardReserveModalStore(
    (state) => state
  );
  const { handleChangeDetails } = useDashboardDetailsModalStore(
    (state) => state
  );
  const { date, setDate, getReserveById, setCreateReserve } =
    useDashboardDataStore((state) => state);

  const [loading, setLoading] = useState(true);
  const selectedDate = date && format(date, "yyyy-MM-dd");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await getReservesByDay(selectedDate!);
      } catch (error) {
        console.error("Error fetching reserves:", error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedDate) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const renderStatusIcon = (status: string) => {
    switch (status) {
      case "APROBADO":
        return <CircleCheck className="text-Success" size={20} />;
      case "PENDIENTE":
        return <TriangleAlert className="text-Warning" size={20} />;
      case "RECHAZADO":
        return <CircleX className="text-Error" size={20} />;
      default:
        return null;
    }
  };

  const renderSkeletonRows = () => {
    return Array.from({ length: 10 }).map((_, index) => (
      <tr
        key={`skeleton-${index}`}
        className="hover:bg-white/10 border transition-colors"
      >
        <td className="h-[61.804px] text-center font-semibold hidden md:flex md:justify-center md:items-center">
          <Skeleton className="h-4 w-20" />
        </td>
        <td className="h-[61.804px] text-center font-semibold flex justify-center md:hidden items-center">
          <Skeleton className="h-4 w-10" />
        </td>
        {Array.from({ length: 10 }).map((_, indexCourt) => (
          <td
            key={`skeleton-${index}-${indexCourt}`}
            className="w-[100px] h-[61.804px]"
          >
            <Skeleton className="w-full h-full rounded-sm" />
          </td>
        ))}
      </tr>
    ));
  };

  return (
    <div className="flex flex-col w-full h-full">
      {/* Encabezado con selector de fecha y botón de sidebar */}
      <div className="flex justify-between px-2 py-4 gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Elige una fecha</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(dateCalendar) => {
                if (dateCalendar) {
                  setDate(dateCalendar);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <SideBarButton />
      </div>

      <div className="bg-white/20 backdrop-blur-lg rounded-lg shadow-lg border border-white/30 overflow-hidden">
        <table className="w-full text-left table-fixed">
          <thead>
            <tr>
              <th className="border bg-white/30 backdrop-blur-md p-4 sticky top-0 z-10">
                <h6 className="font-semibold leading-none opacity-70 text-center hidden md:block">
                  Horarios
                </h6>
                <div className="flex justify-center">
                  <Clock9 className="block md:hidden" size={30} />
                </div>
              </th>
              {tableHead.map((head, index) => (
                <th
                  key={head}
                  className="bg-white/30 border backdrop-blur-md p-2 sticky top-0 z-10 text-center"
                >
                  <div className="flex flex-col items-center md:hidden">
                    <div className="relative text-Primary opacity-90">
                      <GiSoccerField size={40} />
                    </div>
                    <div className="pt-2 absolute text-black">
                      <p className="font-extrabold">{index + 1}</p>
                    </div>
                  </div>
                  <h6 className="font-semibold leading-none opacity-70 hidden md:block">
                    {head}
                  </h6>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              renderSkeletonRows()
            ) : reservesByDay && reservesByDay.length > 0 ? (
              reservesByDay.map((scheduleReserve, index) => (
                <tr
                  key={index}
                  className="hover:bg-white/10 border transition-colors"
                >
                  <td className="h-[61.804px] text-center font-semibold hidden md:flex md:justify-center md:items-center">
                    {scheduleReserve.schedule}
                  </td>
                  <td className="h-[61.804px] text-center font-semibold flex justify-center md:hidden items-center">
                    {scheduleReserve.schedule.split(" ")[0]}
                  </td>
                  {Array.from({ length: courtData.numberCourts }).map(
                    (court, index) => {
                      const isReserved = scheduleReserve.court.find(
                        (courtData) => courtData.court === index + 1
                      );

                      return isReserved ? (
                        <td
                          key={`${scheduleReserve.schedule}-${index + 1}`}
                          className="w-[100px] h-[61.804px]"
                        >
                          <div
                            className={`rounded-sm w-full h-full flex flex-col p-2 font-bold text-xs relative transition-all ${
                              isReserved.reserveType === "FIJO"
                                ? "cursor-default bg-gray-400/50 backdrop-blur-sm"
                                : "bg-white/30 backdrop-blur-sm hover:bg-white/40 hover:cursor-pointer"
                            }`}
                            onClick={
                              isReserved.reserveType === "FIJO"
                                ? undefined
                                : () => {
                                    getReserveById(isReserved.id);
                                    handleChangeDetails();
                                  }
                            }
                          >
                            <div className="flex gap-0.5 items-center">
                              <UserRound className="hidden sm:block text-Primary" />
                              <p className="truncate">
                                {isReserved.clientName || isReserved.User?.name}
                              </p>
                            </div>
                            {isReserved.reserveType !== "FIJO" && (
                              <div className="flex gap-0.5 items-center">
                                <Coins className="hidden sm:block text-Primary" />
                                <p>
                                  {isReserved.reservationAmount?.toLocaleString(
                                    "es-AR",
                                    {
                                      style: "currency",
                                      currency: "ARS",
                                    }
                                  )}
                                </p>
                              </div>
                            )}
                            {isReserved.reserveType !== "FIJO" && (
                              <div className="absolute top-1 right-1">
                                {renderStatusIcon(isReserved.status)}
                              </div>
                            )}
                          </div>
                        </td>
                      ) : (
                        <td
                          key={`${scheduleReserve.schedule}-${index + 1}`}
                          className="w-[100px] h-[61.804px]"
                        >
                          <div className="bg-Primary/40 backdrop-blur-sm text-white p-4 w-full h-full rounded-sm flex flex-col justify-center items-center font-bold text-lg">
                            <Button
                              onClick={() => {
                                setCreateReserve({
                                  date: date,
                                  hour: scheduleReserve.schedule,
                                  court: index + 1,
                                  userEmail: userEmail!,
                                  userId: userId!,
                                  price:
                                    priceCalculator(
                                      date,
                                      scheduleReserve.schedule,
                                      schedules
                                    )?.price || 0,
                                });
                                handleChangeReserve();
                              }}
                              className="bg-Primary hover:bg-Primary-dark text-white font-bold py-1 px-2 rounded-lg text-xs flex items-center gap-1"
                            >
                              <Edit size={20} />
                              <p className="hidden md:block">Reservar</p>
                            </Button>
                          </div>
                        </td>
                      );
                    }
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-8 text-Neutral-dark">
                  No hay reservas para esta fecha
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BiTableDay;
