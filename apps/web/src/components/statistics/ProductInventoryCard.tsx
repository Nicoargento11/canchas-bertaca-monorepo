"use client";

import { Card } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, Package, DollarSign, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LowStockProduct {
    id: string;
    name: string;
    stock: number;
    minStock: number;
    category: string;
    status: string;
}

interface HighMarginProduct {
    id: string;
    name: string;
    costPrice: number;
    salePrice: number;
    margin: number;
    marginPercentage: number;
    category: string;
    stock: number;
}

interface DeadStockProduct {
    id: string;
    name: string;
    stock: number;
    category: string;
    tiedUpCapital: number;
}

interface ProductInventoryCardProps {
    lowStockProducts: LowStockProduct[];
    highMarginProducts: HighMarginProduct[];
    deadStockProducts: DeadStockProduct[];
}

export function ProductInventoryCard({
    lowStockProducts,
    highMarginProducts,
    deadStockProducts,
}: ProductInventoryCardProps) {
    const getCategoryIcon = (category: string) => {
        const icons: Record<string, string> = {
            "BEBIDAS": "🥤",
            "COMIDA": "🍕",
            "SNACKS": "🍿",
            "DEPORTES": "⚽",
            "OTROS": "📦",
        };
        return icons[category] || "📦";
    };

    return (
        <TooltipProvider>
            <Card className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold">Análisis de Inventario</h3>
                        <p className="text-sm text-muted-foreground">
                            Stock, márgenes y productos sin rotación
                        </p>
                    </div>
                    <Package className="h-5 w-5 text-purple-600" />
                </div>

                <Tabs defaultValue="low-stock" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="low-stock" className="text-xs sm:text-sm">
                            <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Stock Bajo
                            {lowStockProducts.length > 0 && (
                                <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                                    {lowStockProducts.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="high-margin" className="text-xs sm:text-sm">
                            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Mejor Margen
                        </TabsTrigger>
                        <TabsTrigger value="dead" className="text-xs sm:text-sm">
                            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Sin Ventas
                        </TabsTrigger>
                    </TabsList>

                    {/* Stock Bajo */}
                    <TabsContent value="low-stock" className="space-y-3 mt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p className="font-medium mb-1">Alertas de Stock</p>
                                    <p className="text-xs">
                                        Productos que están en o por debajo del stock mínimo.
                                        Reabastece pronto para evitar quedarte sin inventario.
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                            <span className="text-xs text-muted-foreground">
                                Productos que necesitan reabastecimiento
                            </span>
                        </div>

                        {lowStockProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                <Package className="h-12 w-12 mb-2 opacity-20" />
                                <p className="text-sm">✅ Todos los productos tienen stock suficiente</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {lowStockProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className={`p-3 rounded-lg border ${product.status === 'SIN_STOCK'
                                                ? 'bg-red-50 border-red-200'
                                                : 'bg-amber-50 border-amber-200'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-2 flex-1">
                                                <span className="text-lg">{getCategoryIcon(product.category)}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">{product.name}</p>
                                                    <p className="text-xs text-muted-foreground">{product.category}</p>
                                                </div>
                                            </div>
                                            <div className="text-right ml-2">
                                                <div className="flex items-center gap-1">
                                                    <Badge
                                                        variant={product.status === 'SIN_STOCK' ? 'destructive' : 'outline'}
                                                        className={product.status === 'BAJO' ? 'bg-amber-100 text-amber-900 border-amber-300' : ''}
                                                    >
                                                        {product.status === 'SIN_STOCK' ? 'SIN STOCK' : 'BAJO'}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs font-semibold mt-1">
                                                    {product.stock} / {product.minStock} min
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Mejor Margen */}
                    <TabsContent value="high-margin" className="space-y-3 mt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p className="font-medium mb-1">Productos Más Rentables</p>
                                    <p className="text-xs">
                                        Productos con mayor porcentaje de ganancia.
                                        Promociona estos productos para maximizar tus ingresos.
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                            <span className="text-xs text-muted-foreground">
                                Top 5 productos por margen de ganancia
                            </span>
                        </div>

                        {highMarginProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                <DollarSign className="h-12 w-12 mb-2 opacity-20" />
                                <p className="text-sm">No hay datos de margen disponibles</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {highMarginProducts.map((product, index) => (
                                    <div
                                        key={product.id}
                                        className="p-3 rounded-lg border bg-green-50 border-green-200"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-2 flex-1">
                                                <span className="text-lg">{getCategoryIcon(product.category)}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">{product.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Costo: ${product.costPrice.toLocaleString("es-AR")} →
                                                        Venta: ${product.salePrice.toLocaleString("es-AR")}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right ml-2">
                                                <Badge variant="outline" className="bg-green-100 text-green-900 border-green-300">
                                                    {product.marginPercentage}%
                                                </Badge>
                                                <p className="text-xs font-semibold mt-1 text-green-700">
                                                    +${product.margin.toLocaleString("es-AR")}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Dead Stock */}
                    <TabsContent value="dead" className="space-y-3 mt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p className="font-medium mb-1">Productos Sin Rotación</p>
                                    <p className="text-xs">
                                        Productos con stock que no tuvieron ventas en el período.
                                        Considera crear promociones u ofertas para moverlos.
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                            <span className="text-xs text-muted-foreground">
                                Productos sin ventas en el período
                            </span>
                        </div>

                        {deadStockProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                <TrendingUp className="h-12 w-12 mb-2 opacity-20" />
                                <p className="text-sm">✅ Todos los productos tuvieron ventas</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    {deadStockProducts.slice(0, 5).map((product) => (
                                        <div
                                            key={product.id}
                                            className="p-3 rounded-lg border bg-gray-50 border-gray-200"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-2 flex-1">
                                                    <span className="text-lg">{getCategoryIcon(product.category)}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm truncate">{product.name}</p>
                                                        <p className="text-xs text-muted-foreground">{product.category}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right ml-2">
                                                    <p className="text-xs font-semibold">{product.stock} unid.</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        ${product.tiedUpCapital.toLocaleString("es-AR")} inmovilizado
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {deadStockProducts.length > 5 && (
                                    <p className="text-xs text-center text-muted-foreground pt-2">
                                        +{deadStockProducts.length - 5} productos más sin ventas
                                    </p>
                                )}

                                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="text-xs text-blue-900">
                                        💡 <strong>Sugerencia:</strong> Considera crear promociones especiales (ej: 2x1)
                                        para estos productos y liberar capital.
                                    </p>
                                </div>
                            </>
                        )}
                    </TabsContent>
                </Tabs>
            </Card>
        </TooltipProvider>
    );
}
