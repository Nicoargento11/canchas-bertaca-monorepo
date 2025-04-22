"use client";

import { useDashboardEditReserveModalStore } from "@/store/editReserveDashboardModalStore";
import { EditReserveForm } from "./editReserveForm";
import { Modal } from "@/components/modals/modal";

const EditReserveModal = () => {
  const { isOpen, handleChangeEditReserve } = useDashboardEditReserveModalStore(
    (state) => state
  );

  return (
    <Modal
      title="Editar reserva"
      isOpen={isOpen}
      onClose={handleChangeEditReserve}
      body={<EditReserveForm />}
    ></Modal>
  );
};
export default EditReserveModal;
