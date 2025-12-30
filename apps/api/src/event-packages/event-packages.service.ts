import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventPackageDto } from './dto/create-event-package.dto';
import { UpdateEventPackageDto } from './dto/update-event-package.dto';

@Injectable()
export class EventPackagesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createEventPackageDto: CreateEventPackageDto) {
        return this.prisma.eventPackage.create({
            data: createEventPackageDto,
        });
    }

    async findAll(complexId?: string) {
        return this.prisma.eventPackage.findMany({
            where: complexId ? { complexId } : undefined,
            orderBy: { createdAt: 'desc' },
        });
    }

    async findAllActive(complexId: string) {
        return this.prisma.eventPackage.findMany({
            where: {
                complexId,
                isActive: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        return this.prisma.eventPackage.findUnique({
            where: { id },
            include: {
                complex: true,
            },
        });
    }

    async update(id: string, updateEventPackageDto: UpdateEventPackageDto) {
        return this.prisma.eventPackage.update({
            where: { id },
            data: updateEventPackageDto,
        });
    }

    async remove(id: string) {
        return this.prisma.eventPackage.delete({
            where: { id },
        });
    }

    async toggleActive(id: string) {
        const eventPackage = await this.prisma.eventPackage.findUnique({
            where: { id },
        });

        return this.prisma.eventPackage.update({
            where: { id },
            data: { isActive: !eventPackage?.isActive },
        });
    }
}
