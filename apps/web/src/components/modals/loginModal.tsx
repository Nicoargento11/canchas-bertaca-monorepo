"use client";
import { Modal } from "@/components/modals/modal";
import { useModal } from "@/contexts/modalContext";
import { LoginForm } from "@/components/forms/loginForm";
import { Button } from "../ui/button";
import Link from "next/link";

const LoginModal = () => {
  const { onOpenRegister, oncloseLogin, isOpenLogin, handleChangeLogin } =
    useModal();

  let footerContent = (
    <div className="flex items-center w-full justify-center">
      <p className="text-gray-600 text-center text-sm bg-gre">
        ¿no te has registrado?
      </p>
      <Button size="default" variant="link" asChild className="font-normal">
        <Link
          href=""
          onClick={() => {
            oncloseLogin();
            onOpenRegister();
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
      isOpen={isOpenLogin}
      onClose={oncloseLogin}
      footer={footerContent}
      body={<LoginForm />}
    ></Modal>
  );
};
export default LoginModal;
