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
import { UserRound } from "lucide-react";
import { Session } from "@/services/auth/session";

interface ProfileMenuProps {
  currentUser?: Session | null;
}
export const ProfileMenu = ({ currentUser }: ProfileMenuProps) => {
  const router = useRouter();
  const onclick = async () => {
    try {
      const result = await signOut();
      if (result.success) {
        router.refresh();
        router.push('/');
      } else if (result.error) {
        console.error('Error during logout:', result.error);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="rounded-full bg-gradient-to-br from-Primary-light to-Primary-dark">
          <UserRound
            size={35}
            className="text-white bg-transparent rounded-full p-0.5"
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Mi perfil</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/profile")}>
          Perfil/Reservas
        </DropdownMenuItem>
        {currentUser?.user.role === "ADMINISTRADOR" && (
          <DropdownMenuItem onClick={() => router.push("/dashboard")}>
            Tablero
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onclick}>Cerrar sesion</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
