"use client";
import React, { useEffect } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import priceCalculator from "@/utils/priceCalculator";
// import { CourtData } from "@/types/db";
import { SideBarButton } from "../sideBarButton";
import { useReserve } from "@/contexts/reserveContext";
import { Court } from "@/services/courts/courts";
import { allCourts } from "@/constants";
import { useDashboardReserveModalStore } from "@/store/reserveDashboardModalStore";
import { useDashboardDetailsModalStore } from "@/store/reserveDashboardDetailsModalStore";
import { useDashboardDataStore } from "@/store/dashboardDataStore";

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
  courtData: Court | null;
}

const BiTableDay: React.FC<TableReservesProps> = ({
  userEmail,
  courtData,
  userId,
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
  const selectedDate = date && format(date, "yyyy-MM-dd");

  useEffect(() => {
    getReservesByDay(selectedDate!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  return (
    <div className="flex flex-col w-full h-full">
      {/* Encabezado con selector de fecha y botón de sidebar */}
      <div className="flex justify-between px-2 py-4 gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              {date ? format(date, "yyyy-MM-dd") : <span>Elige una fecha</span>}
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
                <h6 className="font-semibold leading-none opacity-70 text-center hidden  md:block">
                  Horarios
                </h6>
                <div className="flex justify-center">
                  <Clock9 className="block md:hidden" size={30} />
                </div>
              </th>
              {tableHead.map((head, index) => (
                <th
                  key={head}
                  className="bg-white/30 border  backdrop-blur-md p-2 sticky top-0 z-10 text-center"
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
            {reservesByDay &&
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
                  {allCourts.map((court, indexCourt) => {
                    const isReserved = scheduleReserve.court.find(
                      (courtData) => courtData.court === court
                    );

                    return isReserved ? (
                      <td
                        key={`${scheduleReserve.schedule}-${court}`}
                        className="w-[100px] h-[61.804px]"
                      >
                        <div
                          className={`rounded-sm w-full h-full flex flex-col p-2 font-bold text-xs relative transition-all ${
                            isReserved.reserveType === "FIJO"
                              ? "cursor-default bg-gray-400/50 backdrop-blur-sm" // Efecto glass para reservas fijas
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
                            <UserRound
                              color="blue"
                              className="hidden sm:block"
                            />
                            <p>
                              {isReserved.clientName
                                ? isReserved.clientName
                                : isReserved.userId}
                            </p>
                          </div>
                          {isReserved.reserveType !== "FIJO" && (
                            <div className="flex gap-0.5 items-center">
                              <Coins color="blue" className="hidden sm:block" />
                              <p>{isReserved.reservationAmount}</p>
                            </div>
                          )}
                          {isReserved.reserveType !== "FIJO" && (
                            <div className="absolute top-1 right-1">
                              {isReserved.status === "APROBADO" ? (
                                <CircleCheck color="blue" size={20} />
                              ) : isReserved.status === "PENDIENTE" ? (
                                <TriangleAlert color="orange" />
                              ) : (
                                <CircleX color="red" />
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    ) : (
                      <td
                        key={`${scheduleReserve.schedule}-${court}`}
                        className="w-[100px] h-[61.804px]"
                      >
                        <div className="bg-Primary/40 backdrop-blur-sm text-white p-4 w-full h-full rounded-sm flex flex-col justify-center items-center font-bold text-lg ">
                          <Button
                            onClick={() => {
                              setCreateReserve({
                                date: date,
                                hour: scheduleReserve.schedule,
                                court: indexCourt + 1,
                                userEmail: userEmail!,
                                userId: userId!,
                                price: priceCalculator(
                                  date,
                                  scheduleReserve.schedule,
                                  courtData!
                                ).price,
                              });
                              handleChangeReserve();
                            }}
                            className="bg-Primary hover:bg-Primary-darker text-white font-bold py-1 px-2 rounded-lg text-xs flex items-center gap-1"
                          >
                            <Edit size={20} />
                            <p className="hidden md:block">Reservar</p>
                          </Button>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BiTableDay;
