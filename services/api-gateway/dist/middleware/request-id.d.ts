import type { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            requestId?: string;
            auth?: import('../types').AuthJwtPayload;
            accessToken?: string;
            matchedRoute?: import('../types').ResolvedRoute;
        }
    }
}
export declare function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void;
