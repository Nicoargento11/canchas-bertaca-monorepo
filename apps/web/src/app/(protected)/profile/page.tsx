import Profile from "../_components/profile/profile";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getSession } from "@/services/auth/session";
import { getComplexBySlug } from "@/services/complex/complex";
import { getUserById } from "@/services/user/user";
import { notFound } from "next/navigation";

export default async function ProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  // const { slug } = await params;

  const sessionUser = await getSession();
  const { data: complejo } = await getComplexBySlug("bertaca");

  if (!complejo) {
    return notFound();
  }
  const { success, data, error } = await getUserById(sessionUser?.user.id!);
  if (!success || !data) {
    return <div>Error</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-Primary-darker via-Primary to-Primary-light">
      <TooltipProvider>
        <Profile userData={data} slug={"bertaca"} />
      </TooltipProvider>
    </div>
  );
}
