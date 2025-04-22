import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ProductSalesService } from './product-sales.service';
import { CreateProductSaleDto } from './dto/create-product-sale.dto';
import { UpdateProductSaleDto } from './dto/update-product-sale.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Product Sales')
@Controller('product-sales')
export class ProductSalesController {
  constructor(private readonly productSalesService: ProductSalesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product sale' })
  @ApiResponse({
    status: 201,
    description: 'Product sale created successfully',
  })
  create(@Body() createProductSaleDto: CreateProductSaleDto) {
    console.log(createProductSaleDto);
    return this.productSalesService.create(createProductSaleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all product sales' })
  findAll() {
    return this.productSalesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product sale by ID' })
  findOne(@Param('id') id: string) {
    return this.productSalesService.findOne(id);
  }

  @Get('by-reserve/:reserveId')
  @ApiOperation({ summary: 'Get product sales by reserve ID' })
  findByReserve(@Param('reserveId') reserveId: string) {
    return this.productSalesService.findByReserve(reserveId);
  }

  @Get('by-product/:productId')
  @ApiOperation({ summary: 'Get product sales by product ID' })
  findByProduct(@Param('productId') productId: string) {
    return this.productSalesService.findByProduct(productId);
  }

  @Get('total-by-reserve/:reserveId')
  @ApiOperation({ summary: 'Get total sales amount by reserve ID' })
  getTotalSalesByReserve(@Param('reserveId') reserveId: string) {
    return this.productSalesService.getTotalSalesByReserve(reserveId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product sale' })
  update(
    @Param('id') id: string,
    @Body() updateProductSaleDto: UpdateProductSaleDto,
  ) {
    return this.productSalesService.update(id, updateProductSaleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product sale' })
  remove(@Param('id') id: string) {
    return this.productSalesService.remove(id);
  }
}
