import { Injectable } from '@nestjs/common';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CourtsService {
  constructor(private readonly prismaService: PrismaService) {}
  create(createCourtDto: CreateCourtDto) {
    return 'This action adds a new court';
  }

  findAll() {
    return this.prismaService.court.findMany();
  }

  findByName(name: string) {
    return this.prismaService.court.findUnique({
      where: { name },
      include: { pricing: true },
    });
  }

  findOne(id: string) {
    return `This action returns a #${id} court`;
  }

  update(id: string, updateCourtDto: UpdateCourtDto) {
    return `This action updates a #${id} court`;
  }

  remove(id: string) {
    return `This action removes a #${id} court`;
  }
}
