"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PUBLIC_BASE_URL = void 0;
exports.resolvePublicBaseUrl = resolvePublicBaseUrl;
exports.DEFAULT_PUBLIC_BASE_URL = "http://localhost:5175/vera";
function resolvePublicBaseUrl() {
    var _a, _b;
    return (((_a = process.env.PUBLIC_BASE_URL) === null || _a === void 0 ? void 0 : _a.replace(/\/$/, "")) ||
        ((_b = process.env.FRONTEND_URL) === null || _b === void 0 ? void 0 : _b.replace(/\/$/, "")) ||
        exports.DEFAULT_PUBLIC_BASE_URL);
}
//# sourceMappingURL=public-base-url.js.map