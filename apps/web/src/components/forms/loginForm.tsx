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
import { loginSchema } from "@/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import Link from "next/link";
import { Social } from "@/components/social";
import { FormError } from "@/components/form-error";
import { FormSucces } from "@/components/form-succes";
import { signIn } from "@/services/auth/auth";
import { useModal } from "@/contexts/modalContext";

export const LoginForm = () => {
  const [isPending, startTransition] = useTransition();
  const { oncloseLogin } = useModal();

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
        if (data.succes) {
          oncloseLogin();
        }
        setError(data?.error);
        setSucces(data?.succes);
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
                  <Button
                    size="sm"
                    variant="link"
                    asChild
                    className="px-0 font-normal"
                  >
                    {/* <Link href="">¿Olvidaste tu contraseña?</Link> */}
                  </Button>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={errror} />
          <FormSucces message={succes} />
          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-Primary text-base "
          >
            Ingresar
          </Button>
        </form>
      </Form>
      <Social />
    </div>
  );
};
