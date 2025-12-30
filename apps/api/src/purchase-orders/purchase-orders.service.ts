import {
    Injectable,
    Logger,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { MovementType } from '@prisma/client';

@Injectable()
export class PurchaseOrdersService {
    private readonly logger = new Logger(PurchaseOrdersService.name);

    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreatePurchaseOrderDto, userId?: string) {
        // Validate all products exist and belong to complex
        const productIds = dto.items.map((item) => item.productId);
        const products = await this.prisma.product.findMany({
            where: {
                id: { in: productIds },
                complexId: dto.complexId,
            },
        });

        if (products.length !== productIds.length) {
            throw new NotFoundException(
                'One or more products not found or do not belong to this complex',
            );
        }

        // Calculate totals and generate order number
        const totalAmount = dto.items.reduce(
            (sum, item) => sum + item.quantity * item.unitCost,
            0,
        );

        const orderNumber = await this.generateOrderNumber();

        // Create purchase order with all related records in a transaction
        const purchaseOrder = await this.prisma.$transaction(async (tx) => {
            // 1. Create purchase order with items
            const po = await tx.purchaseOrder.create({
                data: {
                    orderNumber,
                    supplier: dto.supplier,
                    totalAmount,
                    notes: dto.notes,
                    complexId: dto.complexId,
                    createdById: userId,
                    items: {
                        create: dto.items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            unitCost: item.unitCost,
                            subtotal: item.quantity * item.unitCost,
                        })),
                    },
                },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
            });

            // 2. For each item: update stock, create inventory movement, update cost price
            for (const item of po.items) {
                // Update product stock and cost price (Last Purchase Price strategy)
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: { increment: item.quantity },
                        costPrice: item.unitCost, // Last purchase price
                    },
                });

                // Create inventory movement
                await tx.inventoryMovement.create({
                    data: {
                        type: MovementType.COMPRA,
                        quantity: item.quantity,
                        reason: `Compra: ${dto.supplier} - Orden ${orderNumber}`,
                        productId: item.productId,
                        complexId: dto.complexId,
                    },
                });
            }

            // 3. Create payment (EGRESO)
            const payment = await tx.payment.create({
                data: {
                    amount: totalAmount,
                    method: dto.paymentMethod,
                    transactionType: 'EGRESO',
                    isPartial: false,
                    complexId: dto.complexId,
                    cashSessionId: dto.cashSessionId,
                },
            });

            // 4. Link payment to purchase order
            await tx.purchaseOrder.update({
                where: { id: po.id },
                data: { paymentId: payment.id },
            });

            return po;
        });

        this.logger.log(
            `Purchase order ${orderNumber} created successfully. Total: $${totalAmount}`,
        );

        return purchaseOrder;
    }

    async findAll(complexId: string, filters?: {
        startDate?: string;
        endDate?: string;
        supplier?: string;
    }) {
        const where: any = { complexId };

        if (filters) {
            if (filters.supplier) {
                where.supplier = { contains: filters.supplier, mode: 'insensitive' };
            }

            if (filters.startDate || filters.endDate) {
                where.createdAt = {};
                if (filters.startDate) {
                    where.createdAt.gte = new Date(filters.startDate);
                }
                if (filters.endDate) {
                    where.createdAt.lte = new Date(filters.endDate);
                }
            }
        }

        return this.prisma.purchaseOrder.findMany({
            where,
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                payment: true,
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    private async generateOrderNumber(): Promise<string> {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

        // Find last order number for today
        const lastOrder = await this.prisma.purchaseOrder.findFirst({
            where: {
                orderNumber: {
                    startsWith: `PO-${dateStr}`,
                },
            },
            orderBy: {
                orderNumber: 'desc',
            },
        });

        let sequence = 1;
        if (lastOrder) {
            const lastSequence = parseInt(lastOrder.orderNumber.split('-')[2]);
            sequence = lastSequence + 1;
        }

        return `PO-${dateStr}-${sequence.toString().padStart(4, '0')}`;
    }
}
