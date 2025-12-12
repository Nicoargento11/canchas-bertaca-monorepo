import PlayerProfile from "../_components/profile/PlayerProfile";
import { getSession } from "@/services/auth/session";
import { getComplexBySlug } from "@/services/complex/complex";
import { getUserById } from "@/services/user/user";
import { notFound } from "next/navigation";

export default async function ProfilePage() {
  const sessionUser = await getSession();

  if (!sessionUser?.user.complexSlug) {
    return notFound();
  }

  const { data: complejo } = await getComplexBySlug(sessionUser.user.complexSlug);

  if (!complejo) {
    return notFound();
  }

  const { success, data, error } = await getUserById(sessionUser?.user.id!);
  if (!success || !data) {
    return <div>Error</div>;
  }

  return <PlayerProfile userData={data} slug={sessionUser.user.complexSlug} />;
}
