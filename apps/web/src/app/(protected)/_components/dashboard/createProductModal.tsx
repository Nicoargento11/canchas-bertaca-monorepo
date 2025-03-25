"use client";
import { useTransition } from "react";

import { NewModal } from "@/components/modal/newModal";
import { useDashboardModal } from "@/context/dashboardModalContext";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductSchema } from "@/schemas";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import createProduct from "@/actions/product/createProduct";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

const CreateProductModal = () => {
  const { isOpenCreateProduct, handleChangeCreateProduct } =
    useDashboardModal();

  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof createProductSchema>>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "",
      price: 0,
      stock: 0,
    },
  });

  const onSubmit = (values: z.infer<typeof createProductSchema>) => {
    console.log(values);
    startTransition(() => {
      createProduct(values).then(() => {
        toast({
          duration: 3000,
          variant: "default",
          title: "¡Excelente!",
          description: "Producto creado con exito",
        });
        form.reset();
        handleChangeCreateProduct();
        router.refresh();
      });
    });
  };

  //content Reserve

  type FieldName = "name" | "price" | "stock";

  const fields: {
    name: FieldName;
    label: string;
    span?: string;
    type?: string;
    placeHolder?: string;
  }[] = [
    { name: "name", label: "Nombre", placeHolder: "Nombre del producto" },
    {
      name: "stock",
      label: "Stock",
      type: "number",
      placeHolder: "Stock en heladera",
    },
    {
      name: "price",
      label: "Precio",
      span: "col-span-2",
      type: "number",
      placeHolder: "Precio del producto",
    },
  ];
  const bodyContent = (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {fields.map(({ name, label, span, placeHolder, type }) => (
              <FormField
                control={form.control}
                key={name}
                name={name}
                render={({ field }) => (
                  <FormItem className={`flex flex-col gap-1 ${span}`}>
                    <FormLabel className="text-sm font-semibold text-gray-700">
                      {label}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type={type}
                        step="1"
                        placeholder={placeHolder}
                        onChange={(e) =>
                          field.onChange(
                            type == "number"
                              ? Number(e.target.value)
                              : e.target.value
                          )
                        }
                        className="border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                    </FormControl>
                    <FormMessage className="text-sm text-red-500" />
                  </FormItem>
                )}
              />
            ))}
          </div>
          <button
            disabled={isPending}
            type="submit"
            className="mt-4 w-full py-2 px-4 bg-Primary text-white rounded-md hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-900 focus:ring-opacity-50"
          >
            Enviar
          </button>
        </form>
      </Form>
    </div>
  );

  return (
    <NewModal
      title={"Crear nuevo producto"}
      header={
        <div className="text-center">
          Ingrese los datos para crear el producto
        </div>
      }
      isOpen={isOpenCreateProduct}
      onClose={handleChangeCreateProduct}
      body={bodyContent}
    />
  );
};

export default CreateProductModal;
