// components/canchas/canchas-form.tsx
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MultiSelect } from "@/components/ui/multi-select";
import { useEffect } from "react";
import { Court } from "@/services/court/court";
import { z } from "zod";
import { SportType, SportTypeKey } from "@/services/sport-types/sport-types";

export const formatSportType = (key: SportTypeKey): string => {
  const sportNames: Record<SportTypeKey, string> = {
    FUTBOL_5: "Fútbol 5",
    FUTBOL_7: "Fútbol 7",
    FUTBOL_11: "Fútbol 11",
    PADEL: "Pádel",
    TENIS: "Tenis",
    BASKET: "Básquet",
    VOLEY: "Vóley",
    HOCKEY: "Hockey",
  };

  return sportNames[key] || key;
};

export const courtFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  courtNumber: z.number().min(1, "El número debe ser mayor a 0"),
  characteristics: z.array(z.string()),
  isActive: z.boolean(),
  description: z.string().optional(),
  sportTypeId: z.string().min(1, "Selecciona un tipo de deporte"),
});

export type CourtFormValues = z.infer<typeof courtFormSchema>;

interface CanchasFormProps {
  onSubmit: (values: CourtFormValues) => void;
  court?: Court | null;
  onCancel: () => void;
  sportTypes: SportType[];
  characteristicsOptions: { value: string; label: string }[];
  isLoading?: boolean;
}

export function CanchasForm({
  onSubmit,
  court,
  onCancel,
  sportTypes,
  characteristicsOptions,
  isLoading = false,
}: CanchasFormProps) {
  const form = useForm<CourtFormValues>({
    resolver: zodResolver(courtFormSchema),
    defaultValues: {
      name: "",
      courtNumber: 0,
      characteristics: [],
      isActive: true,
      description: "",
      sportTypeId: "",
    },
  });

  useEffect(() => {
    if (court) {
      form.reset({
        name: court.name,
        courtNumber: court.courtNumber || 0,
        characteristics: court.characteristics || [],
        isActive: court.isActive,
        description: court.description || "",
        sportTypeId: court.sportTypeId,
      });
    } else {
      form.reset();
    }
  }, [court, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre de la cancha" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="courtNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Número de cancha"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="sportTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Deporte</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un deporte" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sportTypes.map((sport) => (
                    <SelectItem key={sport.id} value={sport.id}>
                      {formatSportType(sport.name as SportTypeKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="characteristics"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Características</FormLabel>
              <FormControl>
                <MultiSelect
                  options={characteristicsOptions}
                  selected={field.value}
                  onChange={field.onChange}
                  placeholder="Selecciona características"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea placeholder="Descripción opcional" rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <FormLabel>Activa</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Canchas inactivas no estarán disponibles para reservas
                </p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Guardando..." : court ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
