"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireAcpPermission = exports.ACP_PERMISSION_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.ACP_PERMISSION_KEY = 'acp_permission';
const RequireAcpPermission = (permission) => (0, common_1.SetMetadata)(exports.ACP_PERMISSION_KEY, permission);
exports.RequireAcpPermission = RequireAcpPermission;
//# sourceMappingURL=acp-permission.decorator.js.map