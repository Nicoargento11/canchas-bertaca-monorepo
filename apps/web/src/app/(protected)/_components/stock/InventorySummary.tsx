"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Package, AlertTriangle, CheckCircle, ShoppingBag } from "lucide-react";
import { useProductStore } from "@/store/stockManagementStore";
import { Complex } from "@/services/complex/complex";

interface InventorySummaryProps {
  complex: Complex;
}
export function InventorySummary({ complex }: InventorySummaryProps) {
  const { products, initializeProducts } = useProductStore();
  const [stats, setStats] = useState({
    total: 0,
    agotados: 0,
    bajoStock: 0,
    disponibles: 0,
  });
  const [categoriaData, setCategoriaData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    initializeProducts(complex.products || []);
  }, [complex.products, initializeProducts]);

  useEffect(() => {
    if (products.length > 0) {
      // Calcular estadísticas
      const total = products.length;
      const agotados = products.filter((p) => p.stock === 0).length;
      const bajoStock = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
      const disponibles = products.filter((p) => p.stock > 10).length;

      // Verificar productos próximos a caducar
      const hoy = new Date();

      setStats({ total, agotados, bajoStock, disponibles });

      // Preparar datos para gráficos
      const categoriasCount: Record<string, number> = {};
      products.forEach((p) => {
        const categoria = p.category || "Sin categoría";
        categoriasCount[categoria] = (categoriasCount[categoria] || 0) + 1;
      });

      setCategoriaData(Object.entries(categoriasCount).map(([name, value]) => ({ name, value })));
    }
  }, [products]);

  // Datos para el gráfico de barras
  const stockData = [
    { name: "Agotados", cantidad: stats.agotados, color: "#ef4444" },
    { name: "Bajo Stock", cantidad: stats.bajoStock, color: "#f59e0b" },
    { name: "Disponibles", cantidad: stats.disponibles, color: "#10b981" },
  ];

  // Colores para gráficos
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

  return (
    <div className="space-y-6">
      {/* Tarjetas de estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Productos en inventario</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Agotados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.agotados}</div>
            <p className="text-xs text-muted-foreground">Necesitan reposición</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bajo Stock</CardTitle>
            <ShoppingBag className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bajoStock}</div>
            <p className="text-xs text-muted-foreground">Menos de 10 unidades</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.disponibles}</div>
            <p className="text-xs text-muted-foreground">Stock adecuado</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos en Cards separadas */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Gráfico de Estado de Stock */}
        <Card>
          <CardHeader>
            <CardTitle>Estado del Stock</CardTitle>
            <CardDescription>Distribución de productos por estado de inventario</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [value, "Cantidad de productos"]} />
                <Bar dataKey="cantidad" name="Cantidad">
                  {stockData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Distribución por Categoría */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Categoría</CardTitle>
            <CardDescription>Proporción de productos por categoría</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoriaData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoriaData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, `Productos en ${name}`]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
