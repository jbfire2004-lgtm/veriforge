"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRouteProxy = createRouteProxy;
const http_proxy_middleware_1 = require("http-proxy-middleware");
const logger_1 = require("../utils/logger");
function createRouteProxy(route) {
    const options = {
        target: route.target,
        changeOrigin: true,
        pathRewrite: route.pathRewrite,
        on: {
            proxyReq(proxyReq, req) {
                const expressReq = req;
                if (expressReq.requestId) {
                    proxyReq.setHeader('x-request-id', expressReq.requestId);
                }
                if (expressReq.auth) {
                    proxyReq.setHeader('x-user-id', expressReq.auth.user_id);
                    proxyReq.setHeader('x-company-id', expressReq.auth.company_id);
                }
            },
            error(err, req, res) {
                const expressReq = req;
                const expressRes = res;
                logger_1.logger.error('proxy error', {
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
    return (0, http_proxy_middleware_1.createProxyMiddleware)(options);
}
//# sourceMappingURL=create-proxy.js.map