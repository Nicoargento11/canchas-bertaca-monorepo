// auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import jwtConfig from './config/jwt.config';
import { LocalStrategy } from './strategies/local.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import googleOauthConfig from './config/google-oauth.config';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(googleOauthConfig),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersService,
    JwtStrategy, // Asegúrate de incluir JwtStrategy
    PrismaService,
    LocalStrategy,
    GoogleStrategy,
  ],
})
export class AuthModule {}
