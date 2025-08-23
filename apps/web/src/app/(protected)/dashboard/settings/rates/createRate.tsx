"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { rateSchema } from "@/schemas/reserve";
import { createRate } from "@/services/rate/rate";
import { useTransition } from "react";
import { toast } from "sonner";
import { Complex } from "@/services/complex/complex";
import { useRateStore } from "@/store/settings/rateStore";
import { Loader2 } from "lucide-react";

type RateFormData = z.infer<typeof rateSchema>;
interface RateFormProps {
  complex: Complex;
}

const RateForm = ({ complex }: RateFormProps) => {
  const { addRate } = useRateStore();
  const form = useForm<RateFormData>({
    resolver: zodResolver(rateSchema),
    defaultValues: {
      reservationAmount: 0,
      name: "",
      price: 0,
    },
  });

  const [isPending, startTransition] = useTransition();

  const onSubmit = async (data: RateFormData) => {
    startTransition(async () => {
      try {
        const result = await createRate({
          ...data,
          complexId: complex.id,
        });

        if (result.success && result.data) {
          toast.success("Tarifa creada exitosamente");
          addRate(result.data);
          form.reset();
        } else {
          toast.error(result.error || "Error al crear la tarifa");
        }
      } catch (error) {
        toast.error("Ocurrió un error inesperado");
        console.error("Error creating rate:", error);
      }
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Agregar Nueva Tarifa</h1>
        <p className="text-sm text-gray-500 mt-1">Complete los detalles de la tarifa</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Campo: Nombre */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Nombre de la tarifa</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Tarifa estándar, Promocional, etc."
                    {...field}
                    className="border-gray-300 hover:border-gray-400 focus:border-gray-500"
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-sm" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Campo: Precio */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Precio ($)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="pl-8 border-gray-300 hover:border-gray-400 focus:border-gray-500"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            {/* Campo: Monto de reserva */}
            <FormField
              control={form.control}
              name="reservationAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Seña ($)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="pl-8 border-gray-300 hover:border-gray-400 focus:border-gray-500"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />
          </div>

          {/* Botón de envío */}
          <Button
            type="submit"
            className="w-full mt-6 bg-gray-800 hover:bg-gray-700 text-white"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Tarifa"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default RateForm;
