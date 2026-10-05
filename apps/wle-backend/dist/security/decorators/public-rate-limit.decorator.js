"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicRateLimited = PublicRateLimited;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const public_decorator_1 = require("../../auth/public.decorator");
function PublicRateLimited(limit = 60, ttlMs = 60000) {
    return (0, common_1.applyDecorators)((0, public_decorator_1.Public)(), (0, throttler_1.Throttle)(limit, Math.max(1, Math.ceil(ttlMs / 1000))));
}
//# sourceMappingURL=public-rate-limit.decorator.js.map