"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiSuccess = exports.API_SUCCESS_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.API_SUCCESS_KEY = 'vera:api:success';
const ApiSuccess = () => (0, common_1.SetMetadata)(exports.API_SUCCESS_KEY, true);
exports.ApiSuccess = ApiSuccess;
//# sourceMappingURL=api-success.decorator.js.map