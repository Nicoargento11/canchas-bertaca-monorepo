"use client";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

const chartConfig = {
  desktop: {
    label: "Online",
    color: "#2563eb",
  },
  mobile: {
    label: "Manual",
    color: "#60a5fa",
  },
} satisfies ChartConfig;

type ChartData = {
  month: string;
  online: number;
  manual: number;
};
interface ChartDataProps {
  chartData: ChartData[];
}

const Chart = ({ chartData }: ChartDataProps) => {
  console.log(chartData);
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="online" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="manual" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
};

export default Chart;
