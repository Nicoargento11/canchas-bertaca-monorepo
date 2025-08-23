import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Patch,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductService } from './products.service';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'Product created',
    type: ProductResponseDto,
  })
  async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({
    status: 200,
    description: 'List of products',
    type: [ProductResponseDto],
  })
  async findAll(): Promise<ProductResponseDto[]> {
    return this.productService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiResponse({
    status: 200,
    description: 'Product found',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id') id: string): Promise<ProductResponseDto> {
    return this.productService.findById(id);
  }

  @Get('barcode/:barcode')
  @ApiOperation({ summary: 'Get a product by barcode' })
  @ApiResponse({
    status: 200,
    description: 'Product found',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findByBarcode(
    @Param('barcode') barcode: string,
  ): Promise<ProductResponseDto> {
    return this.productService.findByBarcode(barcode);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get products with low stock' })
  @ApiResponse({
    status: 200,
    description: 'List of products with low stock',
    type: [ProductResponseDto],
  })
  async getLowStockProducts(
    @Query('threshold') threshold?: number,
  ): Promise<ProductResponseDto[]> {
    return this.productService.getLowStockProducts(threshold);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({
    status: 200,
    description: 'Product updated',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.productService.delete(id);
  }
}
