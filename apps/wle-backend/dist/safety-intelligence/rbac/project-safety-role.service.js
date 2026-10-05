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
exports.ProjectSafetyRoleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ProjectSafetyRoleService = class ProjectSafetyRoleService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    listForProject(projectId) {
        return this.prisma.projectSafetyRole.findMany({
            where: { projectId },
            include: {
                user: { select: { id: true, username: true, email: true } },
                company: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'asc' },
        });
    }
    async upsert(input) {
        var _a, _b, _c, _d;
        const project = await this.prisma.project.findUnique({
            where: { id: input.projectId },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const user = await this.prisma.user.findUnique({
            where: { id: input.userId },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return this.prisma.projectSafetyRole.upsert({
            where: {
                projectId_userId: {
                    projectId: input.projectId,
                    userId: input.userId,
                },
            },
            create: {
                projectId: input.projectId,
                userId: input.userId,
                companyId: (_b = (_a = input.companyId) !== null && _a !== void 0 ? _a : user.companyId) !== null && _b !== void 0 ? _b : undefined,
                role: input.role,
            },
            update: {
                role: input.role,
                companyId: (_d = (_c = input.companyId) !== null && _c !== void 0 ? _c : user.companyId) !== null && _d !== void 0 ? _d : undefined,
            },
            include: {
                user: { select: { id: true, username: true } },
                company: { select: { id: true, name: true } },
            },
        });
    }
    async remove(projectId, userId) {
        try {
            await this.prisma.projectSafetyRole.delete({
                where: { projectId_userId: { projectId, userId } },
            });
            return { ok: true };
        }
        catch (_a) {
            throw new common_1.NotFoundException('Project safety role not found');
        }
    }
    async rolesForUser(userId, projectId) {
        return this.prisma.projectSafetyRole.findMany({
            where: Object.assign({ userId }, (projectId ? { projectId } : {})),
        });
    }
};
exports.ProjectSafetyRoleService = ProjectSafetyRoleService;
exports.ProjectSafetyRoleService = ProjectSafetyRoleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectSafetyRoleService);
//# sourceMappingURL=project-safety-role.service.js.map