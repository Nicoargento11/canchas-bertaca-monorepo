"use client";
import editProducts from "@/actions/product/editProducts";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useDashboardModal } from "@/context/dashboardModalContext";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";
type product = {
  [key: string | number]: { cash: number; transfer: number; price: number };
};
const FooterStock = () => {
  const { handleChangeCreateReport, handleDailyReport, produtsSale } =
    useDashboardModal();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const onSubmit = (values: product) => {
    if (!Object.keys(values).length) return;

    startTransition(() => {
      editProducts(values).then(() => {
        toast({
          duration: 3000,
          variant: "default",
          title: "¡Excelente!",
          description: "Todos los productos se han actualizado",
        });
        router.refresh();
      });
    });
  };
  return (
    <div className="flex-col sm:flex-row flex gap-2 p-2">
      <Button
        className="w-full bg-Neutral-light text-black"
        onClick={() => onSubmit(produtsSale)}
        disabled={isPending}
      >
        Guardar cambios
      </Button>
      <Button
        className="w-full bg-Primary"
        onClick={() => {
          handleChangeCreateReport();
          handleDailyReport();
        }}
      >
        Generar reporte diario
      </Button>
    </div>
  );
};

export default FooterStock;
