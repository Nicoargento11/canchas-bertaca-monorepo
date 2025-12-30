import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
} from '@nestjs/common';
import { EventPackagesService } from './event-packages.service';
import { CreateEventPackageDto } from './dto/create-event-package.dto';
import { UpdateEventPackageDto } from './dto/update-event-package.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('event-packages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('event-packages')
export class EventPackagesController {
    constructor(private readonly eventPackagesService: EventPackagesService) { }

    @Post()
    @Roles(Role.SUPER_ADMIN, Role.ORGANIZACION_ADMIN, Role.COMPLEJO_ADMIN)
    @ApiOperation({ summary: 'Create a new event package' })
    create(@Body() createEventPackageDto: CreateEventPackageDto) {
        return this.eventPackagesService.create(createEventPackageDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all event packages' })
    @ApiQuery({ name: 'complexId', required: false })
    findAll(@Query('complexId') complexId?: string) {
        return this.eventPackagesService.findAll(complexId);
    }

    @Get('active/:complexId')
    @ApiOperation({ summary: 'Get active event packages for a complex' })
    findAllActive(@Param('complexId') complexId: string) {
        return this.eventPackagesService.findAllActive(complexId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get event package by ID' })
    findOne(@Param('id') id: string) {
        return this.eventPackagesService.findOne(id);
    }

    @Patch(':id')
    @Roles(Role.SUPER_ADMIN, Role.ORGANIZACION_ADMIN, Role.COMPLEJO_ADMIN)
    @ApiOperation({ summary: 'Update event package' })
    update(@Param('id') id: string, @Body() updateEventPackageDto: UpdateEventPackageDto) {
        return this.eventPackagesService.update(id, updateEventPackageDto);
    }

    @Patch(':id/toggle-active')
    @Roles(Role.SUPER_ADMIN, Role.ORGANIZACION_ADMIN, Role.COMPLEJO_ADMIN)
    @ApiOperation({ summary: 'Toggle active status' })
    toggleActive(@Param('id') id: string) {
        return this.eventPackagesService.toggleActive(id);
    }

    @Delete(':id')
    @Roles(Role.SUPER_ADMIN, Role.ORGANIZACION_ADMIN)
    @ApiOperation({ summary: 'Delete event package' })
    remove(@Param('id') id: string) {
        return this.eventPackagesService.remove(id);
    }
}
