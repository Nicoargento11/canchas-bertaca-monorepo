"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Eye } from "lucide-react";
import { ProductSale } from "@/services/product-sale.ts/product-sale";
import { useSalesStore } from "@/store/productSaleStore";
import { Complex } from "@/services/complex/complex";

interface SalesHistoryProps {
  complex: Complex;
}
export function SalesHistory({ complex }: SalesHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSale, setSelectedSale] = useState<ProductSale | null>(null);

  // Get sales from Zustand store
  const { sales, initializeProductSales } = useSalesStore();

  // Filter sales based on search term
  const filteredSales = sales.filter((sale) => {
    const searchLower = searchTerm.toLowerCase();
    const paymentMethods = sale.sale?.payments?.map((p) => p.method.toLowerCase()).join(" ") || "";
    return (
      sale.id.toLowerCase().includes(searchLower) ||
      paymentMethods.includes(searchLower) ||
      sale.product.name.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    initializeProductSales(complex.productSales || []);
  }, [complex.productSales, initializeProductSales]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por ID, producto o método de pago..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Venta</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Método de Pago</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No hay ventas que coincidan con la búsqueda.
                </TableCell>
              </TableRow>
            ) : (
              filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">#{sale.id.slice(-6)}</TableCell>
                  <TableCell>{new Date(sale.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{sale.product.name}</TableCell>
                  <TableCell className="capitalize">
                    {sale.sale?.payments?.map((p) => p.method).join(", ") || "-"}
                  </TableCell>
                  <TableCell className="text-right font-medium">${sale.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedSale(sale)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Detalle de Venta #{sale.id.slice(-6)}</DialogTitle>
                          <DialogDescription>
                            Fecha: {new Date(sale.createdAt).toLocaleString()}
                          </DialogDescription>
                        </DialogHeader>
                        {selectedSale && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <strong>Cliente:</strong> {"Cliente"}
                              </div>
                              <div>
                                <strong>Método de Pago:</strong>{" "}
                                {selectedSale.sale?.payments?.map((p) => p.method).join(", ") ||
                                  "-"}
                              </div>
                            </div>
                            <div>
                              <strong>Productos:</strong>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>Cantidad</TableHead>
                                    <TableHead>Precio Unit.</TableHead>
                                    <TableHead>Subtotal</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  <TableRow>
                                    <TableCell>{selectedSale.product.name}</TableCell>
                                    <TableCell>{selectedSale.quantity}</TableCell>
                                    <TableCell>${selectedSale.price.toFixed(2)}</TableCell>
                                    <TableCell>
                                      ${(selectedSale.price * selectedSale.quantity).toFixed(2)}
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </div>
                            {/* <div className="text-right">
                              <strong className="text-lg">
                                Total: ${selectedSale.payment.amount.toFixed(2)}
                              </strong>
                            </div> */}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
