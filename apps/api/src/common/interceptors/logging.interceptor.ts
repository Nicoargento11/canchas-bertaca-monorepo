import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, body, query, params } = request;
    const userAgent = request.get('user-agent') || '';
    const ip = request.ip || request.connection.remoteAddress;

    // Extract user info if available (from JWT auth)
    const user = request.user;
    const userId = user?.id || 'anonymous';
    const userRole = user?.role || 'N/A';

    const startTime = Date.now();

    // Log incoming request
    this.logger.log(
      `[REQUEST] ${method} ${url} | User: ${userId} (${userRole}) | IP: ${ip}`,
    );

    // Log query params and body for non-GET requests (with sensitive data filtering)
    if (method !== 'GET') {
      const sanitizedBody = this.sanitizeBody(body);
      if (Object.keys(sanitizedBody).length > 0) {
        this.logger.debug(`[REQUEST BODY] ${JSON.stringify(sanitizedBody)}`);
      }
    }

    if (Object.keys(query).length > 0) {
      this.logger.debug(`[QUERY PARAMS] ${JSON.stringify(query)}`);
    }

    if (Object.keys(params).length > 0) {
      this.logger.debug(`[ROUTE PARAMS] ${JSON.stringify(params)}`);
    }

    return next.handle().pipe(
      tap((data) => {
        const elapsedTime = Date.now() - startTime;
        const statusCode = response.statusCode;

        // Log successful response
        this.logger.log(
          `[RESPONSE] ${method} ${url} | Status: ${statusCode} | Time: ${elapsedTime}ms | User: ${userId}`,
        );

        // Log slow requests (> 1 second)
        if (elapsedTime > 1000) {
          this.logger.warn(
            `[SLOW REQUEST] ${method} ${url} took ${elapsedTime}ms | User: ${userId}`,
          );
        }
      }),
      catchError((error) => {
        const elapsedTime = Date.now() - startTime;
        const statusCode = error?.status || 500;
        const errorMessage = error?.message || 'Unknown error';

        // Log error response
        this.logger.error(
          `[ERROR] ${method} ${url} | Status: ${statusCode} | Time: ${elapsedTime}ms | User: ${userId}`,
        );
        this.logger.error(`[ERROR DETAILS] ${errorMessage}`);

        // Log stack trace for 500 errors
        if (statusCode >= 500 && error?.stack) {
          this.logger.error(`[STACK TRACE] ${error.stack}`);
        }

        // Re-throw the error to be handled by exception filters
        throw error;
      }),
    );
  }

  /**
   * Sanitize request body to remove sensitive information
   */
  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sensitiveFields = [
      'password',
      'hashedRefreshToken',
      'accessToken',
      'refreshToken',
      'token',
      'secret',
      'apiKey',
    ];

    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }
}
