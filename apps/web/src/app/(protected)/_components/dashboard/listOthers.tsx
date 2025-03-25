"use client";
import { Input } from "@/components/ui/input";
import { useDashboardModal } from "@/context/dashboardModalContext";

const ListOthers = () => {
  const { othersSale, setOthersSale, handleChangeSale } = useDashboardModal();

  return (
    <section className=" m-2 p-2 bg-white rounded-md drop-shadow-md">
      <div className="grid grid-cols-[auto,1fr,1fr] text-center items-center gap-2 text-xs font-bold text-gray-500">
        <p>Tipo</p>
        <p>Transferencia</p>
        <p>Efectivo</p>
        <p>Caja inicial</p>
        <Input
          type="number"
          className="border border-gray-400 col-span-2"
          value={othersSale["caja inicial"]?.cash || ""}
          onChange={(e) =>
            handleChangeSale(
              "caja inicial",
              "cash",
              parseInt(e.target.value) || 0,
              1,
              setOthersSale
            )
          }
        />

        <p>Señas</p>
        <Input
          type="number"
          className="border border-gray-400"
          value={othersSale["Señas"]?.transfer || ""}
          onChange={(e) =>
            handleChangeSale(
              "Señas",
              "transfer",
              parseInt(e.target.value) || 0,
              1,
              setOthersSale
            )
          }
        />
        <Input
          type="number"
          className="border border-gray-400"
          value={othersSale["Señas"]?.cash || ""}
          onChange={(e) =>
            handleChangeSale(
              "Señas",
              "cash",
              parseInt(e.target.value) || 0,
              1,
              setOthersSale
            )
          }
        />
        <p>Escuelita</p>
        <Input
          type="number"
          className="border border-gray-400"
          value={othersSale["Escuelita"]?.transfer || ""}
          onChange={(e) =>
            handleChangeSale(
              "Escuelita",
              "transfer",
              parseInt(e.target.value) || 0,
              1,
              setOthersSale
            )
          }
        />
        <Input
          type="number"
          className="border border-gray-400"
          value={othersSale["Escuelita"]?.cash || ""}
          onChange={(e) =>
            handleChangeSale(
              "Escuelita",
              "cash",
              parseInt(e.target.value) || 0,
              1,
              setOthersSale
            )
          }
        />
      </div>
    </section>
  );
};

export default ListOthers;
