"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

interface DailyData {
    day: string;
    ingresos: number;
    reservas: number;
}

interface RevenueChartProps {
    data: DailyData[];
    title?: string;
}

export function RevenueChart({ data, title = "Ingresos" }: RevenueChartProps) {
    const formatCurrency = (value: number) => {
        return `$${value.toLocaleString("es-AR")}`;
    };

    return (
        <Card className="border shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#888' }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#888' }}
                                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                                formatter={(value: number, name: string) => [
                                    name === "ingresos" ? formatCurrency(value) : value,
                                    name === "ingresos" ? "Ingresos" : "Reservas"
                                ]}
                                contentStyle={{
                                    backgroundColor: "white",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                }}
                            />
                            <Legend
                                wrapperStyle={{ paddingTop: "10px" }}
                                formatter={(value) => (
                                    <span className="text-sm text-muted-foreground">
                                        {value === "ingresos" ? "Ingresos" : "Reservas"}
                                    </span>
                                )}
                            />
                            <Bar
                                dataKey="ingresos"
                                fill="#22c55e"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={40}
                            />
                            <Bar
                                dataKey="reservas"
                                fill="#3b82f6"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
