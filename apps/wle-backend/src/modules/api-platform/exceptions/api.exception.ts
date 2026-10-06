import { HttpException, HttpStatus } from '@nestjs/common';
import type { ApiErrorCodeValue } from '../constants/error-codes';

export type ApiExceptionBody = {
  code: ApiErrorCodeValue;
  message: string;
  details?: Record<string, unknown>;
};

const STATUS_BY_CODE: Record<ApiErrorCodeValue, HttpStatus> = {
  VALIDATION_ERROR: HttpStatus.BAD_REQUEST,
  NOT_FOUND: HttpStatus.NOT_FOUND,
  UNAUTHORIZED: HttpStatus.UNAUTHORIZED,
  FORBIDDEN: HttpStatus.FORBIDDEN,
  CONFLICT: HttpStatus.CONFLICT,
  BAD_REQUEST: HttpStatus.BAD_REQUEST,
  INTERNAL_ERROR: HttpStatus.INTERNAL_SERVER_ERROR,
  RATE_LIMITED: HttpStatus.TOO_MANY_REQUESTS,
  OFFLINE_SYNC_CONFLICT: HttpStatus.CONFLICT,
};

export class ApiException extends HttpException {
  constructor(
    code: ApiErrorCodeValue,
    message: string,
    details?: Record<string, unknown>,
    statusOverride?: HttpStatus,
  ) {
    const status =
      statusOverride ?? STATUS_BY_CODE[code] ?? HttpStatus.BAD_REQUEST;
    super({ code, message, details }, status);
  }
}
