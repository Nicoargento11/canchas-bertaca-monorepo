"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
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
import { useParams } from "next/navigation";
import { DateRange } from "react-day-picker";
import { addDays, format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { getDashboard } from "@/services/reports/reports";
import { getComplexBySlug } from "@/services/complex/complex";
import { DashboardHeader } from "../DashboardHeader";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { es } from "date-fns/locale";

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

export interface DashboardData {
  daily: DailyData[];
  weekly: WeeklyData[];
  monthly: MonthlyData[];
  products: ProductData[];
  paymentMethods: PaymentMethodData[];
  canchas: CanchaData[];
  horarios: HorarioData[];
}

type TimeRange = "daily" | "weekly" | "monthly";
type compareMode = "previous" | "none";
type chartType = "area" | "bar" | "line";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
const COLORS_PAYMENTS = ["#22c55e", "#3b82f6", "#f59e0b"];

export default function FootballReservationsDashboard() {
  const pathname = usePathname();
  const slug = pathname.split("/")[1];
  const [timeRange, setTimeRange] = useState<TimeRange>("daily");
  const [compareMode, setCompareMode] = useState<compareMode>("previous");
  const [chartType, setChartType] = useState<chartType>("bar");
  const [currentPage, setCurrentPage] = useState(0);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [complex, setComplex] = useState<any>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });
  useEffect(() => {
    const fetchComplexAndData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Primero obtener el complejo por slug
        const complexResult = await getComplexBySlug(slug);
        if (!complexResult.data) {
          setError("No se encontró el complejo");
          return;
        }

        setComplex(complexResult.data);

        // Luego obtener los datos del dashboard usando el ID del complejo
        const result = await getDashboard(
          complexResult.data.id,
          dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
          dateRange?.to
            ? format(dateRange.to, "yyyy-MM-dd")
            : dateRange?.from
              ? format(dateRange.from, "yyyy-MM-dd")
              : undefined
        );

        if (result.success && result.data) {
          setData(result.data);
        } else {
          setError(result.error || "Error al cargar los datos");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error al conectar con el servidor");
      } finally {
        setLoading(false);
      }
    };

    // if (slug) {
    // }
    fetchComplexAndData();
  }, [dateRange]);

  if (loading) {
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

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
          No se encontraron datos para mostrar
        </div>
      </div>
    );
  }

  const { daily, weekly, monthly, products, paymentMethods, canchas, horarios } = data;
  const currentData = timeRange === "daily" ? daily : timeRange === "weekly" ? weekly : monthly;

  const xAxisKey = timeRange === "daily" ? "day" : timeRange === "weekly" ? "week" : "month";

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

  // Calcular totales basados en todo el rango de datos seleccionado (usando daily como base para mayor precisión)
  const totalReservas = daily.reduce((acc, curr) => acc + curr.reservas, 0);
  const totalIngresos = daily.reduce((acc, curr) => acc + curr.ingresos, 0);
  const totalClientesNuevos = daily.reduce((acc, curr) => acc + curr.clientesNuevos, 0);
  const avgOcupacion =
    daily.length > 0
      ? Math.round(daily.reduce((acc, curr) => acc + curr.ocupacion, 0) / daily.length)
      : 0;

  // Para la comparación, usamos la suma de los valores anteriores (diaAnterior/semanaAnterior/mesAnterior)
  // Nota: Esto compara con el periodo desplazado en 1 unidad (día/semana/mes)
  const totalReservasAnterior = daily.reduce((acc, curr) => acc + (curr.diaAnterior || 0), 0);
  const totalIngresosAnterior = daily.reduce(
    (acc, curr) => acc + (curr.diaAnterior /* Asumiendo proporcional */ || 0), // El backend no devuelve ingresoAnterior explícito en daily, esto es una limitación actual
    0
  );

  const canchaPopular =
    canchas.length > 0
      ? canchas.reduce((prev, current) => (prev.reservas > current.reservas ? prev : current))
      : { name: "Sin datos", reservas: 0 };

  const horarioPico =
    horarios.length > 0
      ? horarios.reduce((prev, current) => (prev.reservas > current.reservas ? prev : current))
      : { hora: "Sin datos", reservas: 0 };

  const lastData = currentData[currentData.length - 1];

  const secondaryValue =
    timeRange === "daily" && lastData && "cancelaciones" in lastData
      ? `${lastData.cancelaciones} cancelaciones (último día)`
      : undefined;

  return (
    <div className="p-2 sm:p-6 space-y-6 bg-muted/10">
      {/* Header con controles */}
      <DashboardHeader title="Estadísticas de Reservas" />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Dashboard de {complex?.name || "Complejo Deportivo"}
          </h1>
          <p className="text-muted-foreground">
            Estadísticas y rendimiento de tu complejo deportivo
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[260px] justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
                    </>
                  ) : (
                    format(dateRange.from, "dd/MM/yyyy")
                  )
                ) : (
                  <span>Seleccionar fechas</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="flex">
                <div className="flex flex-col gap-2 p-3 border-r">
                  <Button
                    variant="ghost"
                    className="justify-start text-left font-normal"
                    onClick={() =>
                      setDateRange({
                        from: new Date(),
                        to: new Date(),
                      })
                    }
                  >
                    Hoy
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start text-left font-normal"
                    onClick={() =>
                      setDateRange({
                        from: addDays(new Date(), -1),
                        to: addDays(new Date(), -1),
                      })
                    }
                  >
                    Ayer
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start text-left font-normal"
                    onClick={() =>
                      setDateRange({
                        from: addDays(new Date(), -7),
                        to: new Date(),
                      })
                    }
                  >
                    Últimos 7 días
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start text-left font-normal"
                    onClick={() =>
                      setDateRange({
                        from: addDays(new Date(), -30),
                        to: new Date(),
                      })
                    }
                  >
                    Últimos 30 días
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start text-left font-normal"
                    onClick={() =>
                      setDateRange({
                        from: startOfMonth(new Date()),
                        to: endOfMonth(new Date()),
                      })
                    }
                  >
                    Este mes
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start text-left font-normal"
                    onClick={() =>
                      setDateRange({
                        from: startOfMonth(subMonths(new Date(), 1)),
                        to: endOfMonth(subMonths(new Date(), 1)),
                      })
                    }
                  >
                    Mes pasado
                  </Button>
                </div>
                <CalendarComponent
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  locale={es}
                />
              </div>
            </PopoverContent>
          </Popover>

          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
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

          <Select value={compareMode} onValueChange={(v) => setCompareMode(v as compareMode)}>
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

          {/* <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button> */}
        </div>
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Reservas"
          value={totalReservas}
          icon={<Users className="h-5 w-5" />}
          change={calculateChange(totalReservas, totalReservasAnterior)}
          secondaryValue={secondaryValue}
        />
        <MetricCard
          title="Total Ingresos"
          value={`$${totalIngresos.toLocaleString("es-AR")}`}
          icon={<DollarSign className="h-5 w-5" />}
          change={0}
        />
        <MetricCard
          title="Ocupación Promedio"
          value={`${avgOcupacion}%`}
          icon={<Percent className="h-5 w-5" />}
          change={0}
        />
        <MetricCard
          title="Clientes Nuevos"
          value={totalClientesNuevos}
          icon={<Users className="h-5 w-5" />}
          change={0}
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
          title="Productos Vendidos"
          value={products.length > 0 ? products.reduce((sum, p) => sum + p.sales, 0) : 0}
          icon={<ShoppingBag className="h-5 w-5" />}
          secondaryValue={`${products.length} productos`}
        />
        <MetricCard
          title="Método de Pago"
          value={
            paymentMethods.length > 0
              ? paymentMethods.reduce((prev, current) =>
                  prev.value > current.value ? prev : current
                ).name
              : "Sin datos"
          }
          icon={<CreditCard className="h-5 w-5" />}
        />
      </div>

      {/* Tabs para gráficos principales */}
      <Tabs defaultValue="trend" className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4 overflow-x-auto">
          <TabsList className="h-auto p-1 bg-gray-100/80 rounded-lg inline-flex">
            <TabsTrigger
              value="trend"
              className="px-4 py-2 gap-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm hover:bg-gray-200 hover:text-gray-900"
            >
              <LineChartIcon className="h-4 w-4" />
              Tendencias
            </TabsTrigger>
            <TabsTrigger
              value="comparison"
              className="px-4 py-2 gap-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm hover:bg-gray-200 hover:text-gray-900"
            >
              <BarChart2 className="h-4 w-4" />
              Comparación
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="px-4 py-2 gap-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm hover:bg-gray-200 hover:text-gray-900"
            >
              <PieChartIcon className="h-4 w-4" />
              Detalles
            </TabsTrigger>
            <TabsTrigger
              value="canchas"
              className="px-4 py-2 gap-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm hover:bg-gray-200 hover:text-gray-900"
            >
              <Icon iconNode={soccerBall} className="h-4 w-4" />
              Canchas
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="trend">
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="pb-1 px-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="flex items-center gap-2 text-base">
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
            <CardContent className="p-0">
              <div className="h-[320px] sm:h-80 w-full">
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
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="pb-1 px-2">
              <CardTitle className="text-base">
                {timeRange === "daily"
                  ? "Comparación Diaria"
                  : timeRange === "weekly"
                    ? "Comparación Semanal"
                    : "Comparación Mensual"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[320px] sm:h-80 w-full">
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
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader className="pb-1 px-2">
                <CardTitle className="text-base">Ventas en Tienda</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[260px] sm:h-64 w-full">
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
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {products.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                      <div key={product.name} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="px-2 py-0.5">
                            {product.category}
                          </Badge>
                          <span>{product.name}</span>
                        </div>
                        <span className="font-medium">{product.sales} ventas</span>
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
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader className="pb-1 px-2">
                <CardTitle className="text-base">Métodos de Pago</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[260px] sm:h-64 w-full">
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
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {paymentMethods.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS_PAYMENTS[index % COLORS_PAYMENTS.length]}
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
                    <div key={method.name} className="flex flex-col items-center">
                      <Badge variant="outline" className="px-3 py-1">
                        {method.name}
                      </Badge>
                      <span className="text-sm font-medium mt-1">{method.value}%</span>
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
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader className="pb-1 px-2">
                <CardTitle className="text-base">Reservas por Cancha</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[260px] sm:h-64 w-full">
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
                    Cancha más solicitada: {canchaPopular.name} ({canchaPopular.reservas} reservas)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Horarios */}
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader className="pb-1 px-2">
                <CardTitle className="text-base">Reservas por Horario</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[260px] sm:h-64 w-full">
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
                    Horario pico: {horarioPico.hora} ({horarioPico.reservas} reservas)
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
              change > 0 ? "text-green-500" : change < 0 ? "text-red-500" : "text-gray-500"
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
        {secondaryValue && <p className="text-xs text-muted-foreground mt-2">{secondaryValue}</p>}
      </CardContent>
    </Card>
  );
}
