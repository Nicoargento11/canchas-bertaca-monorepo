"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Search } from "lucide-react";
import { Complex } from "@/services/complex/complex";
import { usePaymentsStore } from "@/store/paymentsStore";

interface PaymentsHistoryProps {
  complex: Complex;
}

export function PaymentsHistory({ complex }: PaymentsHistoryProps) {
  const { payments, initializePayments } = usePaymentsStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    initializePayments(complex.payments || []);
  }, [complex.payments, initializePayments]);

  const filteredPayments = payments.filter((payment) => {
    const searchLower = searchTerm.toLowerCase();
    const dateStr = format(new Date(payment.createdAt), "dd/MM/yyyy", { locale: es });
    const methodStr = payment.method ? payment.method.toLowerCase() : "";
    const typeStr = payment.transactionType ? payment.transactionType.toLowerCase() : "";

    return (
      payment.id.toLowerCase().includes(searchLower) ||
      methodStr.includes(searchLower) ||
      typeStr.includes(searchLower) ||
      dateStr.includes(searchLower)
    );
  });

  // Sort by date desc
  const sortedPayments = [...filteredPayments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID, método, tipo o fecha..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Referencia</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  No se encontraron pagos
                </TableCell>
              </TableRow>
            ) : (
              sortedPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {format(new Date(payment.createdAt), "dd MMM yyyy", { locale: es })}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(payment.createdAt), "HH:mm", { locale: es })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`font-bold ${payment.transactionType === 'EGRESO' ? 'text-red-600' : 'text-green-600'}`}>
                      {payment.transactionType === 'EGRESO' ? '-' : ''}${Math.abs(payment.amount).toLocaleString("es-AR")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {payment.method?.toLowerCase().replace("_", " ") || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {payment.transactionType?.toLowerCase().replace("_", " ") || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="text-xs font-mono text-muted-foreground">
                        {payment.reserveId ? (
                          <span className="text-blue-600 font-medium">Reserva</span>
                        ) : payment.saleId ? (
                          <span className="text-purple-600 font-medium">Venta POS</span>
                        ) : payment.transactionType === 'EGRESO' ? (
                          <span className="text-red-600 font-medium">Egreso de caja</span>
                        ) : (
                          <span className="text-orange-500 font-medium">Sin referencia</span>
                        )}
                      </div>
                      <div
                        className="text-[10px] text-gray-400 truncate max-w-[100px]"
                        title={payment.id}
                      >
                        ID: {payment.id.slice(0, 8)}...
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {payment.isPartial ? (
                      <Badge
                        variant="outline"
                        className="text-yellow-600 border-yellow-600 bg-yellow-50"
                      >
                        Parcial
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-600 bg-green-50"
                      >
                        Total
                      </Badge>
                    )}
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
