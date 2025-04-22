/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
// import { createPayment } from "@/services/payments/payments";
import { Court } from "@/services/courts/courts";

interface PaymentRegisterProps {
  court: Court;
}
export function PaymentRegister({ court }: PaymentRegisterProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    type: "RESERVA",
    amount: "",
    method: "EFECTIVO",
    courtId: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log(e);
    // e.preventDefault();
    // setIsLoading(true);
    // try {
    //   await createPayment({
    //     ...formData,
    //     amount: parseFloat(formData.amount),
    //     isPartial: false,
    //   });
    //   toast({
    //     title: "Pago registrado",
    //     description: "El pago se ha registrado correctamente",
    //   });
    //   setFormData({
    //     type: "RESERVA",
    //     amount: "",
    //     method: "EFECTIVO",
    //     courtId: "",
    //     description: "",
    //   });
    // } catch (error) {
    //   toast({
    //     title: "Error",
    //     description: error.message,
    //     variant: "destructive",
    //   });
    // } finally {
    //   setIsLoading(false);
    // }
  };
  type Field = keyof typeof formData;

  const handleChange = (field: Field, value: string | number) => {
    console.log(field + " " + value);
    // setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Pago</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="space-y-2">
            <Label>Tipo de Pago *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleChange("type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RESERVA">Reserva</SelectItem>
                <SelectItem value="ESCUELA">Escuela Fútbol</SelectItem>
                <SelectItem value="EVENTO">Evento Especial</SelectItem>
                <SelectItem value="OTRO">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Monto *</Label>
            <Input
              type="number"
              placeholder="$0.00"
              value={formData.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Método *</Label>
            <Select
              value={formData.method}
              onValueChange={(value) => handleChange("method", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                <SelectItem value="MERCADOPAGO">MercadoPago</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cancha (opcional)</Label>
            <Select
              value={formData.courtId}
              onValueChange={(value) => handleChange("courtId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione cancha" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: court.numberCourts }).map(
                  (court, index) => (
                    <SelectItem key={index + 1} value={(index + 1).toString()}>
                      {index + 1}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label>Descripción (opcional)</Label>
            <Input
              placeholder="Detalles del pago"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <Button type="submit" className="md:col-span-2" disabled={isLoading}>
            {isLoading ? "Registrando..." : "Registrar Pago"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
