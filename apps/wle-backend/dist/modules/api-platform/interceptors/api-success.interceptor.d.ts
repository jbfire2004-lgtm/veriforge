import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
export declare class ApiSuccessInterceptor implements NestInterceptor {
    private readonly reflector;
    constructor(reflector: Reflector);
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
}
