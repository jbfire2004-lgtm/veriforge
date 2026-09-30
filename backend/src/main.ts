import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';
import { join } from 'path';
import { validateServerEnv } from './config/env';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { correlationIdMiddleware } from './common/monitoring/correlation.middleware';
import { securityHeadersMiddleware } from './common/middleware/security-headers.middleware';
import { RequestLoggingInterceptor } from './common/interceptors/request-logging.interceptor';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './server/api/root';
import { createTrpcContext } from './server/api/trpc';

async function bootstrap() {
  const resolved = validateServerEnv();
  process.env.JWT_SECRET = resolved.effectiveJwtSecret;

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Smart Site / focus-audit photos are posted as JSON base64; default 100kb is too small.
  app.useBodyParser('json', { limit: '25mb' });
  app.useBodyParser('urlencoded', { limit: '25mb', extended: true });

  app.use(correlationIdMiddleware);
  app.use(securityHeadersMiddleware);
  if (
    resolved.NODE_ENV === 'production' &&
    resolved.VERA_ENFORCE_HTTPS === true
  ) {
    app.use((req: Request, res: Response, next: NextFunction) => {
      const proto = String(req.headers['x-forwarded-proto'] ?? '');
      if (req.secure || proto.toLowerCase() === 'https') {
        return next();
      }
      res.status(400).json({
        success: false,
        statusCode: 400,
        error: { code: 'HTTPS_REQUIRED', message: 'HTTPS is required' },
      });
    });
  }

  const uploadsDir = join(process.cwd(), 'uploads');
  app.useStaticAssets(uploadsDir, { prefix: '/uploads/' });

  const corsOrigin = process.env.CORS_ORIGIN;
  app.enableCors({
    origin: corsOrigin ? corsOrigin.split(',').map((s) => s.trim()) : true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new RequestLoggingInterceptor());

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use(
    '/api/trpc',
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext: createTrpcContext,
    }),
  );

  await app.listen(resolved.PORT);

  try {
    const { FeedRealtimeGateway } = await import(
      './modules/vera-feed-engine/feed-realtime.gateway'
    );
    const feedRealtime = app.get(FeedRealtimeGateway);
    feedRealtime.attach(app.getHttpServer());
  } catch {
    // Feed realtime optional if module not loaded
  }
}
bootstrap();
