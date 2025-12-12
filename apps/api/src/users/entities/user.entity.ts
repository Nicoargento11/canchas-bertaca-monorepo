import { Complex, Role, Organization } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserEntity {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;

  @Exclude()
  password: string;

  @Exclude()
  hashedRefreshToken?: string;

  createdAt: Date;
  updatedAt: Date;
  organizationId?: string;
  complexId?: string;
  Complex?: Partial<Complex>;
  Organization?: Partial<Organization>;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
