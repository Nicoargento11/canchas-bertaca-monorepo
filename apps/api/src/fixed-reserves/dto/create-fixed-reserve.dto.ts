// src/fixed-reserves/dto/create-fixed-reserve.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class CreateFixedReserveDto {
  @ApiProperty({ example: '00:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: '01:00' })
  @IsString()
  endTime: string;

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: '1' })
  @IsString()
  scheduleDayId: string; // Cambiado de scheduleDay a scheduleDayId

  @ApiProperty({ example: 'cmadamrds0003l0g8k3xchwcp' })
  @IsString()
  rateId: string;

  @ApiProperty({ example: 'cmavrp3ks0000l0ocwylumk4l' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'cmadamre20008l0g8nstrqqi1' })
  @IsString()
  courtId: string;

  @ApiProperty({ example: 'cmadamrdg0000l0g8fv4grm98' })
  @IsString()
  complexId: string;

  @ApiProperty({ required: false })
  @IsString()
  promotionId?: string;
}
