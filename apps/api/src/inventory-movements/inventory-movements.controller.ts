import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { MovementType } from '@prisma/client';
import { InventoryMovementService } from './inventory-movements.service';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';
import { UpdateInventoryMovementDto } from './dto/update-inventory-movement.dto';

@Controller('inventory-movements')
export class InventoryMovementController {
  constructor(
    private readonly inventoryMovementService: InventoryMovementService,
  ) {}

  @Post()
  create(@Body() createInventoryMovementDto: CreateInventoryMovementDto) {
    return this.inventoryMovementService.create(createInventoryMovementDto);
  }

  @Get()
  findAll() {
    return this.inventoryMovementService.findAll();
  }

  @Get('by-product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.inventoryMovementService.findByProduct(productId);
  }

  @Get('by-complex/:complexId')
  findByComplex(@Param('complexId') complexId: string) {
    return this.inventoryMovementService.findByComplex(complexId);
  }

  @Get('filter')
  filter(
    @Query('type') type?: MovementType,
    @Query('productId') productId?: string,
    @Query('complexId') complexId?: string,
  ) {
    return this.inventoryMovementService.filter({
      type,
      productId,
      complexId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryMovementService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInventoryMovementDto: UpdateInventoryMovementDto,
  ) {
    return this.inventoryMovementService.update(id, updateInventoryMovementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventoryMovementService.remove(id);
  }
}
