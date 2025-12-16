import PlayerProfile from "../_components/profile/PlayerProfile";
import { getSession } from "@/services/auth/session";
import { getUserById } from "@/services/user/user";

export default async function ProfilePage() {
  const sessionUser = await getSession();

  const { success, data, error } = await getUserById(sessionUser?.user.id!);
  if (!success || !data) {
    return <div>Error</div>;
  }

  return <PlayerProfile userData={data} />;
}
