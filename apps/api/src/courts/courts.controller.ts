import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CourtsService } from './courts.service';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('courts')
export class CourtsController {
  constructor(private readonly courtsService: CourtsService) {}

  @Post()
  async create(@Body() createCourtDto: CreateCourtDto) {
    const existingCourt = await this.courtsService.findByName(
      createCourtDto.name,
    );
    if (existingCourt) {
      throw new ConflictException(
        `La cancha "${createCourtDto.name}" ya existe`,
      );
    }
    return this.courtsService.create(createCourtDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.courtsService.findAll();
  }

  @Public()
  @Get(':name')
  findOne(@Param('name') name: string) {
    const court = this.courtsService.findByName(name);
    if (!court) {
      throw new NotFoundException(`Cancha con nombre "${name}" no encontrada`);
    }
    return court;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCourtDto: UpdateCourtDto,
  ) {
    const updatedCourt = this.courtsService.update(id, updateCourtDto);
    if (!updatedCourt) {
      throw new NotFoundException(`Cancha con ID ${id} no encontrada`);
    }
    return updatedCourt;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const deletedCourt = this.courtsService.remove(id);
    if (!deletedCourt) {
      throw new NotFoundException(`Cancha con ID ${id} no encontrada`);
    }
    return { message: `Cancha con ID ${id} eliminada correctamente` };
  }
}
