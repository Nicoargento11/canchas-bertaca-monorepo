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
import { rateSchema } from "@/schemas";
import { createRate } from "@/services/rate/rate";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";

type RateFormData = z.infer<typeof rateSchema>;

const RateForm = () => {
  const { toast } = useToast();
  const form = useForm<RateFormData>({
    resolver: zodResolver(rateSchema),
    defaultValues: {
      name: "",
      price: 0,
      reservationAmount: 0,
    },
  });

  const [isPending, startTransition] = useTransition();

  const onSubmit = (data: RateFormData) => {
    startTransition(() => {
      createRate(data);
      form.reset();
      toast({
        duration: 3000,
        variant: "default",
        title: "¡Excelente!",
        description: "Tarifa creada con éxito",
      });
    });
  };

  return (
    <div className="p-8 bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-Primary-dark mb-6">
        Agregar Tarifa
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Campo: Nombre */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-Primary font-semibold">
                  Nombre
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej. Tarifa estándar"
                    {...field}
                    className="bg-white border-blue-200 hover:border-blue-300 focus:border-blue-500"
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-sm" />
              </FormItem>
            )}
          />

          {/* Campo: Precio */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-Primary font-semibold">
                  Precio
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    className="bg-white border-blue-200 hover:border-blue-300 focus:border-blue-500"
                  />
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
                <FormLabel className="text-Primary font-semibold">
                  Monto de reserva
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    className="bg-white border-blue-200 hover:border-blue-300 focus:border-blue-500"
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-sm" />
              </FormItem>
            )}
          />

          {/* Botón de envío */}
          <Button
            type="submit"
            className="w-full bg-Complementary hover:bg-Accent-1 text-white font-bold py-2 rounded-lg transition-colors"
            disabled={isPending}
          >
            {isPending ? "Guardando..." : "Guardar Tarifa"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default RateForm;
