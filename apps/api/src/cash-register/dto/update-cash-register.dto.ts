// src/cash-register/dto/update-cash-register.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateCashRegisterDto } from './create-cash-register.dto';

export class UpdateCashRegisterDto extends PartialType(CreateCashRegisterDto) {}
