"use client";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps extends BadgeProps {
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled";
  children: React.ReactNode;
}

const statusVariants = {
  pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80",
  approved: "bg-green-100 text-green-800 hover:bg-green-100/80",
  rejected: "bg-red-100 text-red-800 hover:bg-red-100/80",
  completed: "bg-blue-100 text-blue-800 hover:bg-blue-100/80",
  cancelled: "bg-gray-100 text-gray-800 hover:bg-gray-100/80",
};

export function StatusBadge({
  status,
  className,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <Badge
      className={cn(statusVariants[status], "capitalize", className)}
      {...props}
    >
      {children}
    </Badge>
  );
}
