"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

export type PeriodType = "today" | "7d" | "30d" | "this-month" | "last-month" | "custom";

interface PeriodSelectorProps {
    value: DateRange | undefined;
    selectedPeriod: PeriodType;
    onChange: (range: DateRange | undefined, period: PeriodType) => void;
}

const PERIOD_OPTIONS: { value: PeriodType; label: string }[] = [
    { value: "today", label: "Hoy" },
    { value: "7d", label: "7 días" },
    { value: "30d", label: "30 días" },
    { value: "this-month", label: "Este mes" },
    { value: "last-month", label: "Mes anterior" },
    { value: "custom", label: "Personalizado" },
];

export function PeriodSelector({ value, selectedPeriod, onChange }: PeriodSelectorProps) {
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const handlePeriodClick = (period: PeriodType) => {
        const today = new Date();

        let newRange: DateRange | undefined;

        switch (period) {
            case "today":
                newRange = { from: today, to: today };
                break;
            case "7d":
                newRange = { from: subDays(today, 6), to: today };
                break;
            case "30d":
                newRange = { from: subDays(today, 29), to: today };
                break;
            case "this-month":
                newRange = { from: startOfMonth(today), to: endOfMonth(today) };
                break;
            case "last-month":
                const lastMonth = subMonths(today, 1);
                newRange = { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
                break;
            case "custom":
                setIsCalendarOpen(true);
                return;
        }

        onChange(newRange, period);
    };

    const handleCalendarSelect = (range: DateRange | undefined) => {
        if (range?.from) {
            onChange(range, "custom");
        }
    };

    const formatDateRange = () => {
        if (!value?.from) return "Seleccionar";
        if (value.to && value.from.getTime() !== value.to.getTime()) {
            return `${format(value.from, "dd MMM", { locale: es })} - ${format(value.to, "dd MMM", { locale: es })}`;
        }
        return format(value.from, "dd MMM yyyy", { locale: es });
    };

    return (
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
            {/* Quick period buttons */}
            {PERIOD_OPTIONS.slice(0, 5).map((option) => (
                <Button
                    key={option.value}
                    variant={selectedPeriod === option.value ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                        "h-8 px-3 text-xs font-medium transition-all",
                        selectedPeriod === option.value
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "hover:bg-muted"
                    )}
                    onClick={() => handlePeriodClick(option.value)}
                >
                    {option.label}
                </Button>
            ))}

            {/* Custom date picker */}
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant={selectedPeriod === "custom" ? "default" : "ghost"}
                        size="sm"
                        className={cn(
                            "h-8 px-3 text-xs font-medium gap-1",
                            selectedPeriod === "custom"
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted"
                        )}
                    >
                        <CalendarIcon className="h-3 w-3" />
                        {selectedPeriod === "custom" ? formatDateRange() : "Personalizado"}
                        <ChevronDown className="h-3 w-3" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        mode="range"
                        selected={value}
                        onSelect={handleCalendarSelect}
                        numberOfMonths={2}
                        locale={es}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
