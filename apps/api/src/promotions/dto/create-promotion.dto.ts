import { PromotionType } from '@prisma/client';
import {
    IsString,
    IsNumber,
    IsOptional,
    IsBoolean,
    IsEnum,
    IsArray,
    IsDateString,
    ValidateIf,
    ValidateNested,
    Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// DTO para cada producto regalo con cantidad
export class GiftProductItemDto {
    @ApiProperty({ description: 'ID del producto a regalar' })
    @IsString()
    productId: string;

    @ApiProperty({ description: 'Cantidad de este producto a regalar', default: 1 })
    @IsNumber()
    @Min(1)
    quantity: number;
}

export class CreatePromotionDto {
    @ApiProperty({ description: 'Nombre de la promoción' })
    @IsString()
    name: string;

    @ApiPropertyOptional({ description: 'Descripción de la promoción' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ description: 'Código de cupón único' })
    @IsString()
    @IsOptional()
    code?: string;

    @ApiPropertyOptional({ description: 'Si la promoción está activa', default: true })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiPropertyOptional({ description: 'Fecha de inicio de la promoción (ISO 8601)' })
    @IsDateString()
    @IsOptional()
    validFrom?: string;

    @ApiPropertyOptional({ description: 'Fecha de fin de la promoción (ISO 8601)' })
    @IsDateString()
    @IsOptional()
    validTo?: string;

    @ApiPropertyOptional({
        description: 'Días de la semana que aplica (0=Domingo, 1=Lunes, etc.)',
        example: [1, 3, 5],
        type: [Number]
    })
    @IsArray()
    @IsNumber({}, { each: true })
    @IsOptional()
    daysOfWeek?: number[];

    @ApiPropertyOptional({ description: 'Hora de inicio (formato HH:mm)', example: '14:00' })
    @IsString()
    @IsOptional()
    startTime?: string;

    @ApiPropertyOptional({ description: 'Hora de fin (formato HH:mm)', example: '17:00' })
    @IsString()
    @IsOptional()
    endTime?: string;

    @ApiProperty({ description: 'ID del complejo donde aplica la promoción' })
    @IsString()
    complexId: string;

    @ApiPropertyOptional({ description: 'ID del tipo de deporte (null = aplica a todos)' })
    @IsString()
    @IsOptional()
    sportTypeId?: string;

    @ApiPropertyOptional({ description: 'ID de la cancha específica (null = aplica a todas)' })
    @IsString()
    @IsOptional()
    courtId?: string;

    @ApiProperty({
        description: 'Tipo de promoción',
        enum: PromotionType,
        example: 'PERCENTAGE_DISCOUNT'
    })
    @IsEnum(PromotionType)
    type: PromotionType;

    @ApiPropertyOptional({
        description: 'Valor del descuento (% o monto fijo según el tipo)',
        example: 20
    })
    @ValidateIf((o) => o.type !== 'GIFT_PRODUCT')
    @IsNumber()
    @IsOptional()
    value?: number;

    @ApiPropertyOptional({ description: '[DEPRECADO] ID del producto que se regala (usar giftProducts)' })
    @ValidateIf((o) => o.type === 'GIFT_PRODUCT')
    @IsString()
    @IsOptional()
    giftProductId?: string;

    @ApiPropertyOptional({
        description: 'Lista de productos a regalar con cantidades (solo para GIFT_PRODUCT)',
        type: [GiftProductItemDto]
    })
    @ValidateIf((o) => o.type === 'GIFT_PRODUCT')
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GiftProductItemDto)
    @IsOptional()
    giftProducts?: GiftProductItemDto[];

    // --- Campos para promociones de PRODUCTO ---

    @ApiPropertyOptional({ description: 'ID del producto al que aplica la promoción (para PRODUCT_*)' })
    @ValidateIf((o) => o.type?.startsWith('PRODUCT_'))
    @IsString()
    @IsOptional()
    targetProductId?: string;

    @ApiPropertyOptional({ description: 'Cantidad que lleva el cliente (para PRODUCT_BUY_X_PAY_Y)', example: 2 })
    @ValidateIf((o) => o.type === 'PRODUCT_BUY_X_PAY_Y')
    @IsNumber()
    @IsOptional()
    buyQuantity?: number;

    @ApiPropertyOptional({ description: 'Cantidad que paga el cliente (para PRODUCT_BUY_X_PAY_Y)', example: 1 })
    @ValidateIf((o) => o.type === 'PRODUCT_BUY_X_PAY_Y')
    @IsNumber()
    @IsOptional()
    payQuantity?: number;
}
