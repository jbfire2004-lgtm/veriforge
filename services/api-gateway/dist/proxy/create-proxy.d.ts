import type { Request } from 'express';
import type { ResolvedRoute } from '../types';
export declare function createRouteProxy(route: ResolvedRoute): import("http-proxy-middleware").RequestHandler<Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, import("http").ServerResponse<import("http").IncomingMessage>, (err?: any) => void>;
