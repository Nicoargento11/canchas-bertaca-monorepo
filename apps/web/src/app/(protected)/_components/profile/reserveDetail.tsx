import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LucideProps } from "lucide-react";
import React from "react";
import { IconType } from "react-icons";
import { cn } from "@/lib/utils";

interface ReserveDetailProps {
  Icon:
    | React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>
    | IconType;
  label: string;
  value: string | number;
  iconClass?: string;
  valueClass?: string;
  containerClass?: string;
  tooltipSide?: "top" | "right" | "bottom" | "left";
}

export const ReserveDetail = ({
  Icon,
  label,
  value,
  iconClass = "text-Primary",
  valueClass = "font-semibold text-Neutral-dark",
  containerClass = "",
  tooltipSide = "top",
}: ReserveDetailProps) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2 sm:gap-4 p-3 sm:p-4 bg-white rounded-xl border-2 border-Neutral/20 shadow-md hover:shadow-lg transition-all duration-200",
        containerClass
      )}
    >
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center p-2 sm:p-3 rounded-xl bg-gradient-to-br from-Primary/10 to-Primary/20 border-2 border-Primary/30 shadow-inner flex-shrink-0">
            <Icon className={cn("flex-shrink-0", iconClass)} size={18} aria-hidden="true" />
          </div>
        </TooltipTrigger>
        <TooltipContent
          side={tooltipSide}
          className="text-sm font-medium bg-Primary text-white border-Primary/20 shadow-xl"
        >
          {label}
        </TooltipContent>
      </Tooltip>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-Neutral-dark/50 uppercase tracking-widest mb-1 border-b border-Neutral/20 pb-1">
          {label}
        </p>
        <p className={cn("text-sm sm:text-lg font-bold text-Neutral-dark truncate", valueClass)}>
          {value}
        </p>
      </div>
    </div>
  );
};
