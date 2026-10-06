import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Response } from 'express';
import { Observable, catchError, tap, throwError } from 'rxjs';

type RequestUser = { id: number; email?: string; role?: string };

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<{
      method?: string;
      originalUrl?: string;
      url?: string;
      ip?: string;
      correlationId?: string;
      user?: RequestUser;
      headers?: Record<string, string | undefined>;
      tenantId?: number;
    }>();
    const res = http.getResponse<Response>();
    const method = req?.method ?? 'UNKNOWN';
    const path = req?.originalUrl ?? req?.url ?? 'unknown';
    const started = Date.now();
    const correlationId = req.correlationId ?? null;
    const userId = req.user?.id ?? null;
    const tenantId = req.tenantId ?? null;
    const traceparent = req?.headers?.traceparent ?? null;
    const service = 'vera-backend';

    this.logger.log(
      JSON.stringify({
        type: 'request.start',
        service,
        method,
        path,
        correlationId,
        traceparent,
        userId,
        tenantId,
        ip: req?.ip ?? null,
        userAgent: req?.headers?.['user-agent'] ?? null,
      }),
    );

    return next.handle().pipe(
      tap(() => {
        this.logger.log(
          JSON.stringify({
            type: 'request.finish',
            service,
            outcome: 'success',
            method,
            path,
            correlationId,
            traceparent,
            userId,
            tenantId,
            statusCode: res.statusCode,
            durationMs: Date.now() - started,
          }),
        );
        if (Date.now() - started > 1500) {
          this.logger.warn(
            JSON.stringify({
              type: 'request.slow',
              service,
              method,
              path,
              correlationId,
              statusCode: res.statusCode,
              durationMs: Date.now() - started,
            }),
          );
        }
      }),
      catchError((err: unknown) => {
        this.logger.error(
          JSON.stringify({
            type: 'request.finish',
            service,
            outcome: 'error',
            method,
            path,
            correlationId,
            traceparent,
            userId,
            tenantId,
            durationMs: Date.now() - started,
            message: err instanceof Error ? err.message : String(err),
          }),
        );
        return throwError(() => err);
      }),
    );
  }
}
