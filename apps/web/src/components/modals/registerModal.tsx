"use client";
import { Modal } from "@/components/modals/modal";
import { RegisterForm } from "@/components/forms/registerForm";
import Link from "next/link";
import { Button } from "../ui/button";
import { useModal } from "@/contexts/modalContext";

const RegisterModal = () => {
  const { openModal, closeModal, modalData, isModalOpen } = useModal();

  const footerContent = (
    <div className="flex items-center w-full justify-center">
      <p className="text-white/60 text-center text-sm">¿Ya tienes una cuenta?</p>
      <Button
        size="default"
        variant="link"
        asChild
        className="font-normal text-Primary hover:text-Primary-light"
      >
        <Link
          href=""
          onClick={() => {
            closeModal();
            // onCloseRegister();
            openModal("LOGIN", { complexId: modalData?.complexId });
            // onOpenLogin();
          }}
        >
          Ingresar
        </Link>
      </Button>
    </div>
  );
  return (
    <Modal
      title="Registrarse"
      isOpen={isModalOpen("REGISTER")}
      onClose={closeModal}
      footer={footerContent}
      body={<RegisterForm />}
    ></Modal>
  );
};

export default RegisterModal;
