"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectScoped = exports.CompanyScoped = exports.PROJECT_SCOPE_KEY = exports.COMPANY_SCOPE_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.COMPANY_SCOPE_KEY = 'vera:scope:company';
exports.PROJECT_SCOPE_KEY = 'vera:scope:project';
const CompanyScoped = (paramName = 'companyId') => (0, common_1.SetMetadata)(exports.COMPANY_SCOPE_KEY, paramName);
exports.CompanyScoped = CompanyScoped;
const ProjectScoped = (paramName = 'projectId') => (0, common_1.SetMetadata)(exports.PROJECT_SCOPE_KEY, paramName);
exports.ProjectScoped = ProjectScoped;
//# sourceMappingURL=scoped.decorator.js.map