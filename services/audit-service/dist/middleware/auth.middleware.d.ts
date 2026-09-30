import type { Request, Response, NextFunction } from 'express';
import type { AuthJwtPayload } from '../types';
declare global {
    namespace Express {
        interface Request {
            auth?: AuthJwtPayload;
            companyId?: string;
            userId?: string;
            /** Set when request authenticated via AUDIT_SERVICE_KEY (trusted internal caller). */
            isServiceCaller?: boolean;
        }
    }
}
export declare function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void>;
/** JWT or shared service key — for high-throughput ingestion from platform services. */
export declare function requireAuthOrServiceKey(req: Request, _res: Response, next: NextFunction): Promise<void>;
