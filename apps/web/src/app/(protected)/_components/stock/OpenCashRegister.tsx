// app/_components/stock/OpenCashRegister.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { openCashSession } from "@/services/cash-session/cash-session";
import { useCashRegisterStore } from "@/store/cash-register";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function OpenCashRegister({
  complexId,
  userId,
  cashRegisterId,
}: {
  complexId: string;
  userId: string;
  cashRegisterId: string;
}) {
  const [amount, setAmount] = useState("");
  const [observations, setObservations] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setActiveSession } = useCashRegisterStore();

  const parseAmount = (value: string) => {
    if (!value) return 0;
    let clean = value.replace(/[^\d.,]/g, "");

    if (clean.indexOf(",") !== -1 && clean.indexOf(".") !== -1) {
      if (clean.lastIndexOf(",") > clean.lastIndexOf(".")) {
        clean = clean.replace(/\./g, "").replace(",", ".");
      } else {
        clean = clean.replace(/,/g, "");
      }
    } else if (clean.indexOf(",") !== -1) {
      if ((clean.match(/,/g) || []).length > 1) {
        clean = clean.replace(/,/g, "");
      } else {
        clean = clean.replace(",", ".");
      }
    } else if (clean.indexOf(".") !== -1) {
      if ((clean.match(/\./g) || []).length > 1) {
        clean = clean.replace(/\./g, "");
      }
    }

    const result = parseFloat(clean);
    return isNaN(result) ? 0 : result;
  };

  const handleOpenSession = async () => {
    const finalAmount = parseAmount(amount);
    if (amount.trim() === "" || isNaN(finalAmount)) {
      toast.error("Ingrese un monto inicial válido");

      return;
    }

    setIsLoading(true);
    try {
      const result = await openCashSession({
        cashRegisterId,
        userId,
        initialAmount: finalAmount,
        // observations: observations || undefined,
      });

      if (result.success && result.data) {
        setActiveSession(result.data);
        // await fetchActiveSession(cashRegisterId);
        toast.success("Caja abierta");

        setIsOpen(false);
        setAmount("");
        setObservations("");
      } else {
        toast.error(result.error || "Ocurrió un error desconocido");
      }
    } catch (error) {
      toast.error("Ocurrió un error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Abrir Caja</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apertura de Caja</DialogTitle>
          <DialogDescription>
            Ingresa el monto inicial para comenzar una nueva sesión de caja.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Monto Inicial *</Label>
            <Input
              id="amount"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
            <p className="text-sm text-muted-foreground">
              Efectivo inicial en caja al comenzar el turno
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observaciones</Label>
            <Input
              id="observations"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Notas adicionales (opcional)"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleOpenSession} disabled={isLoading || !amount}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Abriendo...
              </>
            ) : (
              "Abrir Caja"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
