import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, Min } from 'class-validator';

export class CreateEventPackageDto {
    @ApiProperty({ example: 'Combo 1' })
    @IsString()
    name: string;

    @ApiPropertyOptional({ example: '1 Cancha de 5 + Parrilla' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 1, description: 'Number of courts (null = all courts)' })
    @IsOptional()
    @IsNumber()
    @Min(1)
    courtCount?: number | null;

    @ApiPropertyOptional({ example: 'FUTBOL_5', description: 'Court type filter' })
    @IsOptional()
    @IsString()
    courtType?: string | null;

    @ApiProperty({ example: 3.0, description: 'Duration in hours' })
    @IsNumber()
    @Min(0.5)
    durationHours: number;

    @ApiProperty({ example: 75000, description: 'Base price without lights' })
    @IsNumber()
    @Min(0)
    basePrice: number;

    @ApiProperty({ example: 105000, description: 'Price with lights' })
    @IsNumber()
    @Min(0)
    lightPrice: number;

    @ApiProperty({ example: ['Parrilla', 'Mesas y sillas'], type: [String] })
    @IsArray()
    @IsString({ each: true })
    includes: string[];

    @ApiPropertyOptional({ example: false, default: false })
    @IsOptional()
    @IsBoolean()
    allowExtras?: boolean;

    @ApiPropertyOptional({ example: true, default: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiProperty({ example: 'cln3j8h4d00003b6q1q2q3q4q' })
    @IsString()
    complexId: string;
}
