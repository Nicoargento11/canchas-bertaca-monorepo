"use client";

// import { FormError } from "@/components/form-error";
// import { FormSucces } from "@/components/form-succes";

import { Modal } from "@/components/modals/modal";
import { ReserveForm } from "./reserveForm";
import { useDashboardReserveModalStore } from "@/store/reserveDashboardModalStore";

const ReserveModal = () => {
  const { isOpen, handleChangeReserve } = useDashboardReserveModalStore(
    (state) => state
  );

  return (
    <Modal
      title="Reservar"
      isOpen={isOpen}
      onClose={handleChangeReserve}
      body={<ReserveForm />}
    ></Modal>
  );
};
export default ReserveModal;
