"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DollarSign, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { soccerBall } from "@lucide/lab";
import { Icon } from "lucide-react";
import { JSX } from "react";
interface StatsOverviewProps {
  data: {
    dailyIncome: number;
    dailyExpenses: number;
    reservations: {
      total: number;
      online: number;
      manual: number;
    };
    incomeByType: {
      courts: number;
      products: number;
      soccerSchool: number;
      others: number;
    };
    expensesByType: {
      maintenance: number;
      staff: number;
      supplies: number;
      others: number;
    };
    occupancyRate: number;
    comparison?: {
      incomeChange: number;
      reservationsChange: number;
    };
  };
}

type TrendDirection = "up" | "down";

interface CardItem {
  title: string;
  value: React.ReactNode;
  icon: JSX.Element;
  trend?: TrendDirection;
  change?: string;
  description?: React.ReactNode;
  className?: string;
}

export function StatsOverview({ data }: StatsOverviewProps) {
  const cards: CardItem[] = [
    {
      title: "Ingresos del Día",
      value: `$${data.dailyIncome.toLocaleString()}`,
      icon: <DollarSign className="h-5 w-5" />,
      trend:
        data.comparison?.incomeChange !== undefined
          ? data.comparison.incomeChange >= 0
            ? "up"
            : "down"
          : "down",
      change:
        data.comparison?.incomeChange !== undefined
          ? `${Math.abs(data.comparison.incomeChange)}%`
          : undefined,
      description: "Total ingresado hoy",
    },
    {
      title: "Gastos del Día",
      value: `$${data.dailyExpenses.toLocaleString()}`,
      icon: <TrendingDown className="h-5 w-5 text-red-500" />,
      description: "Total gastado hoy",
    },
    {
      title: "Reservas Totales",
      value: data.reservations.total,
      icon: <Calendar className="h-5 w-5" />,
      trend:
        data.comparison?.reservationsChange !== undefined
          ? data.comparison.reservationsChange >= 0
            ? "up"
            : "down"
          : undefined,
      change:
        data.comparison?.reservationsChange !== undefined
          ? `${Math.abs(data.comparison.reservationsChange)}%`
          : undefined,
      description: (
        <span className="text-sm">
          <span className="text-blue-500">
            {data.reservations.online} online
          </span>
          {" · "}
          <span className="text-green-500">
            {data.reservations.manual} manual
          </span>
        </span>
      ),
    },
    {
      title: "Ingresos por Tipo",
      value: (
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            Canchas:{" "}
            <span className="font-semibold">
              ${data.incomeByType.courts.toLocaleString()}
            </span>
          </div>
          <div>
            Productos:{" "}
            <span className="font-semibold">
              ${data.incomeByType.products.toLocaleString()}
            </span>
          </div>
          <div>
            Escuelita:{" "}
            <span className="font-semibold">
              ${data.incomeByType.soccerSchool.toLocaleString()}
            </span>
          </div>
          <div>
            Otros:{" "}
            <span className="font-semibold">
              ${data.incomeByType.others.toLocaleString()}
            </span>
          </div>
        </div>
      ),
      icon: <TrendingUp className="h-5 w-5 text-green-500" />,
      className: "md:col-span-2",
    },
    {
      title: "Gastos por Tipo",
      value: (
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            Mantenimiento:{" "}
            <span className="font-semibold">
              ${data.expensesByType.maintenance.toLocaleString()}
            </span>
          </div>
          <div>
            Personal:{" "}
            <span className="font-semibold">
              ${data.expensesByType.staff.toLocaleString()}
            </span>
          </div>
          <div>
            Insumos:{" "}
            <span className="font-semibold">
              ${data.expensesByType.supplies.toLocaleString()}
            </span>
          </div>
          <div>
            Otros:{" "}
            <span className="font-semibold">
              ${data.expensesByType.others.toLocaleString()}
            </span>
          </div>
        </div>
      ),
      icon: <TrendingDown className="h-5 w-5 text-red-500" />,
      className: "md:col-span-2",
    },
    {
      title: "Tasa de Ocupación",
      value: `${data.occupancyRate}%`,

      icon: <Icon iconNode={soccerBall} className="h-5 w-5" />,
      description: "Canchas ocupadas hoy",
    },
  ];

  const getTrendColor = (trend?: "up" | "down") => {
    switch (trend) {
      case "up":
        return "text-green-500";
      case "down":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <Card
          key={index}
          className={`hover:shadow-lg transition-shadow ${card.className || ""}`}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              {card.icon}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            {card.change && (
              <p className={`text-xs ${getTrendColor(card.trend)}`}>
                {card.trend === "up" ? "↑" : "↓"} {card.change} vs. ayer
              </p>
            )}
            {card.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
