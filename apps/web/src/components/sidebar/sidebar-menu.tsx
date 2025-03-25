"use client";
import { Button } from "../ui/button";
import {
  ArrowRightFromLine,
  ArrowLeftToLine,
  UserCircle2,
  MoreVertical,
} from "lucide-react";
// import { Logo } from "../navbar/logo";
import { useSideBarContext } from "@/contexts/sideBarContext";
import { Session } from "@/services/auth/session";

interface SideBarProps {
  children: React.ReactNode;
  user: Session | null | undefined;
}

export const SidebarMenu: React.FC<SideBarProps> = ({ children, user }) => {
  const { expanded, setExpanded } = useSideBarContext();
  return (
    <aside
      className={`h-screen transition-all ${
        expanded ? "mr-0 sm:mr-[293px]" : "mr-0 sm:mr-[73px]"
      } ${!expanded && "hidden"} sm:block`}
    >
      <nav className="h-full w-fit flex flex-col bg-white border-r shadow-sm fixed z-20">
        <div className="p-4 pb-2 flex justify-between items-center">
          <div
            className={`overflow-hidden transition-all text-Primary ${
              !expanded && "w-0"
            }`}
          >
            {/* <Logo /> */}
          </div>
          <Button
            onClick={() => {
              setExpanded((curr) => !curr);
            }}
            size={"icon"}
            className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
          >
            {expanded ? (
              <ArrowLeftToLine className="text-Primary/80" />
            ) : (
              <ArrowRightFromLine className="text-Primary/80" />
            )}
          </Button>
        </div>

        <ul className="flex-1 px-3">{children}</ul>
        <div className="border-t flex p-3 items-center">
          <UserCircle2 size={35} className="text-Primary-dark" />
          <div
            className={`flex justify-between items-center overflow-hidden transition-all text-Primary-dark ${
              expanded ? "w-52 ml-3" : "w-0"
            }`}
          >
            <div className="leading-4">
              <h4 className="font-semibold">{user?.user.name}</h4>
              <span className="text-sm text-gray-600">{user?.user.email}</span>
            </div>
            <MoreVertical size={30} />
          </div>
        </div>
      </nav>
    </aside>
  );
};
