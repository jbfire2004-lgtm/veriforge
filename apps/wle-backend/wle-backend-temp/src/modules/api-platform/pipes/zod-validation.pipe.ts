import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import type { ZodSchema } from 'zod';
import { ApiErrorCode } from '../constants/error-codes';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'Validation failed',
        details: { issues: result.error.flatten() },
      });
    }
    return result.data;
  }
}
