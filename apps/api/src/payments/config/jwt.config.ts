import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export default registerAs(
  'jwt',
  (): JwtModuleOptions => ({
    secret: process.env.JWT_PAYMENT_SECRET,
    signOptions: {
      expiresIn: process.env.JWT_PAYMENT_EXPIRES_IN,
    },
  }),
);
