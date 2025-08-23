import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSportTypeDto } from './dto/create-sport-type.dto';
import { UpdateSportTypeDto } from './dto/update-sport-type.dto';
import { QuerySportTypeDto } from './dto/query-sport-type.dto';
import { SportTypeResponseDto } from './dto/sport-type-response.dto';

@Injectable()
export class SportTypesService {
  constructor(private prisma: PrismaService) {}

  private toResponseDto(sportType: any): SportTypeResponseDto {
    return {
      id: sportType.id,
      name: sportType.name,
      description: sportType.description,
      imageUrl: sportType.imageUrl,
      isActive: sportType.isActive,
      createdAt: sportType.createdAt,
      updatedAt: sportType.updatedAt,
    };
  }

  async create(
    createSportTypeDto: CreateSportTypeDto,
  ): Promise<SportTypeResponseDto> {
    const sportType = await this.prisma.sportType.create({
      data: createSportTypeDto,
    });

    return this.toResponseDto(sportType);
  }

  async findAll(query: QuerySportTypeDto): Promise<SportTypeResponseDto[]> {
    const where: any = {};

    if (typeof query.isActive !== 'undefined') {
      where.isActive = query.isActive;
    }

    if (query.search) {
      where.name = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    const sportTypes = await this.prisma.sportType.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return sportTypes.map(this.toResponseDto);
  }

  async findOne(id: string): Promise<SportTypeResponseDto> {
    const sportType = await this.prisma.sportType.findUnique({
      where: { id },
    });

    if (!sportType) {
      throw new NotFoundException(`Sport type with ID ${id} not found`);
    }

    return this.toResponseDto(sportType);
  }

  // async findByName(name: string): Promise<SportTypeResponseDto | null> {
  //   const sportType = await this.prisma.sportType.findUnique({
  //     where: { name },
  //   });

  //   return sportType ? this.toResponseDto(sportType) : null;
  // }

  async update(
    id: string,
    updateSportTypeDto: UpdateSportTypeDto,
  ): Promise<SportTypeResponseDto> {
    const existingSportType = await this.prisma.sportType.findUnique({
      where: { id },
    });

    if (!existingSportType) {
      throw new NotFoundException(`Sport type with ID ${id} not found`);
    }

    const sportType = await this.prisma.sportType.update({
      where: { id },
      data: updateSportTypeDto,
    });

    return this.toResponseDto(sportType);
  }

  async toggleStatus(id: string): Promise<SportTypeResponseDto> {
    const sportType = await this.prisma.sportType.findUnique({
      where: { id },
    });

    if (!sportType) {
      throw new NotFoundException(`Sport type with ID ${id} not found`);
    }

    const updatedSportType = await this.prisma.sportType.update({
      where: { id },
      data: { isActive: !sportType.isActive },
    });

    return this.toResponseDto(updatedSportType);
  }

  async remove(id: string): Promise<void> {
    const sportType = await this.prisma.sportType.findUnique({
      where: { id },
    });

    if (!sportType) {
      throw new NotFoundException(`Sport type with ID ${id} not found`);
    }

    await this.prisma.sportType.delete({ where: { id } });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.sportType.count({
      where: { id },
    });
    return count > 0;
  }
}
