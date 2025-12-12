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
import { useRouter } from "next/navigation";
import { User, LogOut, LayoutDashboard, ShieldCheck, UserCircle } from "lucide-react";
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

  // Get initials or fallback
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button className="outline-none group relative">
          <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-white/20 group-hover:border-Primary transition-colors shadow-lg">
            <div className="h-full w-full bg-slate-800 flex items-center justify-center text-white font-bold">
              {currentUser?.user.name ? getInitials(currentUser.user.name) : <User size={20} />}
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-64 bg-slate-950/95 backdrop-blur-xl border border-white/10 text-white p-2 rounded-xl shadow-2xl z-[100]"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-white">
              {currentUser?.user.name || "Usuario"}
            </p>
            <p className="text-xs leading-none text-white/50">{currentUser?.user.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-white/10 my-2" />

        <DropdownMenuItem
          onClick={() => router.push("/profile")}
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 focus:bg-white/10 cursor-pointer transition-colors text-sm"
        >
          <UserCircle size={16} className="text-Primary" />
          <span>Mi Perfil / Reservas</span>
        </DropdownMenuItem>

        {currentUser?.user.role === "SUPER_ADMIN" && (
          <DropdownMenuItem
            onClick={() => router.push("/super-admin")}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-purple-500/20 focus:bg-purple-500/20 cursor-pointer transition-colors text-sm text-purple-300"
          >
            <ShieldCheck size={16} />
            <span>Super Admin</span>
          </DropdownMenuItem>
        )}

        {currentUser?.user.complexId === complex.id && (
          <DropdownMenuItem
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-500/20 focus:bg-blue-500/20 cursor-pointer transition-colors text-sm text-blue-300"
          >
            <LayoutDashboard size={16} />
            <span>Panel de Control</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator className="bg-white/10 my-2" />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-red-500/20 focus:bg-red-500/20 cursor-pointer transition-colors text-sm text-red-400"
        >
          <LogOut size={16} />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
