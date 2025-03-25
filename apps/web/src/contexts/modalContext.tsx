"use client";
import React, { createContext, useContext, useState } from "react";

interface ModalProviderProps {
  children: React.ReactNode;
}

type ThemeContext = {
  //Reserve
  isOpenReserve: boolean;
  onOpenReserve: () => void;
  oncloseReserve: () => void;
  //Login
  onOpenLogin: () => void;
  oncloseLogin: () => void;
  isOpenLogin: boolean;
  handleChangeLogin: () => void;
  //Register
  onOpenRegister: () => void;
  onCloseRegister: () => void;
  isOpenRegister: boolean;
  handleChangeRegister: () => void;
};

const ModalContext = createContext<ThemeContext | null>(null);

export const useModal = () => {
  const context = useContext(ModalContext);

  if (!context) throw new Error("useAuth must be used within a AuthProvider");
  return context;
};

export const ModalProvider = ({ children }: ModalProviderProps) => {
  const [isOpenReserve, setIsOpenReserve] = useState(false);
  const [isOpenLogin, setIsOpenLogin] = useState(false);
  const [isOpenRegister, setIsOpenRegister] = useState(false);

  const handleChangeLogin = () => {
    setIsOpenLogin((value) => !value);
  };
  const handleChangeRegister = () => {
    setIsOpenRegister((value) => !value);
  };
  //Reserve
  const onOpenReserve = () => {
    setIsOpenReserve(true);
  };
  const oncloseReserve = () => {
    setIsOpenReserve(false);
  };
  //Login
  const onOpenLogin = () => {
    setIsOpenLogin(true);
  };
  const oncloseLogin = () => {
    setIsOpenLogin(false);
  };
  //Register
  const onOpenRegister = () => {
    setIsOpenRegister(true);
  };
  const onCloseRegister = () => {
    setIsOpenRegister(false);
  };
  return (
    <ModalContext.Provider
      value={{
        isOpenLogin,
        isOpenRegister,
        isOpenReserve,
        onOpenLogin,
        oncloseLogin,
        onOpenRegister,
        onCloseRegister,
        onOpenReserve,
        oncloseReserve,
        handleChangeLogin,
        handleChangeRegister,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export default ModalContext;
