import type { Request, Response, NextFunction } from 'express';
export declare function handleValidation(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
export declare function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): Response<any, Record<string, any>>;
