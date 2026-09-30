import type { Request, Response } from 'express';
export declare const healthController: {
    live(_req: Request, res: Response): Response<any, Record<string, any>>;
    ready(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
