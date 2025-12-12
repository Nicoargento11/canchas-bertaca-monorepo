// components/sport-types/createSportType.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
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
import { Switch } from "@/components/ui/switch";
import { formatSportTypeName, SportType, SportTypeKey } from "@/services/sport-types/sport-types";
import { z } from "zod";

// Esquema de validación
const sportTypeFormSchema = z.object({
  name: z.string(),
  isActive: z.boolean(),
});

export type SportTypeFormValues = z.infer<typeof sportTypeFormSchema>;

interface CreateSportTypeProps {
  sportType?: SportType | null;
  onSubmit: (values: SportTypeFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const sportTypeOptions: SportTypeKey[] = [
  "FUTBOL_5",
  "FUTBOL_7",
  "FUTBOL_11",
  "PADEL",
  "TENIS",
  "BASKET",
  "VOLEY",
  "HOCKEY",
];

export function CreateSportType({
  onCancel,
  onSubmit,
  isLoading,
  sportType,
}: CreateSportTypeProps) {
  const form = useForm<SportTypeFormValues>({
    resolver: zodResolver(sportTypeFormSchema),
    defaultValues: sportType || {
      name: undefined,
      isActive: true,
    },
  });
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold mb-4">Crear Tipo de Deporte</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">Tipo de Deporte</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue placeholder="Seleccione un tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sportTypeOptions.map((key) => (
                      <SelectItem key={key} value={key} className="text-sm sm:text-base">
                        {formatSportTypeName(key)}
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
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border p-3 sm:p-4 gap-3 sm:gap-0">
                <div className="space-y-0.5 flex-1">
                  <FormLabel className="text-sm sm:text-base">Activo</FormLabel>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Los tipos inactivos no estarán disponibles para selección
                  </p>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              {isLoading ? "Guardando..." : sportType ? "Actualizar Tipo" : "Crear Tipo"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
