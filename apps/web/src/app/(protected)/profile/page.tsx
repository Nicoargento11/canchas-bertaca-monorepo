import Profile from "../_components/profile/profile";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getSession } from "@/services/auth/session";
import { getUserById } from "@/services/users/users";

export default async function ProfilePage() {
  const sessionUser = await getSession();
  const userReserves = sessionUser?.user.id
    ? await getUserById(sessionUser.user.id)
    : null;
  return (
    <div className="w-full min-h-screen flex justify-center bg-gradient-to-t from-Primary-light/30 to-Primary-lighter/30 backdrop-blur-md">
      <div className="py-10 w-full md:w-10/12 lg:w-8/12">
        <TooltipProvider>
          <div className="bg-white/30 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg">
            <Profile userData={userReserves} />
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}
