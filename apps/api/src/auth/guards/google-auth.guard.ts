import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    // Tomamos el parámetro `state` del query string del frontend
    const stateFromFrontend = request.query.state || '/';

    return {
      scope: ['email', 'profile'],
      state: stateFromFrontend,
    };
  }

  // err: any, user: any, info: any, context: any, status?: any
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleRequest(err: any, user: any, info: any, context: any, status?: any) {
    // Devolvemos el usuario como normalmente hace Nest
    return user;
  }
}
