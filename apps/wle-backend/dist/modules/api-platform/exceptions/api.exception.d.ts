import { HttpException, HttpStatus } from '@nestjs/common';
import type { ApiErrorCodeValue } from '../constants/error-codes';
export type ApiExceptionBody = {
    code: ApiErrorCodeValue;
    message: string;
    details?: Record<string, unknown>;
};
export declare class ApiException extends HttpException {
    constructor(code: ApiErrorCodeValue, message: string, details?: Record<string, unknown>, statusOverride?: HttpStatus);
}
