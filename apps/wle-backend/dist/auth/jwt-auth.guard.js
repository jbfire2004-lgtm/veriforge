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
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const passport_1 = require("@nestjs/passport");
const phase1_request_context_storage_1 = require("../common/monitoring/phase1-request-context.storage");
const pm_dev_open_1 = require("../config/pm-dev-open");
const public_decorator_1 = require("./public.decorator");
function isVeriForgeApiPath(url) {
    if (!url)
        return false;
    const path = url.split('?')[0];
    return path === '/veriforge' || path.startsWith('/veriforge/');
}
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
    constructor(reflector) {
        super();
        this.reflector = reflector;
    }
    handleRequest(err, user, info, context, status) {
        const u = super.handleRequest(err, user, info, context, status);
        if (u && typeof u === 'object' && 'id' in u) {
            const store = phase1_request_context_storage_1.phase1RequestStore.getStore();
            if (store) {
                const ju = u;
                if (typeof ju.id === 'number')
                    store.userId = ju.id;
            }
        }
        return u;
    }
    canActivate(context) {
        var _a;
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        if (isVeriForgeApiPath(request.originalUrl || request.url)) {
            return true;
        }
        if ((0, pm_dev_open_1.isVeraPmDevOpen)()) {
            const auth = (_a = request.headers) === null || _a === void 0 ? void 0 : _a.authorization;
            if (!auth || !auth.startsWith('Bearer ')) {
                request.user = (0, pm_dev_open_1.veraPmDevOpenActor)();
                return true;
            }
        }
        return super.canActivate(context);
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map