"use client";

import { Card } from "@/components/ui/card";
import { ShoppingBag, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProductData {
    name: string;
    sales: number;
    category: string;
}

interface ProductsAnalysisCardProps {
    products: ProductData[];
}

export function ProductsAnalysisCard({ products }: ProductsAnalysisCardProps) {
    const totalSales = products.reduce((sum, p) => sum + p.sales, 0);
    const maxSales = Math.max(...products.map(p => p.sales), 1);

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            "BEBIDAS": "bg-blue-500",
            "COMIDA": "bg-orange-500",
            "SNACKS": "bg-purple-500",
            "DEPORTES": "bg-green-500",
            "OTROS": "bg-gray-500",
        };
        return colors[category] || "bg-gray-500";
    };

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
        <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold">Top Productos</h3>
                    <p className="text-sm text-muted-foreground">
                        Productos más vendidos
                    </p>
                </div>
                <ShoppingBag className="h-5 w-5 text-orange-600" />
            </div>

            {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <ShoppingBag className="h-12 w-12 mb-2 opacity-20" />
                    <p className="text-sm">No hay ventas de productos</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {products.map((product, index) => {
                        const percentage = Math.round((product.sales / maxSales) * 100);
                        const shareOfTotal = Math.round((product.sales / totalSales) * 100);

                        return (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">
                                            {getCategoryIcon(product.category)}
                                        </span>
                                        <div>
                                            <p className="font-medium">{product.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {product.category}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{product.sales} unid.</p>
                                        <p className="text-xs text-muted-foreground">
                                            {shareOfTotal}% del total
                                        </p>
                                    </div>
                                </div>
                                <div className="relative">
                                    <Progress value={percentage} className="h-2" />
                                    <div
                                        className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getCategoryColor(
                                            product.category
                                        )}`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}

                    {/* Summary */}
                    <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <TrendingUp className="h-4 w-4" />
                                <span>Total vendido</span>
                            </div>
                            <span className="text-lg font-bold">{totalSales} unidades</span>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
