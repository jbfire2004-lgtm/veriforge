import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { SmsException, smsErrorEnvelope } from './sms-errors';

@Catch()
export class SmsExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SmsExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();
    const requestId =
      (req.headers?.['x-request-id'] as string | undefined) ??
      req.smsScope?.requestId;

    if (exception instanceof SmsException) {
      const body = exception.getResponse();
      return res.status(exception.getStatus()).json(body);
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const raw = exception.getResponse();
      const message =
        typeof raw === 'string'
          ? raw
          : ((raw as { message?: string | string[] }).message ??
            exception.message);
      const msg = Array.isArray(message) ? message.join('; ') : String(message);
      const code =
        status === HttpStatus.UNAUTHORIZED
          ? 'UNAUTHORIZED'
          : status === HttpStatus.FORBIDDEN
            ? 'FORBIDDEN'
            : status === HttpStatus.NOT_FOUND
              ? 'NOT_FOUND'
              : status === HttpStatus.CONFLICT
                ? 'CONFLICT'
                : status === HttpStatus.UNPROCESSABLE_ENTITY
                  ? 'BUSINESS_RULE'
                  : status === HttpStatus.TOO_MANY_REQUESTS
                    ? 'RATE_LIMITED'
                    : status === HttpStatus.BAD_GATEWAY
                      ? 'UPSTREAM_ERROR'
                      : status === HttpStatus.SERVICE_UNAVAILABLE
                        ? 'SERVICE_UNAVAILABLE'
                        : status === HttpStatus.GATEWAY_TIMEOUT
                          ? 'TIMEOUT'
                          : status >= 500
                            ? 'SERVICE_UNAVAILABLE'
                            : 'VALIDATION_ERROR';
      return res
        .status(status)
        .json(smsErrorEnvelope(code as never, msg, requestId));
    }

    this.logger.error(
      exception instanceof Error ? exception.stack : String(exception),
    );
    return res
      .status(HttpStatus.SERVICE_UNAVAILABLE)
      .json(
        smsErrorEnvelope(
          'SERVICE_UNAVAILABLE',
          'Unexpected SMS service error',
          requestId,
        ),
      );
  }
}
