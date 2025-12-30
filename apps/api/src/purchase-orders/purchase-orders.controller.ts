import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('purchase-orders')
@Controller('purchase-orders')
@UseGuards(JwtAuthGuard)
export class PurchaseOrdersController {
    constructor(private readonly purchaseOrdersService: PurchaseOrdersService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new purchase order' })
    @ApiResponse({ status: 201, description: 'Purchase order created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 404, description: 'Products not found' })
    create(@Body() createPurchaseOrderDto: CreatePurchaseOrderDto, @Request() req) {
        return this.purchaseOrdersService.create(
            createPurchaseOrderDto,
            req.user?.id,
        );
    }

    @Get()
    @ApiOperation({ summary: 'Get all purchase orders for a complex' })
    @ApiResponse({ status: 200, description: 'List of purchase orders' })
    findAll(
        @Query('complexId') complexId: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('supplier') supplier?: string,
    ) {
        return this.purchaseOrdersService.findAll(complexId, {
            startDate,
            endDate,
            supplier,
        });
    }
}
