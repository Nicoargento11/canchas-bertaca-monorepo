import React from "react";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart } from "recharts";
import getAllReserves from "@/actions/dashboard/getAllReserves";
import { ReservesWithUser } from "@/types/db";
import converDate from "@/utils/convertDate";
import Chart from "../../_components/dashboard/chart";
import { SideBarButton } from "../../_components/dashboard/sideBarButton";

const chartConfig = {
  online: {
    label: "Desktop",
    color: "#2563eb",
  },
  manual: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig;

const chartData = [
  { month: "January", online: 186, manual: 80 },
  { month: "February", online: 305, manual: 200 },
  { month: "March", online: 237, manual: 120 },
  { month: "April", online: 73, mmanual: 190 },
  { month: "May", online: 209, manual: 130 },
  { month: "June", online: 214, manual: 140 },
];
interface ChartData {
  month: string;
  online: number;
  manual: number;
}

const getMonthlyReservationData = (
  reserves: ReservesWithUser[]
): ChartData[] => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const reservationsByMonth: {
    [key: string]: { online: number; manual: number };
  } = {};

  reserves.forEach((reserve) => {
    const month = converDate(reserve.date).getMonth();
    const monthName = monthNames[month];

    if (!reservationsByMonth[monthName]) {
      reservationsByMonth[monthName] = { online: 0, manual: 0 };
    }

    if (
      reserve.paymentId ||
      (reserve.User.role == "USER" && reserve.status == "APPROVED")
    ) {
      reservationsByMonth[monthName].online += 1;
    } else {
      reservationsByMonth[monthName].manual += 1;
    }
  });

  return Object.keys(reservationsByMonth).map((month) => ({
    month,
    online: reservationsByMonth[month].online,
    manual: reservationsByMonth[month].manual,
  }));
};
const PageDashboardStatistics = async () => {
  const allReserves = await getAllReserves();
  const filterData = getMonthlyReservationData(allReserves);
  return (
    <div className="flex flex-col w-full">
      <div className="p-2 w-full flex justify-end">
        <SideBarButton />
      </div>
      <Chart chartData={filterData} />
    </div>
  );
};

export default PageDashboardStatistics;
