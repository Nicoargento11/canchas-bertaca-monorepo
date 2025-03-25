import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({
    message: "Por favor ingrese una dirección de correo electrónico válida",
  }),
  password: z.string().min(6, {
    message: "La contraseña debe tener al menos 6 caracteres",
  }),
});

export const registerSchema = z
  .object({
    name: z
      .string({
        required_error: "Campo obligatorio",
      })
      .min(3, {
        message: "El nombre debe tener al menos 3 caracteres",
      }),
    email: z.string().email({
      message: "Por favor ingrese una dirección de correo electrónico válida",
    }),
    password: z.string().min(6, {
      message: "La contraseña debe tener al menos 6 caracteres",
    }),
    confirmPassword: z.string().min(6, {
      message: "La contraseña debe tener al menos 6 caracteres",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const createReserveAdminSchema = z.object({
  court: z.number(),
  date: z.date(),
  schedule: z.string(),
  userEmail: z.string(),
  userId: z.string(),
  price: z.number(),
  status: z.string(),
  phone: z.string().min(1, { message: "Ingrese un número de teléfono" }),
  clientName: z.string().min(2, { message: "Ingrese un nombre descriptivo" }),
  reservationAmount: z.number(),
});

export const reserveTurnSchema = z.object({
  date: z.date(),
  schedule: z.string(),
  court: z.number(),
  price: z.number(),
  reservationAmount: z.number(),
  userId: z.string(),
  phone: z
    .string({ required_error: "Por favor, ingrese un número de teléfono" })
    .regex(/^\d{10}$/, {
      message: "Por favor, ingrese un número de teléfono válido",
    }),
});

export const editReserveAdminSchema = z.object({
  id: z.string(),
  court: z.number(),
  date: z.date(),
  schedule: z.string(),
  clientName: z.string({ required_error: "Ingrese el nombre del cliente" }),
});

export const createProductSchema = z.object({
  name: z.string().min(2, { message: "Ingrese un nombre descriptivo" }),
  stock: z.number().min(0, { message: "Ingrese el stock" }),
  price: z.number().min(1, { message: "Ingrese un precio valido" }),
});

export const editProductSchema = z.object({
  id: z.string(),
  name: z.string().min(2, { message: "Ingrese un nombre descriptivo" }),
  stock: z.number().min(0, { message: "Ingrese el stock" }),
  price: z.number().min(1, { message: "Ingrese un precio valido" }),
});

export const rateSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  price: z
    .string()
    .min(1, "El precio es obligatorio")
    .transform((val) => Number(val))
    .refine((num) => num >= 0, { message: "El precio no puede ser negativo" }),
  reservationAmount: z
    .string()
    .min(1, "El monto es obligatorio")
    .transform((val) => Number(val))
    .refine((num) => num >= 0, { message: "El monto no puede ser negativo" }),
});

export const scheduleSchema = z
  .object({
    startTime: z.string().min(1, "La hora de inicio es obligatoria"),
    endTime: z.string().min(1, "La hora de fin es obligatoria"),
    rates: z.string().min(1, "Debes seleccionar al menos una tarifa"),
    days: z.array(z.number()).min(1, "Debes seleccionar al menos un día"),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "La hora de inicio debe ser menor que la hora de fin",
    path: ["endTime"], // Asociar el error al campo endTime
  });

export const fixedScheduleSchema = z.object({
  startTime: z.string().min(1, "La hora de inicio es obligatoria"),
  endTime: z.string().min(1, "La hora de fin es obligatoria"),
  userId: z.string().min(1, "Selecciona un usuario"),
  scheduleDayId: z.number().min(1, "Selecciona un día"),
  rateId: z.string().min(1, "Selecciona una tarifa"),
  court: z
    .number()
    .min(0, "Selecciona una cancha")
    .transform((val) => Number(val)),
});
