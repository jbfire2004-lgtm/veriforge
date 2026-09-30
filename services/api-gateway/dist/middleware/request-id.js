"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestIdMiddleware = requestIdMiddleware;
const crypto_1 = require("crypto");
function requestIdMiddleware(req, res, next) {
    const incoming = req.headers['x-request-id'];
    const id = typeof incoming === 'string' && incoming.length > 0 ? incoming : (0, crypto_1.randomUUID)();
    req.requestId = id;
    res.setHeader('x-request-id', id);
    next();
}
//# sourceMappingURL=request-id.js.map