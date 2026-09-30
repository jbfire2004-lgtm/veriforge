import { createProxyMiddleware, type Options } from 'http-proxy-middleware';
import type { Request, Response } from 'express';
import type { ResolvedRoute } from '../types';
import { logger } from '../utils/logger';

export function createRouteProxy(route: ResolvedRoute) {
  const options: Options<Request> = {
    target: route.target,
    changeOrigin: true,
    pathRewrite: route.pathRewrite,
    on: {
      proxyReq(proxyReq, req) {
        const expressReq = req as Request;
        if (expressReq.requestId) {
          proxyReq.setHeader('x-request-id', expressReq.requestId);
        }
        if (expressReq.auth) {
          proxyReq.setHeader('x-user-id', expressReq.auth.user_id);
          proxyReq.setHeader('x-company-id', expressReq.auth.company_id);
        }
      },
      error(err, req, res) {
        const expressReq = req as Request;
        const expressRes = res as Response;
        logger.error('proxy error', {
          routeId: route.id,
          target: route.target,
          path: expressReq.path,
          error: err.message,
        });
        if (!expressRes.headersSent) {
          expressRes.status(502).json({
            error: 'Upstream service unavailable',
            code: 'BAD_GATEWAY',
            requestId: expressReq.requestId,
          });
        }
      },
    },
  };

  return createProxyMiddleware(options);
}
