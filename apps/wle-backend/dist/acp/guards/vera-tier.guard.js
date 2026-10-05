"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeraTierGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const vera_access_decorator_1 = require("../decorators/vera-access.decorator");
const acp_access_service_1 = require("../acp-access.service");
let VeraTierGuard = class VeraTierGuard {
    constructor(reflector, access) {
        this.reflector = reflector;
        this.access = access;
    }
    async canActivate(context) {
        var _a, _b, _c;
        const minTier = this.reflector.getAllAndOverride(vera_access_decorator_1.VERA_MIN_TIER_KEY, [context.getHandler(), context.getClass()]);
        if (!minTier)
            return true;
        const request = context.switchToHttp().getRequest();
        const userId = (_a = request.user) === null || _a === void 0 ? void 0 : _a.id;
        const legacyRole = (_b = request.user) === null || _b === void 0 ? void 0 : _b.role;
        if (!userId)
            throw new common_1.ForbiddenException('Authentication required');
        if (legacyRole && this.access.isLegacyPlatformAdmin(legacyRole))
            return true;
        const result = await this.access.check({ userId, minTier });
        if (!result.allowed) {
            throw new common_1.ForbiddenException((_c = result.reason) !== null && _c !== void 0 ? _c : 'Subscription tier required');
        }
        return true;
    }
};
exports.VeraTierGuard = VeraTierGuard;
exports.VeraTierGuard = VeraTierGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        acp_access_service_1.AcpAccessService])
], VeraTierGuard);
//# sourceMappingURL=vera-tier.guard.js.map