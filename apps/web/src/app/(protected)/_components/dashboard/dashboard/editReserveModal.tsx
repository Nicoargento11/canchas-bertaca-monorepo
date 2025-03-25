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
      title="Reservar"
      isOpen={isOpen}
      onClose={handleChangeEditReserve}
      body={<EditReserveForm />}
    ></Modal>
  );
};
export default EditReserveModal;
