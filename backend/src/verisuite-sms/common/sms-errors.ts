import { HttpException, HttpStatus } from '@nestjs/common';

export type SmsErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'BUSINESS_RULE'
  | 'RATE_LIMITED'
  | 'UPSTREAM_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'TIMEOUT';

const CODE_STATUS: Record<SmsErrorCode, HttpStatus> = {
  VALIDATION_ERROR: HttpStatus.BAD_REQUEST,
  UNAUTHORIZED: HttpStatus.UNAUTHORIZED,
  FORBIDDEN: HttpStatus.FORBIDDEN,
  NOT_FOUND: HttpStatus.NOT_FOUND,
  CONFLICT: HttpStatus.CONFLICT,
  BUSINESS_RULE: HttpStatus.UNPROCESSABLE_ENTITY,
  RATE_LIMITED: HttpStatus.TOO_MANY_REQUESTS,
  UPSTREAM_ERROR: HttpStatus.BAD_GATEWAY,
  SERVICE_UNAVAILABLE: HttpStatus.SERVICE_UNAVAILABLE,
  TIMEOUT: HttpStatus.GATEWAY_TIMEOUT,
};

export class SmsException extends HttpException {
  readonly code: SmsErrorCode;
  readonly details?: unknown;
  readonly requestId?: string;

  constructor(
    code: SmsErrorCode,
    message: string,
    details?: unknown,
    requestId?: string,
  ) {
    super(
      {
        error: {
          code,
          message,
          details,
          requestId,
        },
      },
      CODE_STATUS[code],
    );
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }
}

export function smsErrorEnvelope(
  code: SmsErrorCode,
  message: string,
  requestId?: string,
  details?: unknown,
) {
  return { error: { code, message, details, requestId } };
}
