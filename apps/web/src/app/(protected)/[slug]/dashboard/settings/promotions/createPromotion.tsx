"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Form,
    FormControl,
    FormDescription,
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
import { createPromotion, updatePromotion, Promotion, PromotionType } from "@/services/promotion/promotion";
import { useTransition, useState, useEffect } from "react";
import { toast } from "sonner";
import { Complex } from "@/services/complex/complex";
import { usePromotionStore } from "@/store/settings/promotionStore";
import { Loader2, Plus, ChevronDown, ChevronUp, Trash2, Save } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { GiftProductInput } from "@/services/promotion/promotion";
import { format } from "date-fns";

const promotionSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    description: z.string().optional(),
    code: z.string().optional(),
    isActive: z.boolean().default(true),
    type: z.enum([
        // Para reservas
        "PERCENTAGE_DISCOUNT",
        "FIXED_AMOUNT_DISCOUNT",
        "FIXED_PRICE",
        "GIFT_PRODUCT",
        // Para productos
        "PRODUCT_PERCENTAGE",
        "PRODUCT_FIXED_DISCOUNT",
        "PRODUCT_BUY_X_PAY_Y",
        "PRODUCT_FIXED_PRICE",
    ]),
    value: z.number().optional(),
    giftProductId: z.string().optional(),
    validFrom: z.string().optional(),
    validTo: z.string().optional(),
    daysOfWeek: z.array(z.number()).default([]),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    sportTypeId: z.string().optional(),
    courtId: z.string().optional(),
    // Para promociones de producto
    targetProductId: z.string().optional(),
    buyQuantity: z.number().optional(),
    payQuantity: z.number().optional(),
});

type PromotionFormData = z.infer<typeof promotionSchema>;

interface CreatePromotionProps {
    complex: Complex;
    initialData?: Promotion;
    onSuccess?: () => void;
    onCancel?: () => void;
    isModal?: boolean;
}

const DAYS_OF_WEEK = [
    { value: 0, label: "Dom" },
    { value: 1, label: "Lun" },
    { value: 2, label: "Mar" },
    { value: 3, label: "Mié" },
    { value: 4, label: "Jue" },
    { value: 5, label: "Vie" },
    { value: 6, label: "Sáb" },
];

const PROMOTION_TYPES: { value: PromotionType; label: string; description: string; category: "reserva" | "producto" }[] = [
    // Para reservas de canchas
    { value: "PERCENTAGE_DISCOUNT", label: "Descuento %", description: "Ej: 20% OFF en reserva", category: "reserva" },
    { value: "FIXED_AMOUNT_DISCOUNT", label: "Descuento $", description: "Ej: $500 menos en reserva", category: "reserva" },
    { value: "FIXED_PRICE", label: "Precio Fijo", description: "Ej: $2000 reserva final", category: "reserva" },
    { value: "GIFT_PRODUCT", label: "Producto Regalo", description: "Ej: Coca gratis con reserva", category: "reserva" },
    // Para productos (independiente de reservas)
    { value: "PRODUCT_PERCENTAGE", label: "% en Producto", description: "Ej: 50% en Gatorade", category: "producto" },
    { value: "PRODUCT_FIXED_DISCOUNT", label: "$ menos en Producto", description: "Ej: $100 menos en Coca", category: "producto" },
    { value: "PRODUCT_BUY_X_PAY_Y", label: "Llevá X Pagá Y", description: "Ej: 2x1 en aguas", category: "producto" },
    { value: "PRODUCT_FIXED_PRICE", label: "Precio Especial", description: "Ej: Agua a $500", category: "producto" },
];

// Generar horarios cada 30 minutos (00:00, 00:30, 01:00, ...)
const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2).toString().padStart(2, "0");
    const minutes = i % 2 === 0 ? "00" : "30";
    return `${hours}:${minutes}`;
});

const CreatePromotion = ({ complex, initialData, onSuccess, onCancel, isModal = false }: CreatePromotionProps) => {
    const { addPromotion, updatePromotion: updateInStore } = usePromotionStore();
    const [isPending, startTransition] = useTransition();
    const [showAdvanced, setShowAdvanced] = useState(!!initialData); // Expandir avanzadas si es edición

    // Estado para múltiples productos regalo
    const [giftProducts, setGiftProducts] = useState<GiftProductInput[]>(
        initialData?.giftProducts?.map(gp => ({ productId: gp.productId, quantity: gp.quantity })) ||
        (initialData?.giftProduct ? [{ productId: initialData.giftProduct.id, quantity: 1 }] : []) ||
        []
    );

    const form = useForm<PromotionFormData>({
        resolver: zodResolver(promotionSchema),
        defaultValues: {
            name: initialData?.name || "",
            description: initialData?.description || "",
            code: initialData?.code || "",
            isActive: initialData?.isActive ?? true,
            type: (initialData?.type as any) || "PERCENTAGE_DISCOUNT",
            value: initialData?.value || 0,
            daysOfWeek: initialData?.daysOfWeek || [],
            startTime: initialData?.startTime || "",
            endTime: initialData?.endTime || "",
            validFrom: initialData?.validFrom ? format(new Date(initialData.validFrom), "yyyy-MM-dd") : "",
            validTo: initialData?.validTo ? format(new Date(initialData.validTo), "yyyy-MM-dd") : "",
            sportTypeId: initialData?.sportTypeId || "all",
            courtId: initialData?.courtId || "all",
            giftProductId: "",
            targetProductId: initialData?.targetProductId || "",
            buyQuantity: initialData?.buyQuantity || 2,
            payQuantity: initialData?.payQuantity || 1,
        },
    });

    const selectedType = form.watch("type");
    const selectedSportTypeId = form.watch("sportTypeId");

    // Filtrar canchas por tipo de deporte seleccionado
    const filteredCourts = selectedSportTypeId && selectedSportTypeId !== "all"
        ? complex.courts?.filter((c) => c.sportTypeId === selectedSportTypeId)
        : complex.courts;

    const onSubmit = async (data: PromotionFormData) => {
        startTransition(async () => {
            try {
                const payload = {
                    ...data,
                    complexId: complex.id,
                    sportTypeId: data.sportTypeId === "all" ? undefined : data.sportTypeId || undefined,
                    courtId: data.courtId === "all" ? undefined : data.courtId || undefined,
                    // Usar giftProducts en vez de giftProductId para GIFT_PRODUCT
                    giftProductId: undefined,
                    giftProducts: data.type === "GIFT_PRODUCT" ? giftProducts : undefined,
                    // Para promociones de producto
                    targetProductId: data.type?.startsWith("PRODUCT_") ? data.targetProductId : undefined,
                    buyQuantity: data.type === "PRODUCT_BUY_X_PAY_Y" ? data.buyQuantity : undefined,
                    payQuantity: data.type === "PRODUCT_BUY_X_PAY_Y" ? data.payQuantity : undefined,
                    validFrom: data.validFrom || undefined,
                    validTo: data.validTo || undefined,
                    startTime: data.startTime === "none" ? undefined : data.startTime || undefined,
                    endTime: data.endTime === "none" ? undefined : data.endTime || undefined,
                    code: data.code || undefined,
                };

                let result;

                if (initialData) {
                    result = await updatePromotion(initialData.id, payload);
                    if (result.success && result.data) {
                        toast.success("Promoción actualizada exitosamente");
                        updateInStore(initialData.id, result.data);
                        onSuccess?.();
                    }
                } else {
                    result = await createPromotion(payload);
                    if (result.success && result.data) {
                        toast.success("Promoción creada exitosamente");
                        addPromotion(result.data);
                        form.reset();
                        setGiftProducts([]);
                        setShowAdvanced(false);
                        onSuccess?.();
                    }
                }

                if (!result.success) {
                    toast.error(result.error || "Error al procesar la promoción");
                }
            } catch (error) {
                toast.error("Ocurrió un error inesperado");
                console.error("Error promotion:", error);
            }
        });
    };

    return (
        <div className={isModal ? "p-1" : "p-6 bg-white rounded-lg border border-gray-200 shadow-sm"}>
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800">{initialData ? "Editar Promoción" : "Nueva Promoción"}</h1>
                    <p className="text-sm text-gray-500 mt-1">{initialData ? "Modifica los detalles de la promoción" : "Configure los detalles del descuento"}</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Sección principal */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Nombre */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre de la promoción *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ej: Happy Hour, Promo Verano..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Código de cupón */}
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Código de cupón (opcional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ej: VERANO2024"
                                            {...field}
                                            className="uppercase"
                                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Código único que los clientes pueden usar
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Tipo y Valor */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Tipo de promoción */}
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de promoción *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar tipo" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {/* Promos de Reserva */}
                                            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">
                                                🏟️ Para Reservas de Cancha
                                            </div>
                                            {PROMOTION_TYPES.filter(t => t.category === "reserva").map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    <div className="flex flex-col">
                                                        <span>{type.label}</span>
                                                        <span className="text-xs text-gray-500">{type.description}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}

                                            {/* Promos de Producto */}
                                            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 mt-2">
                                                🥤 Para Productos (Bebidas/Snacks)
                                            </div>
                                            {PROMOTION_TYPES.filter(t => t.category === "producto").map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    <div className="flex flex-col">
                                                        <span>{type.label}</span>
                                                        <span className="text-xs text-gray-500">{type.description}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Valor del descuento */}
                        {selectedType !== "GIFT_PRODUCT" ? (
                            <FormField
                                control={form.control}
                                name="value"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {selectedType === "PERCENTAGE_DISCOUNT"
                                                ? "Porcentaje de descuento"
                                                : selectedType === "FIXED_AMOUNT_DISCOUNT"
                                                    ? "Monto a descontar"
                                                    : "Precio final"}
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2 text-gray-500">
                                                    {selectedType === "PERCENTAGE_DISCOUNT" ? "%" : "$"}
                                                </span>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step={selectedType === "PERCENTAGE_DISCOUNT" ? "1" : "100"}
                                                    max={selectedType === "PERCENTAGE_DISCOUNT" ? "100" : undefined}
                                                    {...field}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                    className="pl-8"
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ) : (
                            /* Múltiples productos a regalar */
                            <div className="space-y-3">
                                <FormLabel>Productos a regalar *</FormLabel>

                                {/* Lista de productos agregados */}
                                {giftProducts.length > 0 && (
                                    <div className="space-y-2">
                                        {giftProducts.map((gp, index) => {
                                            const product = complex.products?.find(p => p.id === gp.productId);
                                            return (
                                                <div key={gp.productId} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                                    <span className="flex-1 text-sm">
                                                        {product?.name} (${product?.salePrice})
                                                    </span>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={gp.quantity}
                                                        onChange={(e) => {
                                                            const newQty = parseInt(e.target.value) || 1;
                                                            setGiftProducts(prev =>
                                                                prev.map((item, i) =>
                                                                    i === index ? { ...item, quantity: newQty } : item
                                                                )
                                                            );
                                                        }}
                                                        className="w-16 h-8 text-center"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setGiftProducts(prev => prev.filter((_, i) => i !== index));
                                                        }}
                                                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Selector para agregar producto */}
                                <div className="flex gap-2">
                                    <Select
                                        onValueChange={(productId) => {
                                            if (productId && !giftProducts.find(gp => gp.productId === productId)) {
                                                setGiftProducts(prev => [...prev, { productId, quantity: 1 }]);
                                            }
                                        }}
                                        value=""
                                    >
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="Agregar producto..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {complex.products
                                                ?.filter(p => !giftProducts.find(gp => gp.productId === p.id))
                                                .map((product) => (
                                                    <SelectItem key={product.id} value={product.id}>
                                                        {product.name} (${product.salePrice})
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {giftProducts.length === 0 && (
                                    <div className="p-3 bg-blue-50 text-blue-700 rounded-md text-sm border border-blue-200">
                                        💡 Si dejas esto vacío, el empleado deberá elegir el producto (ej: Coca o Sprite) al momento de cobrar.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Campos para promociones de PRODUCTO */}
                    {selectedType?.startsWith("PRODUCT_") && (
                        <div className="space-y-4 p-4 bg-teal-50 rounded-lg border border-teal-200">
                            <h4 className="font-medium text-teal-700 flex items-center gap-2">
                                🥤 Configuración de Producto
                            </h4>

                            {/* Selector de producto objetivo */}
                            <FormField
                                control={form.control}
                                name="targetProductId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Producto al que aplica *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar producto..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {complex.products?.map((product) => (
                                                    <SelectItem key={product.id} value={product.id}>
                                                        {product.name} (${product.salePrice})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            La promoción se aplicará a este producto
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Campos de 2x1 */}
                            {selectedType === "PRODUCT_BUY_X_PAY_Y" && (
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="buyQuantity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Llevás</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min="2"
                                                        placeholder="2"
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormDescription>Cantidad que lleva</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="payQuantity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Pagás</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        placeholder="1"
                                                        {...field}
                                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormDescription>Cantidad que paga</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Descripción */}
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descripción (opcional)</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Describe la promoción para que los clientes la entiendan..."
                                        {...field}
                                        rows={2}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Días de la semana */}
                    <FormField
                        control={form.control}
                        name="daysOfWeek"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Días que aplica</FormLabel>
                                <FormDescription>
                                    Deja vacío para que aplique todos los días
                                </FormDescription>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {DAYS_OF_WEEK.map((day) => (
                                        <label
                                            key={day.value}
                                            className={`flex items-center justify-center px-3 py-2 rounded-md cursor-pointer border transition-colors ${field.value?.includes(day.value)
                                                ? "bg-gray-800 text-white border-gray-800"
                                                : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                                                }`}
                                        >
                                            <Checkbox
                                                checked={field.value?.includes(day.value)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        field.onChange([...field.value, day.value]);
                                                    } else {
                                                        field.onChange(field.value.filter((v) => v !== day.value));
                                                    }
                                                }}
                                                className="sr-only"
                                            />
                                            <span className="text-sm font-medium">{day.label}</span>
                                        </label>
                                    ))}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Opciones avanzadas */}
                    <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                        <CollapsibleTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full justify-between text-gray-600"
                            >
                                <span>Opciones avanzadas</span>
                                {showAdvanced ? (
                                    <ChevronUp className="h-4 w-4" />
                                ) : (
                                    <ChevronDown className="h-4 w-4" />
                                )}
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-4 pt-4">
                            {/* Rango de fechas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="validFrom"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fecha inicio</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="validTo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fecha fin</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Rango horario */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="startTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Hora inicio</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar hora" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">Sin límite</SelectItem>
                                                    {TIME_SLOTS.map((time) => (
                                                        <SelectItem key={time} value={time}>
                                                            {time}
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
                                    name="endTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Hora fin</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar hora" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">Sin límite</SelectItem>
                                                    {TIME_SLOTS.map((time) => (
                                                        <SelectItem key={time} value={time}>
                                                            {time}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Filtros por deporte y cancha */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="sportTypeId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tipo de deporte (opcional)</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Todos los deportes" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="all">Todos los deportes</SelectItem>
                                                    {complex.sportTypes?.map((st) => (
                                                        <SelectItem key={st.id} value={st.id}>
                                                            {st.name}
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
                                    name="courtId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Cancha específica (opcional)</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Todas las canchas" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="all">Todas las canchas</SelectItem>
                                                    {filteredCourts?.map((court) => (
                                                        <SelectItem key={court.id} value={court.id}>
                                                            {court.name || `Cancha ${court.courtNumber}`}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CollapsibleContent>
                    </Collapsible>

                    {/* Botón de envío */}
                    {/* Botones de acción */}
                    <div className="flex gap-3 pt-4">
                        {onCancel && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                className="flex-1"
                                disabled={isPending}
                            >
                                Cancelar
                            </Button>
                        )}
                        <Button
                            type="submit"
                            className={onCancel ? "flex-1 bg-gray-900 hover:bg-gray-800 text-white" : "w-full bg-gray-900 hover:bg-gray-800 text-white"}
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {initialData ? "Guardando..." : "Creando..."}
                                </>
                            ) : (
                                <>
                                    {initialData ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                                    {initialData ? "Guardar Cambios" : "Crear Promoción"}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default CreatePromotion;
