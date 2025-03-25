"use client";
import { Modal } from "@/components/modals/modal";
import { useModal } from "@/contexts/modalContext";
import { RegisterForm } from "@/components/forms/registerForm";
import Link from "next/link";
import { Button } from "../ui/button";

const RegisterModal = () => {
  const { isOpenRegister, onCloseRegister, onOpenLogin, handleChangeRegister } =
    useModal();

  let footerContent = (
    <div className="flex items-center w-full justify-center">
      <p className="text-gray-600 text-center text-sm">
        ¿Ya tienes una cuenta?
      </p>
      <Button size="default" variant="link" asChild className="font-normal">
        <Link
          href=""
          onClick={() => {
            onCloseRegister();
            onOpenLogin();
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
      isOpen={isOpenRegister}
      onClose={onCloseRegister}
      footer={footerContent}
      body={<RegisterForm />}
    ></Modal>
  );
};

export default RegisterModal;
