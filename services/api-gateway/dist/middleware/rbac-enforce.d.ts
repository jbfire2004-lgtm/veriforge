import type { Request, Response, NextFunction } from 'express';
export declare function enforceRbac(req: Request, _res: Response, next: NextFunction): Promise<void>;
