import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { toCanonicalApiError } from '@vera/api-contract';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest<{
      method?: string;
      originalUrl?: string;
      url?: string;
      ip?: string;
      correlationId?: string;
      user?: { id: number };
    }>();

    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let rawBody: string | object =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Unhandled unique-constraint races → 409 instead of opaque 500.
    if (
      !(exception instanceof HttpException) &&
      exception instanceof Prisma.PrismaClientKnownRequestError &&
      exception.code === 'P2002'
    ) {
      status = HttpStatus.CONFLICT;
      rawBody = {
        statusCode: HttpStatus.CONFLICT,
        message: 'Conflict: duplicate unique value',
        code: 'CONFLICT',
        details: exception.meta ?? undefined,
      };
    }

    const error = toCanonicalApiError(rawBody as string | object, status);

    const stack =
      status >= 500 && exception instanceof Error ? exception.stack : undefined;
    this.logger.error(
      JSON.stringify({
        type: 'phase1.error.http',
        statusCode: status,
        method: request?.method ?? 'UNKNOWN',
        path: request?.originalUrl ?? request?.url ?? 'unknown',
        ip: request?.ip ?? null,
        correlationId: request?.correlationId ?? null,
        userId: request?.user?.id ?? null,
        error,
        ...(stack ? { stack } : {}),
      }),
    );

    if (
      status === HttpStatus.TOO_MANY_REQUESTS &&
      typeof response.setHeader === 'function' &&
      !response.getHeader?.('Retry-After')
    ) {
      response.setHeader('Retry-After', '60');
    }

    if (
      (status === HttpStatus.SERVICE_UNAVAILABLE ||
        status === HttpStatus.BAD_GATEWAY ||
        status === HttpStatus.GATEWAY_TIMEOUT) &&
      typeof response.setHeader === 'function' &&
      !response.getHeader?.('Retry-After')
    ) {
      response.setHeader('Retry-After', '30');
    }

    response.status(status).json({
      status: 'error',
      success: false,
      statusCode: status,
      code: error.code,
      message: error.message,
      errors: [
        {
          code: error.code ?? 'ERROR',
          message: error.message,
          details: error.details,
        },
      ],
      error,
      ...(error.details ? { details: error.details } : {}),
      timestamp: new Date().toISOString(),
    });
  }
}
