"use client";

import { useDashboardCompleteReserveModalStore } from "@/store/completeReserveDashboardModalStore";
import { Modal } from "@/components/modals/modal";
import { CompleteReserveForm } from "./completeReserveForm";

const CompleteReserveModal = () => {
  const { isOpen, handleChangeCompleteReserve } = useDashboardCompleteReserveModalStore(
    (state) => state
  );

  return (
    <Modal
      title="Completar Reserva"
      isOpen={isOpen}
      onClose={handleChangeCompleteReserve}
      body={<CompleteReserveForm />}
    ></Modal>
  );
};

export default CompleteReserveModal;
