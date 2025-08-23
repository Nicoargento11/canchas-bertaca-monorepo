// src/fixed-reserves/dto/update-fixed-reserve.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateFixedReserveDto } from './create-fixed-reserve.dto';

export class UpdateFixedReserveDto extends PartialType(CreateFixedReserveDto) {}
