"use client";
import { Button } from "@/components/ui/button";
import { useSideBarContext } from "@/contexts/sideBarContext";
import React from "react";
import { ArrowRightToLine, ArrowLeftToLine } from "lucide-react";

export const SideBarButton = () => {
  // const { expanded, setExpanded } = useSideBarContext();

  return (
    <Button
      // onClick={() => {
      //   setExpanded((curr) => !curr);
      // }}
      size={"icon"}
      className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 block sm:hidden"
    >
      {/* {expanded ? (
        <ArrowRightToLine className="text-Primary/80" />
      ) : (
        <ArrowLeftToLine className="text-Primary/80" />
      )} */}
    </Button>
  );
};
