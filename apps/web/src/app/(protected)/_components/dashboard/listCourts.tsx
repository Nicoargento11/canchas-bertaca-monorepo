"use client";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { allCourts } from "@/constants";
import { useDashboardModal } from "@/context/dashboardModalContext";

const ListCourts = () => {
  const { courtsSale, setCourtsSale, handleChangeSale } = useDashboardModal();
  return (
    <section className="m-2 bg-white rounded-md drop-shadow-md">
      <div className="p-2 grid grid-cols-[auto,1fr,1fr] text-center gap-2 text-xs font-bold text-black bg-gradient-to-tr from-green-200 to-green-100">
        <p>Canchas</p>
        <p>Transferencia</p>
        <p>Efectivo</p>
      </div>
      <Separator />
      {allCourts.map((court) => (
        <div
          key={court}
          className="grid grid-cols-[auto,1fr,1fr] p-2 py-1 gap-2 items-center text-sm font-semibold text-gray-700"
        >
          <p>Cancha {court}</p>
          <Input
            type="number"
            className="border border-gray-400"
            value={courtsSale[`Cancha ${court}`]?.transfer || ""}
            onChange={(e) =>
              handleChangeSale(
                `Cancha ${court}`,
                "transfer",
                parseInt(e.target.value) || 0,
                1,
                setCourtsSale
              )
            }
          />
          <Input
            type="number"
            className="border border-gray-400"
            value={courtsSale[`Cancha ${court}`]?.cash || ""}
            onChange={(e) =>
              handleChangeSale(
                `Cancha ${court}`,
                "cash",
                parseInt(e.target.value) || 0,
                1,
                setCourtsSale
              )
            }
          />
        </div>
      ))}
    </section>
  );
};

export default ListCourts;
