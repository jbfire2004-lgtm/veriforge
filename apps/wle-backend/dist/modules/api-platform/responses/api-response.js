"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiOk = apiOk;
exports.apiPaginated = apiPaginated;
function apiOk(data, meta) {
    return Object.assign({ status: 'success', data }, (meta ? { meta } : {}));
}
function apiPaginated(data, pagination, extraMeta) {
    return apiOk(data, Object.assign(Object.assign({}, extraMeta), { pagination }));
}
//# sourceMappingURL=api-response.js.map