"use client";

import { signOut } from "@/services/auth/auth";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "next/navigation";
import { UserRound } from "lucide-react";
import type { SessionPayload } from "@/services/auth/session";
import { Complex } from "@/services/complex/complex";

interface ProfileMenuProps {
  currentUser?: SessionPayload | null;
  complex: Complex;
}

export const ProfileMenu = ({ currentUser, complex }: ProfileMenuProps) => {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const result = await signOut();
      if (result.success) {
        router.refresh();
        router.push(`/`);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="rounded-full bg-gradient-to-r from-Primary-light via-Neutral-light to-Complementary p-0.5 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
          <div className="bg-Neutral-dark rounded-full p-1">
            <UserRound size={30} className="text-Neutral-light" />
          </div>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="border border-Neutral-light/20 bg-Neutral-dark/90 backdrop-blur-md text-Neutral-light min-w-[200px]"
        align="end"
      >
        <DropdownMenuLabel className="text-Primary-light font-bold">Mi Cuenta</DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-Neutral-light/20" />

        <DropdownMenuItem
          onClick={() => router.push("/profile")}
          className="hover:bg-Primary-light/20 focus:bg-Primary-light/20 text-Neutral-light cursor-pointer transition-colors"
        >
          Perfil/Reservas
        </DropdownMenuItem>

        {currentUser?.user.complexId === complex.id && (
          <DropdownMenuItem
            onClick={() => router.push("/dashboard")}
            className="hover:bg-Accent-3/20 focus:bg-Accent-3/20 text-Neutral-light cursor-pointer transition-colors"
          >
            Tablero
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={handleSignOut}
          className="hover:bg-Error focus:bg-Error text-Neutral-light cursor-pointer transition-colors"
        >
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
