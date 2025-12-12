import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { CreateProductSaleDto } from './dto/create-product-sale.dto';
import { UpdateProductSaleDto } from './dto/update-product-sale.dto';
import { ProductSaleResponseDto } from './dto/product-sale-response.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductSaleService } from './product-sales.service';
import { ProductSale } from '@prisma/client';

@ApiTags('product-sales')
@Controller('product-sales')
export class ProductSaleController {
  constructor(private readonly productSaleService: ProductSaleService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product sale' })
  @ApiResponse({
    status: 201,
    description: 'Product sale created',
    type: ProductSaleResponseDto,
  })
  async create(
    @Body() createProductSaleDto: CreateProductSaleDto,
  ): Promise<ProductSaleResponseDto> {
    return this.productSaleService.create(createProductSaleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all product sales' })
  @ApiResponse({
    status: 200,
    description: 'List of product sales',
    type: [ProductSaleResponseDto],
  })
  async findAll(
    @Query('complexId') complexId?: string,
  ): Promise<ProductSaleResponseDto[]> {
    return this.productSaleService.findAll(complexId);
  }

  @Get('by-sale/:saleId')
  @ApiOperation({ summary: 'Get product sales by sale ID' })
  @ApiResponse({
    status: 200,
    description: 'List of product sales for the sale',
    type: [ProductSaleResponseDto],
  })
  async findBySale(
    @Param('saleId') saleId: string,
  ): Promise<ProductSaleResponseDto[]> {
    return this.productSaleService.findBySale(saleId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product sale by ID' })
  @ApiResponse({
    status: 200,
    description: 'Product sale found',
    type: ProductSaleResponseDto,
  })
  async findOne(@Param('id') id: string): Promise<ProductSaleResponseDto> {
    return this.productSaleService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a product sale' })
  @ApiResponse({
    status: 200,
    description: 'Product sale updated',
    type: ProductSaleResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateProductSaleDto: UpdateProductSaleDto,
  ): Promise<ProductSaleResponseDto> {
    return this.productSaleService.update(id, updateProductSaleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product sale' })
  @ApiResponse({ status: 200, description: 'Product sale deleted' })
  async remove(@Param('id') id: string): Promise<ProductSale> {
    return this.productSaleService.remove(id);
  }
}
