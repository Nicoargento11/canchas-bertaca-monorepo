"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ButtonBackProps {
  slug: string;
}

export const ButtonBack = ({ slug }: ButtonBackProps) => {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.push(`/`)}
      className="
        bg-white/95 backdrop-blur-sm 
        border border-white/30 
        shadow-lg hover:shadow-xl 
        text-Primary hover:text-Primary-dark 
        hover:bg-white 
        transition-all duration-200 
        gap-2 px-3 py-2
        rounded-lg
        font-medium
        text-sm
      "
      variant="outline"
      size="sm"
    >
      <ArrowLeft className="h-4 w-4" />
      <Home className="h-3 w-3" />
      <span className="hidden sm:inline">Volver al complejo</span>
      <span className="sm:hidden">Volver</span>
    </Button>
  );
};
