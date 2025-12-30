"use client";

import { Card } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface PaymentMethodData {
    name: string;
    value: number;
}

interface PaymentMethodsCardProps {
    paymentMethods: PaymentMethodData[];
}

const COLORS = {
    Efectivo: "#10b981", // emerald
    Tarjeta: "#3b82f6", // blue
    Transferencia: "#8b5cf6", // purple
    MercadoPago: "#06b6d4", // cyan
    Otro: "#6b7280", // gray
};

export function PaymentMethodsCard({ paymentMethods }: PaymentMethodsCardProps) {
    const chartData = paymentMethods.map((method) => ({
        name: method.name,
        value: method.value,
        fill: COLORS[method.name as keyof typeof COLORS] || COLORS.Otro,
    }));

    const totalPercentage = paymentMethods.reduce((sum, m) => sum + m.value, 0);

    return (
        <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold">Métodos de Pago</h3>
                    <p className="text-sm text-muted-foreground">
                        Distribución de pagos
                    </p>
                </div>
                <CreditCard className="h-5 w-5 text-blue-600" />
            </div>

            {paymentMethods.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <CreditCard className="h-12 w-12 mb-2 opacity-20" />
                    <p className="text-sm">No hay datos de pagos</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Pie Chart */}
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => `${value}%`}
                                    contentStyle={{
                                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                                        border: "none",
                                        borderRadius: "8px",
                                        color: "white",
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend with percentages */}
                    <div className="space-y-2">
                        {paymentMethods.map((method, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between text-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{
                                            backgroundColor:
                                                COLORS[method.name as keyof typeof COLORS] ||
                                                COLORS.Otro,
                                        }}
                                    />
                                    <span className="font-medium">{method.name}</span>
                                </div>
                                <span className="font-semibold">{method.value}%</span>
                            </div>
                        ))}
                    </div>

                    {/* Validation check */}
                    {totalPercentage !== 100 && (
                        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                            ⚠️ Los porcentajes suman {totalPercentage}%
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}
