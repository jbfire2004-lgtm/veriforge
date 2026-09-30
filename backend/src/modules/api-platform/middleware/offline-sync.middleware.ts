import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export type OfflineSyncContext = {
  clientId?: string;
  syncBatchId?: string;
  offlineMode?: boolean;
};

declare module 'express-serve-static-core' {
  interface Request {
    offlineSync?: OfflineSyncContext;
  }
}

/**
 * Parses field/offline sync headers for batch reconciliation (§6).
 */
@Injectable()
export class OfflineSyncMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    req.offlineSync = {
      clientId: req.header('x-vera-client-id') ?? undefined,
      syncBatchId: req.header('x-vera-sync-batch-id') ?? undefined,
      offlineMode: req.header('x-vera-offline-mode') === '1',
    };
    next();
  }
}
