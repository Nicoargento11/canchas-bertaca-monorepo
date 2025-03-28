import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const SkeletonPayment = () => {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[60px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-11 w-4/6" />
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="h-7 w-full" />
      </div>
    </div>
  );
};
