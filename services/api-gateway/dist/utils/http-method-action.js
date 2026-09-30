"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.actionFromMethod = actionFromMethod;
const METHOD_ACTION = {
    GET: 'read',
    HEAD: 'read',
    OPTIONS: 'read',
    POST: 'create',
    PUT: 'update',
    PATCH: 'update',
    DELETE: 'delete',
};
function actionFromMethod(method) {
    return METHOD_ACTION[method.toUpperCase()] ?? 'execute';
}
//# sourceMappingURL=http-method-action.js.map