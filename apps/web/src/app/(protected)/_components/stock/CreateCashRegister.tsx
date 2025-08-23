// app/_components/stock/CreateCashRegister.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { createCashRegister } from "@/services/cash-register/cash-register";
import { useCashRegisterStore } from "@/store/cash-register";
import { Loader2, PlusCircle } from "lucide-react";
import { toast } from "sonner";

export function CreateCashRegister({ complexId }: { complexId: string }) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { registers, setRegisters } = useCashRegisterStore();

  const handleCreateRegister = async () => {
    if (!name.trim()) {
      toast.error("Error", {
        description: "El nombre es requerido",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await createCashRegister({
        name: name.trim(),
        location: location.trim(),
        complexId,
        isActive: true,
      });

      if (result.success && result.data) {
        // Actualizar la lista de cajas registradoras
        setRegisters([...registers, result.data]);

        toast.success("Caja creada", {
          description: `La caja ${name} ha sido registrada correctamente`,
        });

        // Limpiar formulario y cerrar modal
        setIsOpen(false);
        setName("");
        setLocation("");
      } else {
        toast.error("Error al crear caja", {
          description: result.error || "Ocurrió un error desconocido",
        });
      }
    } catch (error) {
      console.error("Error creating cash register:", error);
      toast.error("Error", {
        description: "No se pudo conectar con el servidor",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="">
          <PlusCircle size={25} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nueva Caja</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Caja Principal"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Ubicación</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ej: Recepción"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          {" "}
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleCreateRegister} disabled={isLoading || !name.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              "Crear Caja"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
