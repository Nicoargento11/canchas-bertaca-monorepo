"use client";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Complex } from "@/services/complex/complex";
import { useProductStore } from "@/store/stockManagementStore";
interface ProfitMarginProps {
  complex: Complex;
}

export function ProfitMargin({ complex }: ProfitMarginProps) {
  const { products, initializeProducts } = useProductStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [margenPorCategoria, setMargenPorCategoria] = useState<
    {
      name: string;
      margen: number;
      ventas: number;
    }[]
  >([]);

  useEffect(() => {
    initializeProducts(complex.products);
  }, [complex.products, initializeProducts]);

  useEffect(() => {
    if (products.length > 0) {
      const categorias: Record<string, { margen: number; ventas: number }> = {};

      products.forEach((producto) => {
        if (!producto.category) return;

        const margenUnitario = (producto.salePrice || 0) - (producto.costPrice || 0);
        const margenTotal = margenUnitario * (producto.stock || 0);

        if (categorias[producto.category]) {
          categorias[producto.category].margen += margenTotal;
          categorias[producto.category].ventas += producto.stock || 0;
        } else {
          categorias[producto.category] = {
            margen: margenTotal,
            ventas: producto.stock || 0,
          };
        }
      });

      setMargenPorCategoria(
        Object.entries(categorias).map(([name, { margen, ventas }]) => ({
          name,
          margen,
          ventas,
        }))
      );
    }
  }, [products]);

  const productosConMargen = products
    .filter(
      (producto) =>
        producto.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map((producto) => {
      const precio = producto.salePrice || 0;
      const costo = producto.costPrice || 0;
      const margenUnitario = precio - costo;
      const margenPorcentaje = precio > 0 ? (margenUnitario / precio) * 100 : 0;

      return {
        ...producto,
        margenUnitario,
        margenPorcentaje,
        margenTotal: margenUnitario * (producto.stock || 0),
      };
    });

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Gráfico de Barras - Margen por Categoría */}
        <Card>
          <CardHeader>
            <CardTitle>Margen por Categoría</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            {margenPorCategoria.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={margenPorCategoria}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, "Margen"]} />
                  <Bar dataKey="margen" fill="#8884d8" name="Margen ($)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p>No hay datos para mostrar</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Pie - Distribución */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Margen</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            {margenPorCategoria.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={margenPorCategoria}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="margen"
                  >
                    {margenPorCategoria.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, "Margen"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p>No hay datos para mostrar</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Productos */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle por Producto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Costo Unit.</TableHead>
                  <TableHead className="text-right">Precio Unit.</TableHead>
                  <TableHead className="text-right">Margen Unit.</TableHead>
                  <TableHead className="text-right">Margen %</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Margen Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productosConMargen.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      No se encontraron productos
                    </TableCell>
                  </TableRow>
                ) : (
                  productosConMargen.map((producto) => {
                    const margenUnitarioColor =
                      producto.margenUnitario < 0 ? "text-red-500" : "text-green-600";
                    const margenPorcentajeColor =
                      producto.margenPorcentaje < 0 ? "text-red-500" : "text-green-600";
                    const margenTotalColor =
                      producto.margenTotal < 0 ? "text-red-500" : "text-green-600";

                    return (
                      <TableRow
                        key={producto.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <TableCell className="font-medium">{producto.barcode || "-"}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {producto.name || "-"}
                        </TableCell>
                        <TableCell>{producto.category || "-"}</TableCell>
                        <TableCell className="text-right">
                          ${producto.costPrice?.toFixed(2) || "0.00"}
                        </TableCell>
                        <TableCell className="text-right">
                          ${producto.salePrice?.toFixed(2) || "0.00"}
                        </TableCell>
                        <TableCell className={`text-right ${margenUnitarioColor}`}>
                          ${producto.margenUnitario.toFixed(2)}
                        </TableCell>
                        <TableCell className={`text-right ${margenPorcentajeColor}`}>
                          {producto.margenPorcentaje.toFixed(2)}%
                        </TableCell>
                        <TableCell className="text-right">
                          {producto.stock?.toLocaleString() || "0"}
                        </TableCell>
                        <TableCell className={`text-right font-medium ${margenTotalColor}`}>
                          ${producto.margenTotal.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
