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
// import { createSoccerSchoolPayment } from "@/services/soccerSchool/soccerSchool";
export function SoccerSchoolPayments({}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    studentId: "",
    concept: "CUOTA_MENSUAL",
    amount: "",
    method: "EFECTIVO",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      //   await createSoccerSchoolPayment({
      //     ...formData,
      //     amount: parseFloat(formData.amount),
      //     date: new Date(),
      //   });

      toast({
        title: "Pago registrado",
        description: "El pago de la escuela se ha registrado correctamente",
      });
      setFormData({
        ...formData,
        amount: "",
        studentId: "",
      });
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error desconocido",
          description: "Ha ocurrido un error inesperado.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  type Field = keyof typeof formData;

  const handleChange = (field: Field, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pagos Escuela de Fútbol</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Alumno *</Label>
              <Select
                value={formData.studentId}
                onValueChange={(value) => handleChange("studentId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione alumno" />
                </SelectTrigger>
                <SelectContent>
                  {/* {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} {student.lastName}
                    </SelectItem>
                  ))} */}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Concepto *</Label>
              <Select
                value={formData.concept}
                onValueChange={(value) => handleChange("concept", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUOTA_MENSUAL">Cuota Mensual</SelectItem>
                  <SelectItem value="UNIFORME">Uniforme</SelectItem>
                  <SelectItem value="INSCRIPCION">Inscripción</SelectItem>
                  <SelectItem value="OTRO">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
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
              <Label>Método de Pago *</Label>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mes</Label>
                <Select
                  value={formData.month.toString()}
                  onValueChange={(value) =>
                    handleChange("month", parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Mes" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(
                      (month) => (
                        <SelectItem key={month} value={month.toString()}>
                          {new Date(2000, month - 1, 1).toLocaleString(
                            "default",
                            { month: "long" }
                          )}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Año</Label>
                <Input
                  type="number"
                  value={formData.year}
                  onChange={(e) =>
                    handleChange("year", parseInt(e.target.value))
                  }
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Registrando..." : "Registrar Pago"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
