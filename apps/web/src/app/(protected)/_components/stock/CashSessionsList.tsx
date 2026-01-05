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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CashSession, getSessionsByComplex } from "@/services/cash-session/cash-session";
import { Loader2, AlertCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CashSessionDetails } from "./CashSessionDetails";

interface CashSessionsListProps {
  complexId: string;
}

export function CashSessionsList({ complexId }: CashSessionsListProps) {
  const [sessions, setSessions] = useState<CashSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      const result = await getSessionsByComplex(complexId);
      if (result.success && result.data) {
        setSessions(result.data);
      } else {
        setError(result.error || "Error al cargar las sesiones");
      }
      setLoading(false);
    };

    fetchSessions();
  }, [complexId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-500 p-4 bg-red-50 rounded-lg">
        <AlertCircle className="h-5 w-5" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Sesiones de Caja</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha Apertura</TableHead>
                <TableHead>Caja</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Monto Inicial</TableHead>
                <TableHead className="text-right">Monto Final</TableHead>
                <TableHead className="text-right">Diferencia</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No hay sesiones registradas
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((session) => {
                  // Calcular diferencia si la sesión está cerrada
                  let difference = null;
                  if (
                    session.status === "CLOSED" &&
                    session.finalAmount !== undefined &&
                    session.finalAmount !== null &&
                    session.totalCash !== undefined &&
                    session.totalCash !== null
                  ) {
                    // Diferencia = Lo que hay (Final) - (Lo que había (Inicial) + Lo que entró (Ventas Efectivo))
                    // Nota: Esto asume que totalCash ya contempla restas por egresos si los hubiera,
                    // o que totalCash son solo ventas. Si hay gastos, habría que restarlos del esperado.
                    const expectedAmount = session.initialAmount + session.totalCash;
                    difference = session.finalAmount - expectedAmount;
                  }

                  return (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {format(new Date(session.startAt), "dd/MM/yyyy", { locale: es })}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(session.startAt), "HH:mm", { locale: es })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{session.cashRegister?.name || "Caja eliminada"}</TableCell>
                      <TableCell>{session.user?.name || "Usuario desconocido"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            session.status === "ACTIVE"
                              ? "default"
                              : session.status === "CLOSED"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {session.status === "ACTIVE"
                            ? "Activa"
                            : session.status === "CLOSED"
                              ? "Cerrada"
                              : "Cancelada"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        ${session.initialAmount.toLocaleString("es-AR")}
                      </TableCell>
                      <TableCell className="text-right">
                        {session.finalAmount !== undefined && session.finalAmount !== null
                          ? `$${session.finalAmount.toLocaleString("es-AR")}`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {difference !== null ? (
                          <span
                            className={
                              difference < 0
                                ? "text-red-500 font-medium"
                                : difference > 0
                                  ? "text-green-500 font-medium"
                                  : ""
                            }
                          >
                            {difference > 0 ? "+" : ""}${difference.toLocaleString("es-AR")}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedSessionId(session.id);
                            setIsDetailsOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <CashSessionDetails
        sessionId={selectedSessionId}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </Card>
  );
}
