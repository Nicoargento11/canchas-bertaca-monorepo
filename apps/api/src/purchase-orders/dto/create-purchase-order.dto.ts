import { ApiProperty } from '@nestjs/swagger';
import {
    IsArray,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

export class PurchaseOrderItemDto {
    @ApiProperty({ description: 'Product ID', example: 'clx1234567890' })
    @IsString()
    productId: string;

    @ApiProperty({ description: 'Quantity purchased', example: 10 })
    @IsNumber()
    @Min(1)
    quantity: number;

    @ApiProperty({ description: 'Cost per unit', example: 500 })
    @IsNumber()
    @Min(0)
    unitCost: number;
}

export class CreatePurchaseOrderDto {
    @ApiProperty({ description: 'Supplier name', example: 'Coca-Cola Argentina' })
    @IsString()
    supplier: string;

    @ApiProperty({
        description: 'Optional notes about the purchase',
        example: 'Promo navideña',
        required: false,
    })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ description: 'Complex ID', example: 'clx1234567890' })
    @IsString()
    complexId: string;

    @ApiProperty({
        description: 'List of products to purchase',
        type: [PurchaseOrderItemDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PurchaseOrderItemDto)
    items: PurchaseOrderItemDto[];

    @ApiProperty({
        description: 'Payment method for this purchase',
        enum: ['EFECTIVO', 'TARJETA_CREDITO', 'TRANSFERENCIA', 'MERCADOPAGO'],
        example: 'EFECTIVO',
    })
    @IsString()
    paymentMethod: PaymentMethod;

    @ApiProperty({
        description: 'Cash session ID (if payment with cash)',
        required: false,
    })
    @IsOptional()
    @IsString()
    cashSessionId?: string;
}
