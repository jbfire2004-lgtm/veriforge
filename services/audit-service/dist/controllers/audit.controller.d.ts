import type { Request, Response, NextFunction } from 'express';
export declare const auditController: {
    ingestEvent(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    listEvents(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getEvent(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
};
