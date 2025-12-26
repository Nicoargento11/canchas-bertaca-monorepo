"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowDownLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createPayment, PaymentMethod } from "@/services/payment/payment";

interface CashWithdrawalProps {
    cashSessionId: string;
    complexId: string;
}

const WITHDRAWAL_REASONS = [
    { value: "DEVOLUCION_SEÑA", label: "Devolución de seña" },
    { value: "DEVOLUCION_PRODUCTO", label: "Devolución de producto" },
    { value: "GASTO_OPERATIVO", label: "Gasto operativo" },
    { value: "RETIRO_CAJA", label: "Retiro de caja" },
    { value: "OTRO", label: "Otro" },
];

export function CashWithdrawal({ cashSessionId, complexId }: CashWithdrawalProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [amount, setAmount] = useState("");
    const [reason, setReason] = useState("");
    const [notes, setNotes] = useState("");
    const [method, setMethod] = useState<PaymentMethod>("EFECTIVO");

    const handleSubmit = () => {
        const numAmount = parseFloat(amount);
        if (!numAmount || numAmount <= 0) {
            toast.error("Ingrese un monto válido");
            return;
        }
        if (!reason) {
            toast.error("Seleccione un motivo");
            return;
        }

        startTransition(async () => {
            try {
                // Crear pago con monto negativo para representar egreso
                const result = await createPayment({
                    amount: -numAmount, // Negativo para egreso
                    method,
                    isPartial: false,
                    transactionType: "EGRESO",
                    complexId,
                    cashSessionId,
                });

                if (result.success) {
                    toast.success("Egreso registrado correctamente");
                    setOpen(false);
                    setAmount("");
                    setReason("");
                    setNotes("");
                } else {
                    toast.error(result.error || "Error al registrar egreso");
                }
            } catch (error) {
                console.error("Error registrando egreso:", error);
                toast.error("Error al registrar egreso");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <ArrowDownLeft className="h-4 w-4" />
                    Egreso
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Registrar Egreso de Caja</DialogTitle>
                    <DialogDescription>
                        Registra devoluciones, retiros u otros egresos de dinero.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Motivo */}
                    <div className="space-y-2">
                        <Label>Motivo *</Label>
                        <Select value={reason} onValueChange={setReason}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar motivo..." />
                            </SelectTrigger>
                            <SelectContent>
                                {WITHDRAWAL_REASONS.map((r) => (
                                    <SelectItem key={r.value} value={r.value}>
                                        {r.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Monto */}
                    <div className="space-y-2">
                        <Label>Monto *</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                            <Input
                                type="number"
                                min="0"
                                step="100"
                                placeholder="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="pl-7"
                            />
                        </div>
                    </div>

                    {/* Método */}
                    <div className="space-y-2">
                        <Label>Método de pago</Label>
                        <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                                <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                                <SelectItem value="MERCADOPAGO">MercadoPago</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Notas */}
                    <div className="space-y-2">
                        <Label>Notas (opcional)</Label>
                        <Textarea
                            placeholder="Descripción adicional..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={isPending} className="bg-red-600 hover:bg-red-700">
                        {isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Registrando...
                            </>
                        ) : (
                            "Registrar Egreso"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
