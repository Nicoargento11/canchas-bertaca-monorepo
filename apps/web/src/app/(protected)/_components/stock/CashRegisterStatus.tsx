"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OpenCashRegister } from "./OpenCashRegister";
import { CloseCashRegister } from "./CloseCashRegister";
import { CreateCashRegister } from "./CreateCashRegister";
import { useCashRegisterStore } from "@/store/cash-register";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Store, Clock, DollarSign, AlertCircle, CheckCircle2, History, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface CashRegisterStatusProps {
  complexId: string;
  userId: string;
}

export function CashRegisterStatus({ complexId, userId }: CashRegisterStatusProps) {
  const { registers, activeRegister, activeSession, setActiveRegister } = useCashRegisterStore();

  const handleRegisterChange = (value: string) => {
    const register = registers.find((r) => r.id === value);
    setActiveRegister(register || null);
  };

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Estado de Caja</h2>
          <p className="text-sm text-muted-foreground">Administra la apertura y cierre de cajas.</p>
        </div>
        <CreateCashRegister complexId={complexId} />
      </div>

      {/* Selection Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="register-select">Seleccionar Caja</Label>
              <Select
                value={activeRegister?.id || ""}
                onValueChange={handleRegisterChange}
                disabled={!!activeSession}
              >
                <SelectTrigger id="register-select" className="w-full">
                  <SelectValue placeholder="Seleccione una caja para operar" />
                </SelectTrigger>
                <SelectContent>
                  {registers.map((register) => (
                    <SelectItem key={register.id} value={register.id}>
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-muted-foreground" />
                        <span>{register.name}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {register.location || "Sin ubicación"}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {activeSession && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Caja activa. Cierra la sesión actual para cambiar de caja.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Section */}
      {activeRegister ? (
        activeSession ? (
          <Card className="border-green-200 bg-green-50/30 dark:bg-green-900/10 dark:border-green-900">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Sesión Activa
                  </CardTitle>
                  <CardDescription>
                    La caja está abierta y lista para registrar ventas.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                  Abierta
                </Badge>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Inicio</span>
                  </div>
                  <p className="font-medium text-sm">
                    {new Date(activeSession.startAt).toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>Monto Inicial</span>
                  </div>
                  <p className="font-medium text-sm">${activeSession.initialAmount.toFixed(2)}</p>
                </div>
              </div>

              {activeSession.observations && (
                <div className="bg-muted/50 p-3 rounded-md text-sm">
                  <span className="font-medium block mb-1 text-xs uppercase text-muted-foreground">
                    Observaciones
                  </span>
                  {activeSession.observations}
                </div>
              )}

              <div className="pt-2">
                <CloseCashRegister session={activeSession} complexId={complexId} />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-muted rounded-full">
                <Store className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">Caja Cerrada</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  La caja {activeRegister.name} se encuentra cerrada. Inicia una sesión para
                  comenzar a operar.
                </p>
              </div>
              <OpenCashRegister
                complexId={complexId}
                userId={userId}
                cashRegisterId={activeRegister.id}
              />
            </CardContent>
          </Card>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-3 text-muted-foreground">
          <Store className="h-10 w-10 opacity-20" />
          <p className="text-sm">Selecciona una caja arriba para ver su estado y opciones.</p>
        </div>
      )}
    </div>
  );
}
