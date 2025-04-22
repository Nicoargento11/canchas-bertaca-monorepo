"use client";
import { useState, useEffect } from "react";
import {
  AreaChart,
  BarChart,
  LineChart,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  Bar,
  Line,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Calendar,
  ArrowUp,
  ArrowDown,
  Users,
  DollarSign,
  Filter,
  Download,
  BarChart2,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  ShoppingBag,
  TrendingUp,
  Clock,
  Percent,
  Icon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { soccerBall } from "@lucide/lab";

interface DailyData {
  day: string;
  reservas: number;
  ingresos: number;
  diaAnterior: number;
  cancelaciones: number;
  ocupacion: number;
  clientesNuevos: number;
}

interface WeeklyData {
  week: string;
  reservas: number;
  ingresos: number;
  semanaAnterior: number;
  ocupacion: number;
  clientesNuevos: number;
}

interface MonthlyData {
  month: string;
  reservas: number;
  ingresos: number;
  mesAnterior: number;
  ocupacion: number;
  clientesNuevos: number;
}

interface ProductData {
  name: string;
  sales: number;
  category: string;
}

interface PaymentMethodData {
  name: string;
  value: number;
}

interface CanchaData {
  name: string;
  reservas: number;
}

interface HorarioData {
  hora: string;
  reservas: number;
}

interface DashboardData {
  daily: DailyData[];
  weekly: WeeklyData[];
  monthly: MonthlyData[];
  products: ProductData[];
  paymentMethods: PaymentMethodData[];
  canchas: CanchaData[];
  horarios: HorarioData[];
}

// Datos demo para reservas de fútbol
const generateData = (seed = 1) => {
  const random = (min: number, max: number) => {
    const x = Math.sin(seed++) * 10000;
    const r = x - Math.floor(x);
    return Math.floor(r * (max - min + 1)) + min;
  };

  const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const weeks = ["Sem 1", "Sem 2", "Sem 3", "Sem 4"];
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];

  return {
    daily: days.map((day) => ({
      day,
      reservas: 20 + random(0, 30),
      ingresos: 50000 + random(0, 80000),
      diaAnterior: 18 + random(0, 25),
      cancelaciones: random(0, 5),
      ocupacion: 60 + random(0, 30),
      clientesNuevos: 5 + random(0, 8),
    })),
    weekly: weeks.map((week) => ({
      week,
      reservas: 120 + random(0, 80),
      ingresos: 300000 + random(0, 200000),
      semanaAnterior: 110 + random(0, 70),
      ocupacion: 65 + random(0, 25),
      clientesNuevos: 25 + random(0, 15),
    })),
    monthly: months.map((month) => ({
      month,
      reservas: 500 + random(0, 300),
      ingresos: 1200000 + random(0, 800000),
      mesAnterior: 480 + random(0, 280),
      ocupacion: 70 + random(0, 20),
      clientesNuevos: 100 + random(0, 50),
    })),
    products: [
      { name: "Gatorade", sales: 120, category: "Bebidas" },
      { name: "Agua Mineral", sales: 95, category: "Bebidas" },
      { name: "Barrita Energética", sales: 75, category: "Snacks" },
      { name: "Camiseta", sales: 40, category: "Merchandising" },
      { name: "Pelota", sales: 30, category: "Equipamiento" },
      { name: "Botines", sales: 25, category: "Equipamiento" },
    ],
    paymentMethods: [
      { name: "Efectivo", value: 45 },
      { name: "Tarjeta", value: 35 },
      { name: "Transferencia", value: 20 },
    ],
    canchas: [
      { name: "Cancha 1", reservas: 180 },
      { name: "Cancha 2", reservas: 150 },
      { name: "Cancha 3", reservas: 120 },
      { name: "Cancha 5", reservas: 90 },
    ],
    horarios: [
      { hora: "08-10", reservas: 30 },
      { hora: "10-12", reservas: 45 },
      { hora: "12-14", reservas: 20 },
      { hora: "14-16", reservas: 25 },
      { hora: "16-18", reservas: 60 },
      { hora: "18-20", reservas: 80 },
      { hora: "20-22", reservas: 70 },
    ],
  };
};
type TimeRange = "daily" | "weekly" | "monthly";
type compareMode = "previous" | "none";
type chartType = "area" | "bar" | "line";

export default function FootballReservationsDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>("daily");
  const [compareMode, setCompareMode] = useState<compareMode>("previous");
  const [chartType, setChartType] = useState<chartType>("bar");
  const [currentPage, setCurrentPage] = useState(0);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    setData(generateData(1)); // Semilla fija para consistencia
  }, []);

  if (!data) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    );
  }

  const {
    daily,
    weekly,
    monthly,
    products,
    paymentMethods,
    canchas,
    horarios,
  } = data;
  const currentData =
    timeRange === "daily" ? daily : timeRange === "weekly" ? weekly : monthly;

  const xAxisKey =
    timeRange === "daily" ? "day" : timeRange === "weekly" ? "week" : "month";

  const comparisonKey =
    compareMode === "previous"
      ? timeRange === "daily"
        ? "diaAnterior"
        : timeRange === "weekly"
          ? "semanaAnterior"
          : "mesAnterior"
      : "none";

  // Paginación para productos
  const productsPerPage = 3;
  const pageCount = Math.ceil(products.length / productsPerPage);
  const paginatedProducts = products.slice(
    currentPage * productsPerPage,
    (currentPage + 1) * productsPerPage
  );

  // Funciones de ayuda
  const calculateChange = (current: number, previous: number) => {
    if (!previous || !current) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const totalReservas = currentData.reduce(
    (sum, item) => sum + item.reservas,
    0
  );
  const totalIngresos = currentData.reduce(
    (sum, item) => sum + item.ingresos,
    0
  );
  const avgOcupacion =
    currentData.reduce((sum, item) => sum + item.ocupacion, 0) /
    currentData.length;
  const totalClientesNuevos = currentData.reduce(
    (sum, item) => sum + item.clientesNuevos,
    0
  );
  const canchaPopular = canchas.reduce((prev, current) =>
    prev.reservas > current.reservas ? prev : current
  );
  const horarioPico = horarios.reduce((prev, current) =>
    prev.reservas > current.reservas ? prev : current
  );

  const lastData = currentData[currentData.length - 1];

  const secondaryValue =
    timeRange === "daily" && lastData && "cancelaciones" in lastData
      ? `${lastData.cancelaciones} cancelaciones`
      : undefined;
  return (
    <div className="p-6 space-y-6 bg-muted/10">
      {/* Header con controles */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Dashboard de Reservas de Fútbol
          </h1>
          <p className="text-muted-foreground">
            Estadísticas y rendimiento de tu complejo deportivo
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Select
            value={timeRange}
            onValueChange={(v) => setTimeRange(v as TimeRange)}
          >
            <SelectTrigger className="w-[150px]">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <SelectValue placeholder="Periodo" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Vista Diaria</SelectItem>
              <SelectItem value="weekly">Vista Semanal</SelectItem>
              <SelectItem value="monthly">Vista Mensual</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={compareMode}
            onValueChange={(v) => setCompareMode(v as compareMode)}
          >
            <SelectTrigger className="w-[200px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Comparar con" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="previous">Periodo anterior</SelectItem>
              <SelectItem value="none">Sin comparación</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Reservas Totales"
          value={totalReservas}
          icon={<Users className="h-5 w-5" />}
          change={calculateChange(
            currentData[currentData.length - 1]?.reservas,
            currentData[currentData.length - 2]?.reservas
          )}
          secondaryValue={secondaryValue}
        />
        <MetricCard
          title="Ingresos Totales"
          value={`$${totalIngresos.toLocaleString("es-AR")}`}
          icon={<DollarSign className="h-5 w-5" />}
          change={calculateChange(
            currentData[currentData.length - 1]?.ingresos,
            currentData[currentData.length - 2]?.ingresos
          )}
          secondaryValue={`Promedio: $${Math.round(totalIngresos / currentData.length).toLocaleString("es-AR")}`}
        />
        <MetricCard
          title="Ocupación"
          value={`${avgOcupacion.toFixed(1)}%`}
          icon={<Percent className="h-5 w-5" />}
          change={calculateChange(
            currentData[currentData.length - 1]?.ocupacion,
            currentData[currentData.length - 2]?.ocupacion
          )}
          secondaryValue={`Máximo: ${Math.max(...currentData.map((d) => d.ocupacion))}%`}
        />
        <MetricCard
          title="Cancha Más Popular"
          value={canchaPopular.name}
          icon={<Icon iconNode={soccerBall} className="h-5 w-5" />}
          secondaryValue={`${canchaPopular.reservas} reservas`}
        />
        <MetricCard
          title="Horario Pico"
          value={horarioPico.hora}
          icon={<Clock className="h-5 w-5" />}
          secondaryValue={`${horarioPico.reservas} reservas`}
        />
        <MetricCard
          title="Clientes Nuevos"
          value={totalClientesNuevos}
          icon={<TrendingUp className="h-5 w-5" />}
          change={calculateChange(
            currentData[currentData.length - 1]?.clientesNuevos,
            currentData[currentData.length - 2]?.clientesNuevos
          )}
        />
        <MetricCard
          title="Productos Vendidos"
          value={products.reduce((sum, p) => sum + p.sales, 0)}
          icon={<ShoppingBag className="h-5 w-5" />}
          secondaryValue={`${products.length} productos`}
        />
        <MetricCard
          title="Método de Pago"
          value={
            paymentMethods.reduce((prev, current) =>
              prev.value > current.value ? prev : current
            ).name
          }
          icon={<CreditCard className="h-5 w-5" />}
        />
      </div>

      {/* Tabs para gráficos principales */}
      <Tabs defaultValue="trend" className="space-y-6">
        <TabsList>
          <TabsTrigger value="trend" className="flex gap-2">
            <LineChartIcon className="h-4 w-4" />
            Tendencias
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex gap-2">
            <BarChart2 className="h-4 w-4" />
            Comparación
          </TabsTrigger>
          <TabsTrigger value="details" className="flex gap-2">
            <PieChartIcon className="h-4 w-4" />
            Detalles
          </TabsTrigger>
          <TabsTrigger value="canchas" className="flex gap-2">
            <Icon iconNode={soccerBall} className="h-4 w-4" />
            Canchas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trend">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="flex items-center gap-2">
                  {timeRange === "daily"
                    ? "Tendencia Diaria"
                    : timeRange === "weekly"
                      ? "Tendencia Semanal"
                      : "Tendencia Mensual"}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={chartType === "area" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("area")}
                  >
                    Área
                  </Button>
                  <Button
                    variant={chartType === "bar" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("bar")}
                  >
                    Barras
                  </Button>
                  <Button
                    variant={chartType === "line" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("line")}
                  >
                    Líneas
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "area" ? (
                    <AreaChart data={currentData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey={xAxisKey} />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="reservas"
                        name="Reservas"
                        stroke="#3b82f6"
                        fill="#3b82f6/20"
                        strokeWidth={2}
                      />
                      <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="ingresos"
                        name="Ingresos ($)"
                        stroke="#10b981"
                        fill="#10b981/20"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  ) : chartType === "bar" ? (
                    <BarChart data={currentData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey={xAxisKey} />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar
                        yAxisId="left"
                        dataKey="reservas"
                        name="Reservas"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="ingresos"
                        name="Ingresos ($)"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  ) : (
                    <LineChart data={currentData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey={xAxisKey} />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="reservas"
                        name="Reservas"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="ingresos"
                        name="Ingresos ($)"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>
                {timeRange === "daily"
                  ? "Comparación Diaria"
                  : timeRange === "weekly"
                    ? "Comparación Semanal"
                    : "Comparación Mensual"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={currentData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey={xAxisKey} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="reservas"
                      name="Reservas Actuales"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                    {compareMode !== "none" && (
                      <Bar
                        dataKey={comparisonKey}
                        name="Periodo Anterior"
                        fill="#94a3b8"
                        radius={[4, 4, 0, 0]}
                      />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de productos */}
            <Card>
              <CardHeader>
                <CardTitle>Ventas en Tienda</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={products}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="sales"
                        nameKey="name"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {products.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {paginatedProducts.map((product) => (
                      <div
                        key={product.name}
                        className="flex items-center justify-between py-1"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="px-2 py-0.5">
                            {product.category}
                          </Badge>
                          <span>{product.name}</span>
                        </div>
                        <span className="font-medium">
                          {product.sales} ventas
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={currentPage >= pageCount - 1}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Métodos de pago */}
            <Card>
              <CardHeader>
                <CardTitle>Métodos de Pago</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentMethods}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {paymentMethods.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              COLORS_PAYMENTS[index % COLORS_PAYMENTS.length]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.name}
                      className="flex flex-col items-center"
                    >
                      <Badge variant="outline" className="px-3 py-1">
                        {method.name}
                      </Badge>
                      <span className="text-sm font-medium mt-1">
                        {method.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="canchas">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Uso de canchas */}
            <Card>
              <CardHeader>
                <CardTitle>Reservas por Cancha</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={canchas}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="reservas"
                        name="Reservas"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>
                    Cancha más solicitada: {canchaPopular.name} (
                    {canchaPopular.reservas} reservas)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Horarios */}
            <Card>
              <CardHeader>
                <CardTitle>Reservas por Horario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={horarios}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="hora" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="reservas"
                        name="Reservas"
                        fill="#8b5cf6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>
                    Horario pico: {horarioPico.hora} ({horarioPico.reservas}{" "}
                    reservas)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Componentes auxiliares
const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];
const COLORS_PAYMENTS = ["#22c55e", "#3b82f6", "#f59e0b"];

function MetricCard({
  title,
  value,
  icon,
  change = 0,
  secondaryValue,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  secondaryValue?: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className="p-2 rounded-lg bg-muted/50">{icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div
            className={`flex items-center text-xs mt-1 ${
              change > 0
                ? "text-green-500"
                : change < 0
                  ? "text-red-500"
                  : "text-gray-500"
            }`}
          >
            {change > 0 ? (
              <ArrowUp className="h-3 w-3 mr-1" />
            ) : change < 0 ? (
              <ArrowDown className="h-3 w-3 mr-1" />
            ) : null}
            {change !== 0 ? `${Math.abs(change)}%` : "Sin cambios"}
          </div>
        )}
        {secondaryValue && (
          <p className="text-xs text-muted-foreground mt-2">{secondaryValue}</p>
        )}
      </CardContent>
    </Card>
  );
}
