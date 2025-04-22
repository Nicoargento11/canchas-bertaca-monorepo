import { UserRound, DollarSign, ShoppingBasket } from "lucide-react";
import { GiSoccerBall } from "react-icons/gi";
import { Button } from "@/components/ui/button";
import calculateTotals from "@/utils/calculateTotals";
import { Badge } from "@/components/ui/badge";
import { Reserve } from "@/services/reserves/reserves";

interface CourtCellProps {
  reserve: Reserve | null;
  courtIndex: number;
  schedule: string;
  onOpenModal: (
    reserve: Reserve,
    courtData?: { court: number; schedule: string }
  ) => void;
}

export default function CourtCell({
  reserve,
  onOpenModal,
  courtIndex,
  schedule,
}: CourtCellProps) {
  const totals = reserve ? calculateTotals(reserve) : null;
  const statusColor = {
    APROBADO: "bg-green-50 border-green-100",
    PENDIENTE: "bg-yellow-50 border-yellow-100",
    RECHAZADO: "bg-red-50 border-red-100",
  }[reserve?.status || "PENDIENTE"];

  return (
    <td className="p-2 min-w-[180px]">
      {reserve ? (
        <div
          className={`rounded-lg w-full h-full p-4 flex flex-col gap-3 relative transition-all border ${statusColor} hover:border-gray-300 cursor-pointer`}
          onClick={() => {
            if (reserve.reserveType === "FIJO") return;
            onOpenModal(reserve, { court: courtIndex + 1, schedule });
          }}
        >
          <div className="absolute top-2 right-2">
            <Badge
              variant="outline"
              className={`text-xs ${
                reserve.status === "APROBADO"
                  ? "bg-green-100 text-green-800"
                  : reserve.status === "PENDIENTE"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
              }`}
            >
              {reserve.status}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <UserRound className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium truncate">
              {reserve.clientName || "Cliente no especificado"}
            </span>
          </div>

          {totals && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span>Pagado: ${totals.paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <ShoppingBasket className="h-4 w-4 text-orange-600" />
                <span>
                  Consumos: ${totals.consumitionAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <GiSoccerBall className="h-4 w-4 text-gray-600" />
                <span
                  className={
                    totals.balance >= 0 ? "text-green-600" : "text-red-600"
                  }
                >
                  Saldo: ${Math.abs(totals.balance).toLocaleString()}
                  {totals.balance < 0 && " (debe)"}
                </span>
              </div>
            </div>
          )}

          {/* {reserve.status !== "APROBADO" && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2 self-end text-xs h-7"
              onClick={(e) => {
                e.stopPropagation();
                onOpenModal({
                  ...reserve,
                  status: Status.APROBADO,
                });
              }}
            >
              Completar
            </Button>
          )} */}
        </div>
      ) : (
        <div className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center h-full transition-colors min-h-[120px]">
          <Button
            variant="ghost"
            size="sm"
            className="text-green-600 hover:text-green-700 flex items-center gap-1"
            onClick={() => {}}
          >
            {/* <PlusCircle className="h-4 w-4" /> */}
            <span>Disponible</span>
          </Button>
        </div>
      )}
    </td>
  );
}
