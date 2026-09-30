import type { Request, Response, NextFunction } from 'express';
export declare function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void>;
