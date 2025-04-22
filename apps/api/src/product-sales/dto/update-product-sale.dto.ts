import { PartialType } from '@nestjs/mapped-types';
import { CreateProductSaleDto } from './create-product-sale.dto';

export class UpdateProductSaleDto extends PartialType(CreateProductSaleDto) {}
