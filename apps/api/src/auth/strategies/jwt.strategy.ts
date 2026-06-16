import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigType } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import jwtConfig from '../config/jwt.config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(jwtConfig.KEY)
    private jwtConfiguration: ConfigType<typeof jwtConfig>,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // 1. Primero, busca en el header 'Authorization' (el interceptor lo setea tras refresh)
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        // 2. Si no hay header, intenta extraerlo de la cookie 'access_token'
        (request: Request) => {
          return request?.cookies?.access_token;
        },
      ]),
      secretOrKey: jwtConfiguration.secret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    const user = await this.usersService.findOne(payload.sub);
    return user;
  }
}
