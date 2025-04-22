"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
// import { getRecentTransactions } from "@/services/transactions/transactions";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description?: string;
  createdAt: string;
}

export function RecentTransactions() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // const data = await getRecentTransactions();
        setTransactions([]);
      } catch {
        toast({
          title: "Error",
          description: "No se pudieron cargar las transacciones",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "RESERVA":
        return "default";
      case "VENTA_PRODUCTO":
        return "secondary";
      case "ESCUELA_FUTBOL":
        return "outline";
      case "GASTO":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Movimientos Recientes</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Cargando transacciones...</div>
        ) : transactions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    {format(new Date(tx.createdAt), "PP HH:mm", { locale: es })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(tx.type)}>
                      {tx.type.replace("_", " ").toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {tx.description || "Sin descripción"}
                  </TableCell>
                  <TableCell
                    className={`text-right ${
                      tx.type === "GASTO" ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {tx.type === "GASTO" ? "-" : ""}${tx.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No hay movimientos recientes
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
