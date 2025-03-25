import { useRouter } from "next/navigation";
import React from "react";
import { CircleChevronLeft } from "lucide-react";
export const ButtonBack = () => {
  const router = useRouter();
  return (
    <div className="hover:cursor-pointer" onClick={() => router.push("/")}>
      <CircleChevronLeft className="text-Primary" size={40} />
    </div>
  );
};
