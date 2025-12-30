"use client";

import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Complex } from "@/services/complex/complex";
import { Product } from "@/services/product/product";
import { createPurchaseOrder, CreatePurchaseOrderItem } from "@/services/purchase-order";
import { PaymentMethod } from "@/services/payment/payment";
import { Trash2, Plus } from "lucide-react";

interface PurchaseOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    complex: Complex;
    products: Product[];
    cashSessionId?: string;
}

interface PurchaseItem extends CreatePurchaseOrderItem {
    product: Product;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
    { value: "EFECTIVO", label: "Efectivo" },
    { value: "TARJETA_CREDITO", label: "Tarjeta" },
    { value: "TRANSFERENCIA", label: "Transferencia" },
    { value: "MERCADOPAGO", label: "MercadoPago" },
];

export const PurchaseOrderModal: React.FC<PurchaseOrderModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    complex,
    products,
    cashSessionId,
}) => {
    const [supplier, setSupplier] = useState("");
    const [notes, setNotes] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("EFECTIVO");
    const [items, setItems] = useState<PurchaseItem[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Available products that haven't been added yet
    const availableProducts = useMemo(() => {
        const addedIds = new Set(items.map((item) => item.productId));
        return products.filter((p) => !addedIds.has(p.id) && p.isActive);
    }, [products, items]);

    // Calculate total amount
    const totalAmount = useMemo(() => {
        return items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
    }, [items]);

    const handleAddProduct = () => {
        if (!selectedProductId) {
            toast.error("Selecciona un producto");
            return;
        }

        const product = products.find((p) => p.id === selectedProductId);
        if (!product) return;

        setItems([
            ...items,
            {
                productId: product.id,
                product,
                quantity: 1,
                unitCost: product.costPrice || 0,
            },
        ]);
        setSelectedProductId("");
    };

    const handleRemoveItem = (productId: string) => {
        setItems(items.filter((item) => item.productId !== productId));
    };

    const handleUpdateItem = (productId: string, field: "quantity" | "unitCost", value: number) => {
        setItems(
            items.map((item) =>
                item.productId === productId ? { ...item, [field]: value } : item
            )
        );
    };

    const handleSubmit = async () => {
        if (!supplier.trim()) {
            toast.error("Ingresa el nombre del proveedor");
            return;
        }

        if (items.length === 0) {
            toast.error("Agrega al menos un producto");
            return;
        }

        if (items.some((item) => item.quantity <= 0 || item.unitCost < 0)) {
            toast.error("Verifica las cantidades y precios");
            return;
        }

        setIsSubmitting(true);
        try {
            const { success, error } = await createPurchaseOrder({
                supplier: supplier.trim(),
                notes: notes.trim() || undefined,
                complexId: complex.id,
                items: items.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitCost: item.unitCost,
                })),
                paymentMethod,
                cashSessionId,
            });

            if (success) {
                toast.success("Orden de compra creada exitosamente");
                handleReset();
                onSuccess();
                onClose();
            } else {
                toast.error(error || "Error al crear la orden de compra");
            }
        } catch (err) {
            toast.error("Error inesperado al crear la orden");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setSupplier("");
        setNotes("");
        setPaymentMethod("EFECTIVO");
        setItems([]);
        setSelectedProductId("");
    };

    const handleClose = () => {
        if (!isSubmitting) {
            handleReset();
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Cargar Productos - Nueva Compra</DialogTitle>
                    <DialogDescription>
                        Registra la compra de productos de un proveedor. El stock se actualizará automáticamente.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Supplier and payment info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="supplier">Proveedor *</Label>
                            <Input
                                id="supplier"
                                value={supplier}
                                onChange={(e) => setSupplier(e.target.value)}
                                placeholder="Ej: Coca-Cola Argentina"
                                disabled={isSubmitting}
                            />
                        </div>
                        <div>
                            <Label htmlFor="paymentMethod">Método de Pago *</Label>
                            <Select
                                value={paymentMethod}
                                onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger id="paymentMethod">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PAYMENT_METHODS.map((method) => (
                                        <SelectItem key={method.value} value={method.value}>
                                            {method.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <Label htmlFor="notes">Notas (opcional)</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ej: Promo navideña, pedido urgente..."
                            disabled={isSubmitting}
                            rows={2}
                        />
                    </div>

                    {/* Product selection */}
                    <div>
                        <Label htmlFor="product">Agregar Producto</Label>
                        <div className="flex gap-2">
                            <Select
                                value={selectedProductId}
                                onValueChange={setSelectedProductId}
                                disabled={isSubmitting || availableProducts.length === 0}
                            >
                                <SelectTrigger id="product" className="flex-1">
                                    <SelectValue placeholder="Selecciona un producto" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableProducts.map((product) => (
                                        <SelectItem key={product.id} value={product.id}>
                                            {product.name} - Stock actual: {product.stock}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                type="button"
                                onClick={handleAddProduct}
                                disabled={isSubmitting || !selectedProductId}
                                size="icon"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Items table */}
                    {items.length > 0 && (
                        <div>
                            <Label>Productos en la Compra</Label>
                            <div className="border rounded-md mt-2">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Producto</TableHead>
                                            <TableHead className="text-right">Cantidad</TableHead>
                                            <TableHead className="text-right">Costo Unit.</TableHead>
                                            <TableHead className="text-right">Subtotal</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map((item) => (
                                            <TableRow key={item.productId}>
                                                <TableCell className="font-medium">{item.product.name}</TableCell>
                                                <TableCell className="text-right">
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) =>
                                                            handleUpdateItem(
                                                                item.productId,
                                                                "quantity",
                                                                parseInt(e.target.value) || 0
                                                            )
                                                        }
                                                        disabled={isSubmitting}
                                                        className="w-20 text-right ml-auto"
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={item.unitCost}
                                                        onChange={(e) =>
                                                            handleUpdateItem(
                                                                item.productId,
                                                                "unitCost",
                                                                parseFloat(e.target.value) || 0
                                                            )
                                                        }
                                                        disabled={isSubmitting}
                                                        className="w-24 text-right ml-auto"
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    ${(item.quantity * item.unitCost).toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemoveItem(item.productId)}
                                                        disabled={isSubmitting}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-right font-bold">
                                                TOTAL:
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-lg">
                                                ${totalAmount.toFixed(2)}
                                            </TableCell>
                                            <TableCell />
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || items.length === 0}>
                        {isSubmitting ? "Creando..." : "Crear Orden de Compra"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
