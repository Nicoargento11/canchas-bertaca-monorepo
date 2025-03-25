"use client";

import { FcGoogle } from "@react-icons/all-files/fc/FcGoogle";
import { Button } from "./ui/button";
import { BACKEND_URL } from "@/config/constants";

export const Social = () => {
  return (
    <Button
      className="flex gap-2 w-full border border-gray-400"
      variant={"ghost"}
    >
      <FcGoogle size={30} />
      <a href={`${BACKEND_URL}/auth/google/login`}>Continuar con Google</a>
    </Button>
  );
};
