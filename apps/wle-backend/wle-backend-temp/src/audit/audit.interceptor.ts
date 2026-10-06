import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from './audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private audit: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    const user = req.user;
    const ip = req.ip;
    const userAgent = req.headers['user-agent'] as string | undefined;
    const method = req.method;
    const url = req.originalUrl || req.url;

    return next.handle().pipe(
      tap(async (response) => {
        await this.audit.log({
          userId: user?.id,
          action: `${method} ${url}`,
          metadata: {
            body: req.body,
            params: req.params,
            query: req.query,
            responseStatus: req.res?.statusCode,
          },
          ip,
          userAgent,
        });
      }),
    );
  }
}
