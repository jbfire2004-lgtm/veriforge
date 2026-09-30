import type { Request, Response, NextFunction } from 'express';
export declare const attachmentController: {
    upload(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    getById(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    download(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    thumbnail(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
};
