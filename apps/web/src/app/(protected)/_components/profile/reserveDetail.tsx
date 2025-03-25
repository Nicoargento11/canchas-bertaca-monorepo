import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LucideProps } from "lucide-react";
import React from "react";
import { IconType } from "react-icons";

interface ReserveDetailProps {
  Icon:
    | React.ForwardRefExoticComponent<
        Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
      >
    | IconType;
  label: string;
  value: string | number;
}
export const ReserveDetail = ({ Icon, label, value }: ReserveDetailProps) => {
  return (
    <div className="flex gap-1 items-center">
      <Tooltip>
        <TooltipTrigger>
          <Icon className="text-Primary" size={25} />
        </TooltipTrigger>
        <TooltipContent className="text-gray-100 font-semibold bg-green-800">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
      <p className="font-semibold text-lg">{value}</p>
    </div>
  );
};
