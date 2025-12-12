"use client";
import Link from "next/link";
import { Modal } from "./modal";
import { Button } from "@/components/ui/button";
import { LoginForm } from "../forms/loginForm";
import { useModal } from "@/contexts/modalContext";

const LoginModal = () => {
  const { isModalOpen, closeModal, openModal, modalData } = useModal();

  const footerContent = (
    <div className="flex items-center w-full justify-center">
      <p className="text-white/60 text-center text-sm">¿no te has registrado?</p>
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
            // oncloseLogin();
            openModal("REGISTER", { complexId: modalData?.complexId });
            // onOpenRegister();
          }}
        >
          Registrarse
        </Link>
      </Button>
    </div>
  );
  return (
    <Modal
      title="Iniciar sesion"
      isOpen={isModalOpen("LOGIN")}
      onClose={closeModal}
      footer={footerContent}
      body={<LoginForm />}
    ></Modal>
  );
};
export default LoginModal;
