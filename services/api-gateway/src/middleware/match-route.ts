import type { Request, Response, NextFunction } from 'express';
import type { ResolvedRoute } from '../types';

export function createRouteMatcher(routes: ResolvedRoute[]) {
  return function matchRoute(req: Request, _res: Response, next: NextFunction) {
    const path = req.path;
    const route = routes.find((r) => path === r.prefix || path.startsWith(`${r.prefix}/`));
    if (route) {
      req.matchedRoute = route;
    }
    next();
  };
}

export function isPublicPath(route: ResolvedRoute, path: string): boolean {
  return route.publicPaths.some((re) => re.test(path));
}
