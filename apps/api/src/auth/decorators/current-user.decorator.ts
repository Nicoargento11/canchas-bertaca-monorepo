import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from '../../users/entities/user.entity';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserEntity => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.user) {
      throw new Error('User not found in request - check auth guard order');
    }
    return request.user;
  },
);
