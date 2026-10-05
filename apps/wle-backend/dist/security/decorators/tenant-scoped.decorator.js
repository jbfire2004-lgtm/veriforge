"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantScoped = exports.TENANT_SCOPE_PARAM_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.TENANT_SCOPE_PARAM_KEY = 'vera_tenant_scope_param';
const TenantScoped = (paramName = 'companyId') => (0, common_1.SetMetadata)(exports.TENANT_SCOPE_PARAM_KEY, paramName);
exports.TenantScoped = TenantScoped;
//# sourceMappingURL=tenant-scoped.decorator.js.map