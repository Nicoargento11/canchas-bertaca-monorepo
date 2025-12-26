import { z } from "zod";

export const reserveTurnSchema = z.object({
  date: z.date(),
  schedule: z.string(),
  courtId: z.string(),
  price: z.number(),
  reservationAmount: z.number(),
  userId: z.string(),
  phone: z
    .string({ required_error: "Por favor, ingrese un número de teléfono" })
    .regex(/^\d{10}$/, {
      message: "Por favor, ingrese un número de teléfono válido",
    }),
  promotionId: z.string().optional(),
});

export const createReserveAdminSchema = z.object({
  date: z.date(),
  schedule: z.string(),
  userId: z.string(),
  price: z.number(),
  status: z.string(),
  phone: z.string().min(1, { message: "Ingrese un número de teléfono" }),
  clientName: z.string().min(2, { message: "Ingrese un nombre descriptivo" }),
  reservationAmount: z.number(),
  reserveType: z.string().optional(),
  courtId: z.string(),
  complexId: z.string(),
  promotionId: z.string().optional(),
});

export const editReserveAdminSchema = z.object({
  id: z.string(),
  courtId: z.string(),
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
    .number({
      required_error: "El precio es obligatorio",
      invalid_type_error: "El precio debe ser un número",
    })
    .min(0, "El precio no puede ser negativo"),
  reservationAmount: z
    .number({
      required_error: "El monto es obligatorio",
      invalid_type_error: "El monto debe ser un número",
    })
    .min(0, "El monto no puede ser negativo"),
});

export const scheduleSchema = z.object({
  startTime: z.string().min(1, "La hora de inicio es obligatoria"),
  endTime: z.string().min(1, "La hora de fin es obligatoria"),
  rateId: z.string().min(1, "Debes seleccionar al menos una tarifa"),
  courtIds: z.array(z.string()),
  days: z.array(z.string()).min(1, "Debes seleccionar al menos un día"),
  sportTypeId: z.string(),
});
// .refine((data) => data.startTime < data.endTime, {
//   message: "La hora de inicio debe ser menor que la hora de fin",
//   path: ["endTime"], // Asociar el error al campo endTime
// });

export const fixedScheduleSchema = z.object({
  startTime: z.string().min(1, "La hora de inicio es obligatoria"),
  endTime: z.string().min(1, "La hora de fin es obligatoria"),
  userId: z.string().min(1, "Selecciona un usuario"),
  scheduleDayIds: z.array(z.string()).min(1, "Selecciona al menos un día"),
  rateId: z.string().min(1, "Selecciona una tarifa"),
  courtId: z.string().min(1, "Selecciona una cancha"),
});

export const inventorySchema = z.object({
  name: z.string().min(2),
  stock: z.number().min(0),
  price: z.number().min(0),
});

// export const productSchema = z.object({
//   name: z.string().min(1, "El nombre es requerido"),
//   description: z.string().optional(),
//   barcode: z.string().optional(),
//   category: z.nativeEnum(ProductCategory, {
//     required_error: "La categoría es requerida",
//   }),
//   stock: z.number().int().min(0, "El stock no puede ser negativo"),
//   costPrice: z.number().min(0, "El precio de costo no puede ser negativo"),
//   salePrice: z.number().min(0, "El precio de venta no puede ser negativo"),
//   minStock: z.number().int().min(0, "El stock mínimo no puede ser negativo"),
//   supplier: z.string().optional(),
//   isActive: z.string().transform((val) => val === "true"),
// });
