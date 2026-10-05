import { NestMiddleware } from '@nestjs/common';
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
export declare class OfflineSyncMiddleware implements NestMiddleware {
    use(req: Request, _res: Response, next: NextFunction): void;
}
