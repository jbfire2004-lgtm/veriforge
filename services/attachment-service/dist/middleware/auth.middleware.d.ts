import type { Request, Response, NextFunction } from 'express';
import { verifySecureDownloadToken } from '../utils/secure-token';
import type { AuthJwtPayload } from '../types';
declare global {
    namespace Express {
        interface Request {
            auth?: AuthJwtPayload;
            companyId?: string;
            userId?: string;
            downloadToken?: ReturnType<typeof verifySecureDownloadToken>;
        }
    }
}
export declare function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void>;
export declare function requireAuthOrDownloadToken(expectedKind: 'file' | 'thumbnail'): (req: Request, _res: Response, next: NextFunction) => void | Promise<void>;
