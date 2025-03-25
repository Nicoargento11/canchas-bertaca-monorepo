"use client";

import { useSideBarContext } from "@/contexts/sideBarContext";

interface SideBarItemProps {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  alert?: boolean;
  onClick: () => void;
}
export const SideBarItem = ({
  active,
  icon,
  text,
  alert,
  onClick,
}: SideBarItemProps) => {
  const { expanded } = useSideBarContext();
  return (
    <li
      className={`relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors group ${
        active
          ? "bg-gradient-to-tr from-blue-200 to-blue-100 text-Primary/80"
          : "hover:bg-blue-100 text-Primary-darker "
      }`}
      onClick={onClick}
    >
      {icon}
      <span
        className={` overflow-hidden transition-all text-Primary-darker ${
          expanded ? "w-52 ml-3" : "w-0"
        }`}
      >
        {text}
      </span>
      {alert && (
        <div
          className={`absolute right-2 w-2 h-2 rounded bg-Primary-darker ${
            expanded ? "" : "top-2"
          }`}
        />
      )}

      {!expanded && (
        <div
          className={`absolute left-full rounded-md px-2 py-1 ml-6 bg-indigo-100 text-Primary text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0`}
        >
          {text}
        </div>
      )}
    </li>
  );
};
