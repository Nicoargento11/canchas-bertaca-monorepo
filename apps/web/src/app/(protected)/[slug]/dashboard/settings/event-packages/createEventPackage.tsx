"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createEventPackage,
  EventPackage,
  updateEventPackage,
} from "@/services/event-package/event-package";
import { useTransition, useState, useEffect } from "react";
import { toast } from "sonner";
import { Complex } from "@/services/complex/complex";
import { Loader2, Plus, X } from "lucide-react";

const eventPackageSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  courtCount: z.number().min(1, "Debe ser al menos 1").optional().nullable(),
  courtType: z.string().optional().nullable(),
  durationHours: z.number().min(0.5, "La duración debe ser al menos 0.5 horas"),
  basePrice: z.number().min(0, "El precio debe ser mayor o igual a 0"),
  lightPrice: z.number().min(0, "El precio con luces debe ser mayor o igual a 0"),
  includes: z.array(z.string()).min(1, "Debe incluir al menos un item"),
  allowExtras: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type EventPackageFormData = z.infer<typeof eventPackageSchema>;

interface CreateEventPackageProps {
  complex: Complex;
  eventPackage?: EventPackage | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CreateEventPackage = ({
  complex,
  eventPackage,
  onSuccess,
  onCancel,
}: CreateEventPackageProps) => {
  const [isPending, startTransition] = useTransition();
  const [includesItems, setIncludesItems] = useState<string[]>(
    eventPackage?.includes || ["Parrilla"]
  );
  const [newItem, setNewItem] = useState("");

  const form = useForm<EventPackageFormData>({
    resolver: zodResolver(eventPackageSchema),
    defaultValues: {
      name: eventPackage?.name || "",
      description: eventPackage?.description || "",
      courtCount: eventPackage?.courtCount || null,
      courtType: eventPackage?.courtType || null,
      durationHours: eventPackage?.durationHours || 3,
      basePrice: eventPackage?.basePrice || 0,
      lightPrice: eventPackage?.lightPrice || 0,
      includes: eventPackage?.includes || ["Parrilla"],
      allowExtras: eventPackage?.allowExtras || false,
      isActive: eventPackage?.isActive ?? true,
    },
  });

  // Cargar datos cuando cambia el eventPackage (para edición)
  useEffect(() => {
    if (eventPackage) {
      form.reset({
        name: eventPackage.name,
        description: eventPackage.description || "",
        courtCount: eventPackage.courtCount,
        courtType: eventPackage.courtType || "all",
        durationHours: eventPackage.durationHours,
        basePrice: eventPackage.basePrice,
        lightPrice: eventPackage.lightPrice,
        includes: eventPackage.includes,
        allowExtras: eventPackage.allowExtras,
        isActive: eventPackage.isActive,
      });
      setIncludesItems(eventPackage.includes);
    } else {
      form.reset({
        name: "",
        description: "",
        courtCount: null,
        courtType: "all",
        durationHours: 3,
        basePrice: 0,
        lightPrice: 0,
        includes: ["Parrilla"],
        allowExtras: false,
        isActive: true,
      });
      setIncludesItems(["Parrilla"]);
    }
  }, [eventPackage, form]);

  // Sincronizar el campo includes con el estado local
  useEffect(() => {
    form.setValue("includes", includesItems);
  }, [includesItems, form]);

  const addIncludesItem = () => {
    if (newItem.trim() && !includesItems.includes(newItem.trim())) {
      setIncludesItems([...includesItems, newItem.trim()]);
      setNewItem("");
    }
  };

  const removeIncludesItem = (item: string) => {
    setIncludesItems(includesItems.filter((i) => i !== item));
  };

  const onSubmit = async (data: EventPackageFormData) => {
    startTransition(async () => {
      try {
        const payload = {
          ...data,
          complexId: complex.id,
          includes: includesItems,
          // Convert "all" to null for courtType
          courtType: data.courtType === "all" ? null : data.courtType,
        };

        let result;
        if (eventPackage) {
          // Editar paquete existente
          result = await updateEventPackage(eventPackage.id, payload);
        } else {
          // Crear nuevo paquete
          result = await createEventPackage(payload);
        }

        if (result.success) {
          toast.success(
            eventPackage
              ? `Paquete "${data.name}" actualizado correctamente`
              : `Paquete "${data.name}" creado correctamente`
          );
          form.reset();
          setIncludesItems(["Parrilla"]);
          onSuccess?.();
        } else {
          throw new Error(result.error || "Error al guardar el paquete");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Error al guardar el paquete de evento"
        );
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          {eventPackage ? "Editar Paquete de Evento" : "Crear Paquete de Evento"}
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          Configura los paquetes especiales para cumpleaños, torneos y eventos
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Paquete *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Combo Cumpleaños 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descripción */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 1 Cancha de 5 + Parrilla" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cantidad de canchas */}
            <FormField
              control={form.control}
              name="courtCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad de Canchas</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Ej: 1 (vacío = todas las canchas)"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(e.target.value ? Number(e.target.value) : null)
                      }
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Dejar vacío para incluir todas las canchas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tipo de cancha */}
            <FormField
              control={form.control}
              name="courtType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Cancha</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || "all"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">Todas las canchas</SelectItem>
                      {complex.sportTypes?.map((sportType) => (
                        <SelectItem key={sportType.id} value={sportType.name}>
                          {sportType.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Duración en horas */}
            <FormField
              control={form.control}
              name="durationHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duración (horas) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.5"
                      placeholder="Ej: 3"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Precio base */}
            <FormField
              control={form.control}
              name="basePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio Base (sin luces) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Ej: 75000"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Precio con luces */}
            <FormField
              control={form.control}
              name="lightPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio con Luces *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Ej: 105000"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Items incluidos */}
          <div className="space-y-3">
            <FormLabel>Items Incluidos *</FormLabel>
            <div className="flex gap-2">
              <Input
                placeholder="Agregar item (ej: Mesas y sillas)"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addIncludesItem();
                  }
                }}
              />
              <Button type="button" onClick={addIncludesItem} variant="secondary">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {includesItems.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeIncludesItem(item)}
                    className="ml-1 hover:text-blue-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            {includesItems.length === 0 && (
              <p className="text-sm text-red-500">Debe agregar al menos un item incluido</p>
            )}
          </div>

          {/* Opciones */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="allowExtras"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Permitir extras</FormLabel>
                    <FormDescription>
                      Los clientes pueden agregar productos adicionales
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Paquete activo</FormLabel>
                    <FormDescription>
                      Solo los paquetes activos estarán disponibles para reservar
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            {eventPackage && onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={isPending || includesItems.length === 0}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {eventPackage ? "Actualizar Paquete" : "Crear Paquete"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateEventPackage;
