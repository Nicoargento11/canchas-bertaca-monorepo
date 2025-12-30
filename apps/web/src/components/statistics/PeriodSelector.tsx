"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type PeriodMode = "day" | "week" | "month" | "year";

export interface Period {
    mode: PeriodMode;
    year: number;
    month?: number;
    week?: number;
    day?: number;
}

interface PeriodSelectorProps {
    onPeriodChange: (period: Period) => void;
    currentMode?: PeriodMode;
}

export function PeriodSelector({ onPeriodChange, currentMode: externalMode }: PeriodSelectorProps) {
    const now = new Date();

    const getWeekOfMonth = (date: Date) => {
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        return Math.ceil((date.getDate() + firstDay.getDay()) / 7);
    };

    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [week, setWeek] = useState(getWeekOfMonth(now));
    const [day, setDay] = useState(now.getDate());

    const activeMode = externalMode || "day";

    const notifyChange = (newMode: PeriodMode, y: number, m?: number, w?: number, d?: number) => {
        const period: Period = { mode: newMode, year: y };
        if (newMode === "day") {
            period.month = m;
            period.day = d;
        } else if (newMode === "week") {
            period.month = m;
            period.week = w;
        } else if (newMode === "month") {
            period.month = m;
        }
        onPeriodChange(period);
    };

    const handleModeChange = (newMode: PeriodMode) => {
        notifyChange(newMode, year, month, week, day);
    };

    const handleYearChange = (value: string) => {
        const newYear = parseInt(value);
        setYear(newYear);
        notifyChange(activeMode, newYear, month, week, day);
    };

    const handleMonthChange = (value: string) => {
        const newMonth = parseInt(value);
        setMonth(newMonth);
        notifyChange(activeMode, year, newMonth, week, day);
    };

    const handleWeekChange = (value: string) => {
        const newWeek = parseInt(value);
        setWeek(newWeek);
        notifyChange(activeMode, year, month, newWeek, day);
    };

    const handleDayChange = (value: string) => {
        const newDay = parseInt(value);
        setDay(newDay);
        notifyChange(activeMode, year, month, week, newDay);
    };

    const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);
    const months = [
        { value: 1, label: "Enero" }, { value: 2, label: "Febrero" }, { value: 3, label: "Marzo" },
        { value: 4, label: "Abril" }, { value: 5, label: "Mayo" }, { value: 6, label: "Junio" },
        { value: 7, label: "Julio" }, { value: 8, label: "Agosto" }, { value: 9, label: "Septiembre" },
        { value: 10, label: "Octubre" }, { value: 11, label: "Noviembre" }, { value: 12, label: "Diciembre" },
    ];
    const weeks = [1, 2, 3, 4];
    const getDaysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();
    const days = Array.from({ length: getDaysInMonth(year, month) }, (_, i) => i + 1);

    return (
        <div className="space-y-4 p-4 bg-card rounded-lg border">
            {/* Mode Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
                <Button variant={activeMode === "day" ? "default" : "outline"} size="sm" onClick={() => handleModeChange("day")}>
                    <Calendar className="h-4 w-4 mr-1" />
                    Hoy
                </Button>
                <Button variant={activeMode === "week" ? "default" : "outline"} size="sm" onClick={() => handleModeChange("week")}>
                    Semana
                </Button>
                <Button variant={activeMode === "month" ? "default" : "outline"} size="sm" onClick={() => handleModeChange("month")}>
                    Mes
                </Button>
                <Button variant={activeMode === "year" ? "default" : "outline"} size="sm" onClick={() => handleModeChange("year")}>
                    Año
                </Button>
            </div>

            {/* Selectors */}
            <div className="flex items-center gap-2 flex-wrap">
                {activeMode === "day" && (
                    <>
                        <Select value={day.toString()} onValueChange={handleDayChange}>
                            <SelectTrigger className="w-[80px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {days.map(d => <SelectItem key={d} value={d.toString()}>{d}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={month.toString()} onValueChange={handleMonthChange}>
                            <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {months.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={year.toString()} onValueChange={handleYearChange}>
                            <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </>
                )}

                {activeMode === "week" && (
                    <>
                        <Select value={week.toString()} onValueChange={handleWeekChange}>
                            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {weeks.map(w => <SelectItem key={w} value={w.toString()}>Semana {w}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={month.toString()} onValueChange={handleMonthChange}>
                            <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {months.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={year.toString()} onValueChange={handleYearChange}>
                            <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </>
                )}

                {activeMode === "month" && (
                    <>
                        <Select value={month.toString()} onValueChange={handleMonthChange}>
                            <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {months.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={year.toString()} onValueChange={handleYearChange}>
                            <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </>
                )}

                {activeMode === "year" && (
                    <Select value={year.toString()} onValueChange={handleYearChange}>
                        <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                        </SelectContent>
                    </Select>
                )}
            </div>
        </div>
    );
}
