"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    change?: number; // Porcentaje de cambio vs período anterior
    changeLabel?: string;
    size?: "sm" | "md" | "lg";
    variant?: "default" | "primary" | "success" | "danger";
}

export function MetricCard({
    title,
    value,
    icon,
    change,
    changeLabel = "vs período anterior",
    size = "md",
    variant = "default",
}: MetricCardProps) {
    const getChangeColor = () => {
        if (change === undefined || change === 0) return "text-muted-foreground";
        return change > 0 ? "text-emerald-600" : "text-red-500";
    };

    const getChangeIcon = () => {
        if (change === undefined || change === 0) return <Minus className="h-3 w-3" />;
        return change > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
    };

    const sizeClasses = {
        sm: "p-4",
        md: "p-5",
        lg: "p-6",
    };

    const valueSizeClasses = {
        sm: "text-xl",
        md: "text-2xl",
        lg: "text-4xl",
    };

    const variantClasses = {
        default: "bg-card",
        primary: "bg-primary/5 border-primary/20",
        success: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800",
        danger: "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800",
    };

    return (
        <Card className={cn(
            "border shadow-sm hover:shadow-md transition-shadow",
            variantClasses[variant]
        )}>
            <CardContent className={cn("flex flex-col gap-2", sizeClasses[size])}>
                {/* Header with title and icon */}
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                        {title}
                    </span>
                    {icon && (
                        <div className="p-2 rounded-lg bg-muted/50">
                            {icon}
                        </div>
                    )}
                </div>

                {/* Value */}
                <div className={cn("font-bold tracking-tight", valueSizeClasses[size])}>
                    {value}
                </div>

                {/* Change indicator */}
                {change !== undefined && (
                    <div className={cn("flex items-center gap-1 text-xs", getChangeColor())}>
                        {getChangeIcon()}
                        <span className="font-medium">
                            {Math.abs(change).toFixed(1)}%
                        </span>
                        <span className="text-muted-foreground ml-1">
                            {changeLabel}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
