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
import { Social } from "@/components/social";
import { Button } from "@/components/ui/button";
import { useModal } from "@/contexts/modalContext";
import { signIn } from "@/services/auth/auth";
import { loginSchema } from "@/schemas/auth";
import { FormError } from "../form-error";
import { FormSucces } from "../form-succes";

export const LoginForm = () => {
  const [isPending, startTransition] = useTransition();
  const { openModal, closeModal, modalData } = useModal();

  const [errror, setError] = useState<string | undefined>("");
  const [succes, setSucces] = useState<string | undefined>("");

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    setError("");
    setSucces("");

    startTransition(() => {
      signIn(values).then((data) => {
        if (data.success) {
          closeModal();
          // oncloseLogin();
          const reservaTemporal = localStorage.getItem("reserveData");
          if (reservaTemporal) {
            openModal("RESERVE_FUTBOL", {
              complexId: modalData?.complexId,
              sportType: modalData?.sportType,
            });
            // onOpenFutbolReserve();
            localStorage.removeItem("reserveData");
          }
        }
        setError(data?.error);
        // setSucces(data.success);
      });
    });
  };

  return (
    <div className="flex flex-col gap-2 ">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electronico</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="ejemplo@ejemplo.com"
                      type="email"
                      className="border-gray-400"
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
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="********"
                      type="password"
                      className="border-gray-400"
                    />
                  </FormControl>
                  <Button size="sm" variant="link" asChild className="px-0 font-normal">
                    {/* <Link href="">¿Olvidaste tu contraseña?</Link> */}
                  </Button>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={errror} />
          <FormSucces message={succes} />
          <Button type="submit" disabled={isPending} className="w-full bg-Primary text-base ">
            Ingresar
          </Button>
        </form>
      </Form>
      <Social />
    </div>
  );
};
