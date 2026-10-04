import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { API_SUCCESS_KEY } from '../decorators/api-success.decorator';
import { apiOk } from '../responses/api-response';

@Injectable()
export class ApiSuccessInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const useEnvelope = this.reflector.getAllAndOverride<boolean>(
      API_SUCCESS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!useEnvelope) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        if (
          data &&
          typeof data === 'object' &&
          'status' in data &&
          (data as { status: string }).status === 'success'
        ) {
          return data;
        }
        return apiOk(data);
      }),
    );
  }
}
