"use client";

// import { FormError } from "@/components/form-error";
// import { FormSucces } from "@/components/form-succes";

import { Modal } from "@/components/modals/modal";
import ReserveModalInfo from "./reserveModalInfo";
import { useDashboardReserveStockModalStore } from "@/store/reserveStockDashboaardModal";
import { Reserve } from "@/services/reserves/reserves";
import { Product } from "@/services/product/product";

interface ReserveModalStockProps {
  products: Product[];
  reserve: Reserve;
  newReserveData: { court: number; schedule: string } | null;
  date: Date;
  onClose: () => void;
  onSave: (reserve: Reserve) => void;
}

const ReserveModalStock = ({
  onClose,
  reserve,
  products,
}: ReserveModalStockProps) => {
  const { isOpen, handleChangeReserve } = useDashboardReserveStockModalStore(
    (state) => state
  );

  return (
    <Modal
      title="Informacion de la reserva"
      isOpen={isOpen}
      onClose={handleChangeReserve}
      body={
        <ReserveModalInfo
          products={products}
          onClose={onClose}
          reserve={reserve}
        />
      }
    ></Modal>
  );
};
export default ReserveModalStock;
