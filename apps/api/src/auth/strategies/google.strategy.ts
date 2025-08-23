import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import googleOauthConfig from '../config/google-oauth.config';
import { ConfigType } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(googleOauthConfig.KEY)
    private readonly googleConfig: ConfigType<typeof googleOauthConfig>,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: googleConfig.clientID,
      clientSecret: googleConfig.clientSecret,
      callbackURL: googleConfig.callbackURL,
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request, // Tipo específico de Express
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    // Esperamos ver: { code: '...', state: '/fratelli', scope: '...' }
    try {
      // Validar que existe email
      if (!profile.emails || !profile.emails[0]?.value) {
        return done(new Error('No email provided by Google'), null);
      }

      const user = await this.authService.validateGoogleService({
        email: profile.emails[0].value,
        name: profile.displayName,
        password: '',
      });

      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
}
