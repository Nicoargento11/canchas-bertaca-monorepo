"use client";
import { Path, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface FieldOption {
  value: string;
  label: string;
}

type FieldType = "input" | "select" | "textarea" | "date" | "number";

interface FieldConfig<T> {
  name: Path<T>;
  label: string;
  type: FieldType;
  placeholder?: string;
  description?: string;
  options?: FieldOption[];
}

interface CustomFormProps<T extends z.ZodTypeAny> {
  schema: T;
  defaultValues?: z.infer<T>;
  fields: Array<FieldConfig<z.infer<T>>>;
  onSubmit: (values: z.infer<T>) => void;
  submitText?: string;
  className?: string;
}

export function CustomForm<T extends z.ZodTypeAny>({
  schema,
  defaultValues = {},
  fields,
  onSubmit,
  submitText = "Guardar",
  className = "",
}: CustomFormProps<T>) {
  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`space-y-6 ${className}`}
      >
        {fields.map((field) => (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>

                {field.type === "input" && (
                  <FormControl>
                    <Input placeholder={field.placeholder} {...formField} />
                  </FormControl>
                )}

                {field.type === "number" && (
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={field.placeholder}
                      {...formField}
                      onChange={(e) =>
                        formField.onChange(Number(e.target.value))
                      }
                    />
                  </FormControl>
                )}

                {field.type === "select" && field.options && (
                  <Select
                    onValueChange={formField.onChange}
                    value={formField.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={field.placeholder} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {field.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {field.type === "textarea" && (
                  <FormControl>
                    <Textarea placeholder={field.placeholder} {...formField} />
                  </FormControl>
                )}

                {field.type === "date" && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !formField.value && "text-muted-foreground"
                          )}
                        >
                          {formField.value ? (
                            format(new Date(formField.value), "PPP")
                          ) : (
                            <span>
                              {field.placeholder || "Seleccionar fecha"}
                            </span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          formField.value
                            ? new Date(formField.value)
                            : undefined
                        }
                        onSelect={formField.onChange}
                        disabled={(date) => date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}

                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <Button type="submit">{submitText}</Button>
      </form>
    </Form>
  );
}
