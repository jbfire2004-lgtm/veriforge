import type { Request, Response, NextFunction } from 'express';
import type { ResolvedRoute } from '../types';
export declare function createRouteMatcher(routes: ResolvedRoute[]): (req: Request, _res: Response, next: NextFunction) => void;
export declare function isPublicPath(route: ResolvedRoute, path: string): boolean;
