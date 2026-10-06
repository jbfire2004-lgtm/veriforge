import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { buildError } from './veriforge-response';
import type { VeriForgeRequest } from './veriforge-request.util';

@Catch()
export class VeriForgeExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<VeriForgeRequest>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const body = isHttp ? exception.getResponse() : null;

    const message =
      typeof body === 'object' && body !== null && 'message' in body
        ? Array.isArray((body as { message?: unknown }).message)
          ? String(((body as { message: unknown[] }).message)[0])
          : String((body as { message?: unknown }).message)
        : exception instanceof Error
          ? exception.message
          : 'Unexpected VeriForge API error';

    const details =
      typeof body === 'object' && body !== null ? body : undefined;

    response.status(status).json(
      buildError({
        code: isHttp ? 'VERIFORGE_HTTP_ERROR' : 'VERIFORGE_INTERNAL_ERROR',
        message,
        details,
        userId: request.user?.id ?? null,
        tenantId: request.veriforgeTenantId ?? request.user?.tenantId ?? null,
        forgeStatus: 'failed',
      }),
    );
  }
}
