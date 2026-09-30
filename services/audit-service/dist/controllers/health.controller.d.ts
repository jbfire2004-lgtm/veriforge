import type { Request, Response } from 'express';
export declare const healthController: {
    ready(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    live(_req: Request, res: Response): Response<any, Record<string, any>>;
};
