"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Calendar,
    ShoppingBag,
    ArrowDownLeft,
    CreditCard,
    DollarSign
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

export interface Transaction {
    id: string;
    type: "reserva" | "venta" | "egreso" | "pago";
    description: string;
    amount: number;
    date: Date;
    status?: "completed" | "pending";
}

interface TransactionsListProps {
    transactions: Transaction[];
    title?: string;
    maxHeight?: number;
}

export function TransactionsList({
    transactions,
    title = "Últimos movimientos",
    maxHeight = 400,
}: TransactionsListProps) {
    const getIcon = (type: Transaction["type"]) => {
        switch (type) {
            case "reserva":
                return <Calendar className="h-4 w-4" />;
            case "venta":
                return <ShoppingBag className="h-4 w-4" />;
            case "egreso":
                return <ArrowDownLeft className="h-4 w-4" />;
            case "pago":
                return <CreditCard className="h-4 w-4" />;
            default:
                return <DollarSign className="h-4 w-4" />;
        }
    };

    const getTypeColor = (type: Transaction["type"]) => {
        switch (type) {
            case "reserva":
                return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
            case "venta":
                return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
            case "egreso":
                return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
            case "pago":
                return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const getTypeLabel = (type: Transaction["type"]) => {
        switch (type) {
            case "reserva": return "Reserva";
            case "venta": return "Venta";
            case "egreso": return "Egreso";
            case "pago": return "Pago";
            default: return type;
        }
    };

    const formatAmount = (amount: number, type: Transaction["type"]) => {
        const sign = type === "egreso" ? "-" : "+";
        const color = type === "egreso" ? "text-red-600" : "text-emerald-600";
        return (
            <span className={cn("font-semibold", color)}>
                {sign}${Math.abs(amount).toLocaleString("es-AR")}
            </span>
        );
    };

    return (
        <Card className="border shadow-sm h-full">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium">{title}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                        {transactions.length} items
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <ScrollArea style={{ height: maxHeight }}>
                    <div className="space-y-3">
                        {transactions.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                No hay movimientos en este período
                            </div>
                        ) : (
                            transactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "p-2 rounded-lg",
                                            getTypeColor(transaction.type)
                                        )}>
                                            {getIcon(transaction.type)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">
                                                {transaction.description}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {format(transaction.date, "dd MMM, HH:mm", { locale: es })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {formatAmount(transaction.amount, transaction.type)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
