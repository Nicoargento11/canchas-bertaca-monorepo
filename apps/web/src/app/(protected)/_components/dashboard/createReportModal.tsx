"use client";
import { useMemo } from "react";

import { NewModal } from "@/components/modal/newModal";
import { useDashboardModal } from "@/context/dashboardModalContext";
import DailyReport from "./dailyReport";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
type CreateReportModalProps = {
  totalReservations: {
    webReservations: number;
    manualReservations: number;
  };
};
const CreateReportModal = ({ totalReservations }: CreateReportModalProps) => {
  const { isOpenCreateReport, handleChangeCreateReport, report } =
    useDashboardModal();

  const onSubmit = () => {
    console.log("submit");
  };
  const actionLabel = useMemo(() => {
    return "Generar reporte";
  }, []);

  const secondaryActionLabel = useMemo(() => {
    return "Cancelar";
  }, []);

  //content Reserve

  let title = "Reporte diario";

  const bodyContent = (
    <div className="w-full grid grid-cols-2 gap-2">
      <Card className="w-full">
        <CardHeader className="p-3">
          <CardDescription>Venta productos</CardDescription>
          <CardTitle>
            {report &&
              (
                report?.totalBebidas.cash + report?.totalBebidas.transfer
              ).toLocaleString("es-AR", {
                currency: "ARS",
              })}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="grid gap-2">
            <div className="flex flex-wrap justify-between">
              <span>Efectivo</span>
              <span className="font-semibold">
                {report?.totalBebidas.cash.toLocaleString("es-AR", {
                  currency: "ARS",
                })}
              </span>
            </div>
            <div className="flex flex-wrap  justify-between">
              <span>Transferencia</span>
              <span className="font-semibold">
                {report?.totalBebidas.transfer.toLocaleString("es-AR", {
                  currency: "ARS",
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="w-full">
        <CardHeader className="p-3">
          <CardDescription>Venta canchas</CardDescription>
          <CardTitle>
            {report &&
              (
                report?.totalCanchas.cash + report?.totalCanchas.transfer
              ).toLocaleString("es-AR", {
                currency: "ARS",
              })}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 ">
          <div className="grid gap-2">
            <div className="flex flex-wrap justify-between">
              <span>Efectivo</span>
              <span className="font-semibold">
                {report?.totalCanchas.cash.toLocaleString("es-AR", {
                  currency: "ARS",
                })}
              </span>
            </div>
            <div className="flex flex-wrap  justify-between">
              <span>Transferencia</span>
              <span className="font-semibold">
                {report?.totalCanchas.transfer.toLocaleString("es-AR", {
                  currency: "ARS",
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="w-full col-span-2">
        <CardHeader>
          <CardTitle>Otros detalles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-between gap-4">
            <div className="flex items-center gap-2">
              <span>Total canchas</span>
              <span className="font-semibold">
                {totalReservations.webReservations +
                  totalReservations.manualReservations}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>Manual</span>
              <span className="font-semibold">
                {totalReservations.manualReservations}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>Pagina web</span>
              <span className="font-semibold">
                {totalReservations.webReservations}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap justify-between gap-4">
            <div className="flex items-center gap-2">
              <span>Total otros</span>
              <span className="font-semibold">
                {report &&
                  (
                    report?.totalOtros.cash + report?.totalOtros.transfer
                  ).toLocaleString("es-AR", {
                    currency: "ARS",
                  })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>Efectivo</span>
              <span className="font-semibold">
                {report?.totalOtros.cash.toLocaleString("es-AR", {
                  currency: "ARS",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>Transferencia</span>
              <span className="font-semibold">
                {report?.totalOtros.transfer.toLocaleString("es-AR", {
                  currency: "ARS",
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="w-full col-span-2">
        <CardHeader>
          <CardDescription>Total neto</CardDescription>
          <CardTitle>
            {report?.totalNeto.toLocaleString("es-AR", {
              currency: "ARS",
            })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <span>Cash</span>
              <span className="font-semibold">
                {report?.totalEfectivo.toLocaleString("es-AR", {
                  currency: "ARS",
                })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Transfer</span>
              <span className="font-semibold">
                {report?.totalTransferencia.toLocaleString("es-AR", {
                  currency: "ARS",
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <NewModal
      title={title}
      isOpen={isOpenCreateReport}
      onClose={handleChangeCreateReport}
      onSubmit={onSubmit}
      actionLabel={actionLabel}
      body={bodyContent}
      secondaryActionLabel={secondaryActionLabel}
    />
  );
};

export default CreateReportModal;
