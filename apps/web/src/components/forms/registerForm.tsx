"use client";
import React, { useState, useTransition } from "react";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Social } from "@/components/social";
import { registerSchema } from "@/schemas/auth";
import { signIn, signUp } from "@/services/auth/auth";
import { useModal } from "@/contexts/modalContext";
import { FormError } from "../form-error";
import { FormSucces } from "../form-succes";
import { useReserve } from "@/contexts/newReserveContext";
// import { login } from "@/actions/auth/login";

export const RegisterForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [succes, setSucces] = useState<string | undefined>("");
  const { closeModal, openModal } = useModal();
  const { preloadReservation } = useReserve();

  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    setError("");
    setSucces("");
    startTransition(() => {
      signUp(values).then((data) => {
        setError(data?.error);
        setSucces(data?.data?.message);
        if (data.success) {
          signIn({ email: values.email, password: values.password });
          closeModal();
          // La restauración de reserva se maneja globalmente en mainSectionImproved.tsx
        }
      });
    });
  };

  return (
    <div className="flex flex-col gap-2 ">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Nombre</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="nombre ejemplo"
                      type="text"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/50 focus-visible:ring-Primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Correo Electronico</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="ejemplo@ejemplo.com"
                      type="email"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/50 focus-visible:ring-Primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Contraseña</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="********"
                      type="password"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/50 focus-visible:ring-Primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Confirmar contraseña</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="********"
                      type="password"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/50 focus-visible:ring-Primary"
                    />
                  </FormControl>
                  <Button size="sm" variant="link" asChild className="px-0 font-normal">
                    {/* <Link href="/auth/reset">¿Olvidaste tu contraseña?</Link> */}
                  </Button>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSucces message={succes} />
          <Button type="submit" disabled={isPending} className="w-full bg-Primary text-base">
            {isPending ? "Registrando..." : "Registrarse"}
          </Button>
        </form>
      </Form>
      <Social />
    </div>
  );
};
