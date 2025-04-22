"use client";
import { useState } from "react";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import CourtScheduleTable from "./courtScheduleTable";
import ReserveModalStock from "./reserveModalStock";
import { useDashboardReserveStockModalStore } from "@/store/reserveStockDashboaardModal";
import { Reserve, ReservesByDay } from "@/services/reserves/reserves";
import { Product } from "@/services/product/product";
import { Court } from "@/services/courts/courts";

interface PaymentCourtMatrixProps {
  reservesByDay: ReservesByDay;
  products: Product[];
  court: Court;
}
export const PaymentCourtMatrix = ({
  reservesByDay,
  products,
  court,
}: PaymentCourtMatrixProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [paymentsByDay, setPaymentsByDay] =
    useState<ReservesByDay>(reservesByDay);
  const [selectedReserve, setSelectedReserve] = useState<Reserve>();
  const [newReserveData, setNewReserveData] = useState<{
    court: number;
    schedule: string;
  } | null>(null);

  const { closeModal, openModal } = useDashboardReserveStockModalStore(
    (state) => state
  );
  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      // Aquí iría la carga de datos según la fecha seleccionada
      setPaymentsByDay(reservesByDay);
    }
  };

  const handleOpenModal = (
    reserve: Reserve | null,
    courtData?: { court: number; schedule: string }
  ) => {
    if (reserve) {
      setSelectedReserve(reserve);
      setNewReserveData(null);
    } else if (courtData) {
      // setSelectedReserve(null);
      setNewReserveData(courtData);
    }
    openModal();
  };

  const handleSaveReserve = (updatedReserve: Reserve) => {
    if (updatedReserve.id) {
      setPaymentsByDay((prev) =>
        prev.map((slot) => ({
          ...slot,
          courts: slot.court.map((court) =>
            court?.id === updatedReserve.id ? updatedReserve : court
          ),
        }))
      );
    } else {
      setPaymentsByDay((prev) =>
        prev.map((slot) => {
          if (slot.schedule === updatedReserve.schedule) {
            const newCourts = [...slot.court];
            newCourts[updatedReserve.court - 1] = updatedReserve;
            return { ...slot, courts: newCourts };
          }
          return slot;
        })
      );
    }
    closeModal();
  };

  return (
    <>
      <div className="flex flex-col w-full space-y-6 p-4">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg shadow">
          <h2 className="text-xl font-bold text-black">Gestión de Canchas</h2>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full sm:w-[240px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Seleccionar fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Tabla de horarios */}
        <CourtScheduleTable
          paymentsByDay={paymentsByDay}
          onOpenModal={handleOpenModal}
          court={court}
        />

        {/* Modal de reserva */}
      </div>
      <ReserveModalStock
        reserve={selectedReserve!}
        products={products}
        newReserveData={newReserveData}
        date={date}
        onClose={closeModal}
        onSave={handleSaveReserve}
      />
    </>
  );
};
